package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	repo *repository.AnalyticsRepository
}

func NewAnalyticsHandler(repo *repository.AnalyticsRepository) *AnalyticsHandler {
	return &AnalyticsHandler{repo: repo}
}

// GetExecutiveKPIs handles requests for high-level business KPIs.
func (h *AnalyticsHandler) GetExecutiveKPIs(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	kpis, err := h.repo.GetExecutiveKPIs(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": kpis})
}

// GetSalesVelocity handles requests for top performing SKUs.
func (h *AnalyticsHandler) GetSalesVelocity(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	velocity, err := h.repo.GetSalesVelocity(c.Context(), tenantID, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": velocity})
}

// GetInventoryHealth handles requests for stock health and replenishment warnings.
func (h *AnalyticsHandler) GetInventoryHealth(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	health, err := h.repo.GetInventoryHealth(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": health})
}
