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
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
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

	// 2. Initialize Fiber Application
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

	// 3. Global Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowedCORS,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Tenant-ID, Idempotency-Key",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// 4. Base Health Endpoints
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"service":   "distribucore-api",
			"env":       cfg.AppEnv,
			"timestamp": time.Now().UTC(),
		})
	})

	api := app.Group("/api/v1")
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "operational",
			"framework": "Go Fiber v2",
			"timestamp": time.Now().UTC(),
		})
	})

	// 5. Protected Tenant Route Group Example
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

	// 6. Start Server with Graceful Shutdown
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("DistribuCore server exited cleanly.")
}
