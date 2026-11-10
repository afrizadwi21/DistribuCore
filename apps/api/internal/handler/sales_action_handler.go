package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetSalesOrderByID retrieves a single sales order by ID.
func (h *SalesHandler) GetSalesOrderByID(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid order UUID"}})
	}

	order, err := h.repo.GetSalesOrderByID(c.Context(), tenantID, orderID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "ORDER_NOT_FOUND", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": order})
}

// ConfirmAndReserve locks physical inventory against confirmed sales order items.
func (h *SalesHandler) ConfirmAndReserve(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid order UUID"}})
	}

	var req struct {
		WarehouseID uuid.UUID `json:"warehouse_id"`
	}
	if err := c.BodyParser(&req); err != nil || req.WarehouseID == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "warehouse_id is required for reservation"}})
	}

	confirmed, err := h.repo.ConfirmAndReserveStock(c.Context(), tenantID, orderID, req.WarehouseID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "RESERVATION_FAILED", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": confirmed})
}

// CancelOrder cancels the sales order and releases all active stock reservations.
func (h *SalesHandler) CancelOrder(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid order UUID"}})
	}

	cancelled, err := h.repo.CancelAndReleaseStock(c.Context(), tenantID, orderID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "CANCEL_FAILED", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": cancelled})
}
