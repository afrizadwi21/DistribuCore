package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type InventoryHandler struct {
	repo *repository.InventoryRepository
}

func NewInventoryHandler(repo *repository.InventoryRepository) *InventoryHandler {
	return &InventoryHandler{repo: repo}
}

type StockAdjustmentRequest struct {
	WarehouseID     uuid.UUID `json:"warehouse_id"`
	BinID           uuid.UUID `json:"bin_id"`
	ProductID       uuid.UUID `json:"product_id"`
	QuantityDelta   float64   `json:"quantity_delta"`
	TransactionType string    `json:"transaction_type"`
	Notes           string    `json:"notes"`
}

// AdjustStock handles stock adjustments (cycle counts, initial stock, damages).
func (h *InventoryHandler) AdjustStock(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "TENANT_NOT_FOUND",
				"message": err.Error(),
			},
		})
	}

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		userID = uuid.New()
	}

	var req StockAdjustmentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.WarehouseID == uuid.Nil || req.BinID == uuid.Nil || req.ProductID == uuid.Nil || req.QuantityDelta == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Warehouse, Bin, Product IDs and non-zero QuantityDelta are required",
			},
		})
	}

	if req.TransactionType == "" {
		req.TransactionType = "ADJUSTMENT_CYCLE_COUNT"
	}

	payload := repository.StockAdjustmentPayload{
		TenantID:        tenantID,
		WarehouseID:     req.WarehouseID,
		BinID:           req.BinID,
		ProductID:       req.ProductID,
		QuantityDelta:   req.QuantityDelta,
		TransactionType: req.TransactionType,
		ReferenceType:   "STOCK_ADJUSTMENT",
		ReferenceID:     uuid.New(),
		PerformedBy:     userID,
		Notes:           req.Notes,
	}

	balance, err := h.repo.AdjustStock(c.Context(), payload)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "ADJUSTMENT_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    balance,
		"message": "Stock balance updated and transaction logged to ledger successfully",
	})
}

// ListBalances retrieves on-hand balances for a given warehouse.
func (h *InventoryHandler) ListBalances(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "TENANT_NOT_FOUND",
				"message": err.Error(),
			},
		})
	}

	warehouseID, err := uuid.Parse(c.Params("warehouseId"))
	if err != nil || warehouseID == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_WAREHOUSE_ID",
				"message": "Supplied warehouse ID is not a valid UUID",
			},
		})
	}

	balances, err := h.repo.ListBalancesByWarehouse(c.Context(), tenantID, warehouseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_BALANCES_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    balances,
	})
}
