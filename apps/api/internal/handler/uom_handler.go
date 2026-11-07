package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type UOMHandler struct {
	repo *repository.UOMRepository
}

func NewUOMHandler(repo *repository.UOMRepository) *UOMHandler {
	return &UOMHandler{repo: repo}
}

type CreateUOMRequest struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	IsBaseUnit bool   `json:"is_base_unit"`
}

// Create handles creating a new Unit of Measure for the authenticated tenant.
func (h *UOMHandler) Create(c *fiber.Ctx) error {
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

	var req CreateUOMRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.Code == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "UOM code and name are required fields",
			},
		})
	}

	uom, err := h.repo.Create(c.Context(), tenantID, req.Code, req.Name, req.IsBaseUnit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_UOM_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    uom,
	})
}

// List retrieves all units of measure for the authenticated tenant.
func (h *UOMHandler) List(c *fiber.Ctx) error {
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

	uoms, err := h.repo.ListByTenant(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_UOMS_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    uoms,
	})
}
