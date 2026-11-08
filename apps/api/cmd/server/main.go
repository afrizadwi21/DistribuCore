package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/afrizadwi21/distribucore/apps/api/internal/config"
	"github.com/afrizadwi21/distribucore/apps/api/internal/database"
	"github.com/afrizadwi21/distribucore/apps/api/internal/handler"
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/afrizadwi21/distribucore/apps/api/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// 1. Load Application Configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to initialize configuration: %v", err)
	}

	ctx := context.Background()

	// 2. Initialize Database Pools (PostgreSQL & Redis)
	pgDB, err := database.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("[WARN] PostgreSQL not reachable at startup: %v (API will run in degraded mode)", err)
	} else {
		defer pgDB.Close()
		log.Println("[INFO] Successfully connected to PostgreSQL connection pool")
	}

	redisClient, err := database.NewRedisClient(ctx, cfg.RedisURL)
	if err != nil {
		log.Printf("[WARN] Redis not reachable at startup: %v", err)
	} else {
		defer redisClient.Close()
		log.Println("[INFO] Successfully connected to Redis")
	}

	// 3. Initialize Fiber Application
	app := fiber.New(fiber.Config{
		AppName:               "DistribuCore API v1.0",
		ServerHeader:          "DistribuCore",
		DisableStartupMessage: false,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "SERVER_ERROR",
					"message": err.Error(),
				},
			})
		},
	})

	// 4. Global Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowedCORS,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Tenant-ID, Idempotency-Key",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// 5. Health & Interactive Scalar API Documentation
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"service":   "distribucore-api",
			"env":       cfg.AppEnv,
			"timestamp": time.Now().UTC(),
		})
	})

	// Serve OpenAPI JSON schema
	app.Get("/api/v1/openapi.json", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.SendFile("./docs/openapi.json")
	})

	// Interactive Scalar API Documentation UI
	app.Get("/docs", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/html; charset=utf-8")
		html := `<!doctype html>
<html>
  <head>
    <title>DistribuCore API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="https://scalar.com/favicon.svg" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/v1/openapi.json"
      data-configuration='{"theme":"purple","layout":"modern"}'>
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`
		return c.SendString(html)
	})

	api := app.Group("/api/v1")
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "operational",
			"framework": "Go Fiber v2",
			"timestamp": time.Now().UTC(),
		})
	})

	// 6. Auth Service & Handlers Registration
	if pgDB != nil && pgDB.Pool != nil {
		authRepo := repository.NewAuthRepository(pgDB.Pool)
		authSvc := service.NewAuthService(authRepo, cfg.JWTSecret, cfg.JWTExpiryHrs)
		authHandler := handler.NewAuthHandler(authSvc)

		authRoutes := api.Group("/auth")
		authRoutes.Post("/register-tenant", authHandler.RegisterTenant)
		authRoutes.Post("/login", authHandler.Login)
		authRoutes.Get("/me", middleware.RequireAuth(cfg.JWTSecret), authHandler.GetMe)

		// 7. Master Data Catalog Handlers Registration
		uomRepo := repository.NewUOMRepository(pgDB.Pool)
		uomHandler := handler.NewUOMHandler(uomRepo)

		productRepo := repository.NewProductRepository(pgDB.Pool)
		productHandler := handler.NewProductHandler(productRepo)

		catalogRoutes := api.Group("/catalog", middleware.RequireAuth(cfg.JWTSecret))
		catalogRoutes.Post("/uom", uomHandler.Create)
		catalogRoutes.Get("/uom", uomHandler.List)
		catalogRoutes.Post("/products", productHandler.Create)
		catalogRoutes.Get("/products", productHandler.List)
		catalogRoutes.Get("/products/:id", productHandler.GetByID)

		// 8. Business Partners Handlers Registration (Customers & Suppliers)
		partnerRepo := repository.NewPartnerRepository(pgDB.Pool)
		partnerHandler := handler.NewPartnerHandler(partnerRepo)

		partnerRoutes := api.Group("/partners", middleware.RequireAuth(cfg.JWTSecret))
		partnerRoutes.Post("/customers", partnerHandler.CreateCustomer)
		partnerRoutes.Get("/customers", partnerHandler.ListCustomers)
		partnerRoutes.Post("/suppliers", partnerHandler.CreateSupplier)
		partnerRoutes.Get("/suppliers", partnerHandler.ListSuppliers)

		// 9. Warehouse & Bin Locations Handlers Registration
		warehouseRepo := repository.NewWarehouseRepository(pgDB.Pool)
		warehouseHandler := handler.NewWarehouseHandler(warehouseRepo)

		warehouseRoutes := api.Group("/inventory", middleware.RequireAuth(cfg.JWTSecret))
		warehouseRoutes.Post("/warehouses", warehouseHandler.CreateWarehouse)
		warehouseRoutes.Get("/warehouses", warehouseHandler.ListWarehouses)
		warehouseRoutes.Post("/warehouses/:warehouseId/bins", warehouseHandler.CreateBin)
		warehouseRoutes.Get("/warehouses/:warehouseId/bins", warehouseHandler.ListBins)
	}

	// 7. Protected Tenant Context Verification Route
	tenantRoutes := api.Group("/tenant", middleware.RequireAuth(cfg.JWTSecret))
	tenantRoutes.Get("/context", func(c *fiber.Ctx) error {
		tenantID, _ := middleware.GetTenantID(c)
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"tenant_id": tenantID,
				"message":   "Tenant context successfully resolved from authenticated session",
			},
		})
	})

	// 8. Start Server with Graceful Shutdown
	addr := fmt.Sprintf(":%s", cfg.Port)
	go func() {
		if err := app.Listen(addr); err != nil {
			log.Printf("Server shut down: %v", err)
		}
	}()

	log.Printf("DistribuCore Fiber API running on %s (env: %s)", addr, cfg.AppEnv)

	// Listen for OS interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down DistribuCore server gracefully...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("DistribuCore server exited cleanly.")
}
