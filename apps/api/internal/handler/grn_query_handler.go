package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ListGoodsReceipts lists GRNs with pagination.
func (h *PurchaseHandler) ListGoodsReceipts(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	var poIDPtr *uuid.UUID
	if poStr := c.Query("purchase_order_id"); poStr != "" {
		if poID, err := uuid.Parse(poStr); err == nil {
			poIDPtr = &poID
		}
	}

	grns, total, err := h.repo.ListGoodsReceiptNotes(c.Context(), tenantID, poIDPtr, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": grns, "meta": fiber.Map{"page": page, "limit": limit, "total_records": total}})
}

// GetGoodsReceiptByID retrieves a single GRN with its items.
func (h *PurchaseHandler) GetGoodsReceiptByID(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	grnID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid GRN UUID"}})
	}

	grn, err := h.repo.GetGoodsReceiptNoteByID(c.Context(), tenantID, grnID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "GRN_NOT_FOUND", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": grn})
}
