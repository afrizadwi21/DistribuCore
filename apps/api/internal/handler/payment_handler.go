package handler

import (
	"time"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type RecordPaymentReq struct {
	PaymentNumber   string    `json:"payment_number"`
	CustomerID      uuid.UUID `json:"customer_id"`
	PaymentMethod   string    `json:"payment_method"`
	AmountCents     int64     `json:"amount_cents"`
	ReferenceNumber *string   `json:"reference_number"`
	InvoiceID       uuid.UUID `json:"invoice_id"`
	AllocateCents   int64     `json:"allocate_cents"`
}

// RecordPayment records customer incoming payment and allocates it to open invoice.
func (h *BillingHandler) RecordPayment(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		userID = uuid.New()
	}

	var req RecordPaymentReq
	if err := c.BodyParser(&req); err != nil || req.PaymentNumber == "" || req.CustomerID == uuid.Nil || req.AmountCents <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "payment_number, customer_id, and positive amount_cents are required"}})
	}

	payment := &repository.CustomerPayment{
		TenantID: tenantID, PaymentNumber: req.PaymentNumber, CustomerID: req.CustomerID,
		PaymentMethod: req.PaymentMethod, PaymentDate: time.Now(), AmountCents: req.AmountCents,
		ReferenceNumber: req.ReferenceNumber, ReceivedBy: userID,
	}

	saved, err := h.repo.RecordPaymentAndAllocate(c.Context(), payment, req.InvoiceID, req.AllocateCents)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "PAYMENT_FAILED", "message": err.Error()}})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": saved})
}

// GetARAging retrieves the accounts receivable aging schedule across clients.
func (h *BillingHandler) GetARAging(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	aging, err := h.repo.GetARAgingReport(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": aging})
}
