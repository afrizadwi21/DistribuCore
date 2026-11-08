package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type WarehouseHandler struct {
	repo *repository.WarehouseRepository
}

func NewWarehouseHandler(repo *repository.WarehouseRepository) *WarehouseHandler {
	return &WarehouseHandler{repo: repo}
}

type CreateWarehouseRequest struct {
	Code          string  `json:"code"`
	Name          string  `json:"name"`
	AddressLine   *string `json:"address_line"`
	City          *string `json:"city"`
	StateProvince *string `json:"state_province"`
	PostalCode    *string `json:"postal_code"`
}

type CreateBinRequest struct {
	Code string  `json:"code"`
	Zone *string `json:"zone"`
}

// CreateWarehouse handles storage facility creation.
func (h *WarehouseHandler) CreateWarehouse(c *fiber.Ctx) error {
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

	var req CreateWarehouseRequest
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
				"message": "Warehouse code and name are required",
			},
		})
	}

	wh := &repository.Warehouse{
		TenantID:      tenantID,
		Code:          req.Code,
		Name:          req.Name,
		AddressLine:   req.AddressLine,
		City:          req.City,
		StateProvince: req.StateProvince,
		PostalCode:    req.PostalCode,
		IsActive:      true,
	}

	created, err := h.repo.CreateWarehouse(c.Context(), wh)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_WAREHOUSE_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    created,
	})
}

// ListWarehouses retrieves all warehouses for a tenant.
func (h *WarehouseHandler) ListWarehouses(c *fiber.Ctx) error {
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

	list, err := h.repo.ListWarehousesByTenant(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_WAREHOUSES_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    list,
	})
}

// CreateBin handles bin/shelf creation in a warehouse.
func (h *WarehouseHandler) CreateBin(c *fiber.Ctx) error {
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

	var req CreateBinRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Bin code is required (e.g. A1-R02-B04)",
			},
		})
	}

	bin := &repository.WarehouseBin{
		TenantID:    tenantID,
		WarehouseID: warehouseID,
		Code:        req.Code,
		Zone:        req.Zone,
		IsActive:    true,
	}

	created, err := h.repo.CreateBin(c.Context(), bin)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_BIN_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    created,
	})
}

// ListBins retrieves all bins inside a specific warehouse.
func (h *WarehouseHandler) ListBins(c *fiber.Ctx) error {
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

	bins, err := h.repo.ListBinsByWarehouse(c.Context(), tenantID, warehouseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_BINS_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    bins,
	})
}
