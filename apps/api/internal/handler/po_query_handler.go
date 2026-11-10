package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ListPurchaseOrders returns a paginated list of purchase orders for the tenant.
func (h *PurchaseHandler) ListPurchaseOrders(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	status := c.Query("status", "")

	var supplierIDPtr *uuid.UUID
	if suppStr := c.Query("supplier_id"); suppStr != "" {
		if suppID, err := uuid.Parse(suppStr); err == nil {
			supplierIDPtr = &suppID
		}
	}

	orders, total, err := h.repo.ListPurchaseOrders(c.Context(), tenantID, supplierIDPtr, status, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": orders, "meta": fiber.Map{"page": page, "limit": limit, "total_records": total}})
}

// GetPurchaseOrderByID retrieves a single purchase order by ID with line items.
func (h *PurchaseHandler) GetPurchaseOrderByID(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	poID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid purchase order UUID"}})
	}

	po, err := h.repo.GetPurchaseOrderByID(c.Context(), tenantID, poID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "PO_NOT_FOUND", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": po})
}

// UpdatePOStatus changes status of a purchase order (e.g. APPROVED, SUBMITTED, CANCELLED).
func (h *PurchaseHandler) UpdatePOStatus(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	poID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid purchase order UUID"}})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_BODY", "message": "Valid status is required"}})
	}

	updated, err := h.repo.UpdatePOStatus(c.Context(), tenantID, poID, repository.PurchaseOrderStatus(req.Status))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "UPDATE_FAILED", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": updated})
}
