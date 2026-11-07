package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProductHandler struct {
	repo *repository.ProductRepository
}

func NewProductHandler(repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

type CreateProductRequest struct {
	CategoryID          *uuid.UUID `json:"category_id"`
	SKU                 string     `json:"sku"`
	Barcode             *string    `json:"barcode"`
	Name                string     `json:"name"`
	Description         *string    `json:"description"`
	BaseUOMID           uuid.UUID  `json:"base_uom_id"`
	SafetyStockQuantity float64    `json:"safety_stock_quantity"`
	ReorderPointQuantity float64   `json:"reorder_point_quantity"`
	IsActive            *bool      `json:"is_active"`
}

// Create handles creating a new master product SKU for the authenticated tenant.
func (h *ProductHandler) Create(c *fiber.Ctx) error {
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

	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.SKU == "" || req.Name == "" || req.BaseUOMID == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "SKU, product name, and base_uom_id are required fields",
			},
		})
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	product := &repository.Product{
		TenantID:            tenantID,
		CategoryID:          req.CategoryID,
		SKU:                 req.SKU,
		Barcode:             req.Barcode,
		Name:                req.Name,
		Description:         req.Description,
		BaseUOMID:           req.BaseUOMID,
		SafetyStockQuantity: req.SafetyStockQuantity,
		ReorderPointQuantity: req.ReorderPointQuantity,
		IsActive:            isActive,
	}

	created, err := h.repo.Create(c.Context(), product)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_PRODUCT_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    created,
	})
}

// List handles paginated product retrieval for the authenticated tenant.
func (h *ProductHandler) List(c *fiber.Ctx) error {
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

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	products, err := h.repo.ListByTenant(c.Context(), tenantID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_PRODUCTS_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    products,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
		},
	})
}

// GetByID handles retrieving a single product by ID.
func (h *ProductHandler) GetByID(c *fiber.Ctx) error {
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

	id, err := uuid.Parse(c.Params("id"))
	if err != nil || id == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_PRODUCT_ID",
				"message": "Supplied product ID is not a valid UUID",
			},
		})
	}

	product, err := h.repo.GetByID(c.Context(), tenantID, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "PRODUCT_NOT_FOUND",
				"message": "Product could not be located",
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    product,
	})
}
