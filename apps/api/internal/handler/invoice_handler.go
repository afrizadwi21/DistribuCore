package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BillingHandler struct {
	repo *repository.BillingRepository
}

func NewBillingHandler(repo *repository.BillingRepository) *BillingHandler {
	return &BillingHandler{repo: repo}
}

type GenerateInvoiceReq struct {
	DeliveryOrderID uuid.UUID `json:"delivery_order_id"`
	InvoiceNumber   string    `json:"invoice_number"`
}

// GenerateInvoice creates an invoice from a fulfilled delivery order (POD).
func (h *BillingHandler) GenerateInvoice(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	var req GenerateInvoiceReq
	if err := c.BodyParser(&req); err != nil || req.DeliveryOrderID == uuid.Nil || req.InvoiceNumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "delivery_order_id and invoice_number are required"}})
	}

	inv, err := h.repo.GenerateInvoiceFromDelivery(c.Context(), tenantID, req.DeliveryOrderID, req.InvoiceNumber)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVOICE_FAILED", "message": err.Error()}})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": inv})
}

// ListInvoices returns paginated customer invoices.
func (h *BillingHandler) ListInvoices(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	var custIDPtr *uuid.UUID
	if cidStr := c.Query("customer_id"); cidStr != "" {
		if cid, err := uuid.Parse(cidStr); err == nil {
			custIDPtr = &cid
		}
	}

	invoices, total, err := h.repo.ListCustomerInvoices(c.Context(), tenantID, custIDPtr, c.Query("status", ""), page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": invoices, "meta": fiber.Map{"page": page, "limit": limit, "total_records": total}})
}

// GetInvoiceByID returns a single invoice with line items.
func (h *BillingHandler) GetInvoiceByID(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	invID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid invoice UUID"}})
	}

	inv, err := h.repo.GetInvoiceByID(c.Context(), tenantID, invID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVOICE_NOT_FOUND", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": inv})
}
