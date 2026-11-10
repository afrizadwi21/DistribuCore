package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetDeliveryOrderByID retrieves a delivery order with its items.
func (h *FulfillmentHandler) GetDeliveryOrderByID(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	doID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid delivery order UUID"}})
	}

	order, err := h.repo.GetDeliveryOrderByID(c.Context(), tenantID, doID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DO_NOT_FOUND", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": order})
}

// DispatchOrder marks a delivery order as dispatched in transit.
func (h *FulfillmentHandler) DispatchOrder(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	doID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid delivery order UUID"}})
	}

	dispatched, err := h.repo.DispatchDeliveryOrder(c.Context(), tenantID, doID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DISPATCH_FAILED", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": dispatched})
}

type SubmitPODReq struct {
	RecipientName         string  `json:"recipient_name"`
	RecipientSignatureURL *string `json:"recipient_signature_url"`
	DeliveryPhotoURL      *string `json:"delivery_photo_url"`
}

// SubmitPOD records customer proof of delivery, deducts physical stock, and completes reservation.
func (h *FulfillmentHandler) SubmitPOD(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	doID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_ID", "message": "Invalid delivery order UUID"}})
	}

	var req SubmitPODReq
	if err := c.BodyParser(&req); err != nil || req.RecipientName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "recipient_name is required"}})
	}

	pod := &repository.ProofOfDelivery{
		TenantID: tenantID, DeliveryOrderID: doID, RecipientName: req.RecipientName,
		RecipientSignatureURL: req.RecipientSignatureURL, DeliveryPhotoURL: req.DeliveryPhotoURL,
	}

	confirmed, err := h.repo.SubmitProofOfDelivery(c.Context(), pod)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "POD_FAILED", "message": err.Error()}})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": confirmed})
}
