package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PartnerHandler struct {
	repo *repository.PartnerRepository
}

func NewPartnerHandler(repo *repository.PartnerRepository) *PartnerHandler {
	return &PartnerHandler{repo: repo}
}

type CreateCustomerRequest struct {
	Code             string     `json:"code"`
	CompanyName      string     `json:"company_name"`
	ContactPerson    *string    `json:"contact_person"`
	Email            *string    `json:"email"`
	Phone            *string    `json:"phone"`
	PriceTierID      *uuid.UUID `json:"price_tier_id"`
	CreditLimitCents int64      `json:"credit_limit_cents"`
	PaymentTermsDays int        `json:"payment_terms_days"`
}

type CreateSupplierRequest struct {
	Code             string  `json:"code"`
	CompanyName      string  `json:"company_name"`
	ContactPerson    *string `json:"contact_person"`
	Email            *string `json:"email"`
	Phone            *string `json:"phone"`
	PaymentTermsDays int     `json:"payment_terms_days"`
}

// CreateCustomer handles customer creation.
func (h *PartnerHandler) CreateCustomer(c *fiber.Ctx) error {
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

	var req CreateCustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.Code == "" || req.CompanyName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Customer code and company_name are required",
			},
		})
	}

	if req.PaymentTermsDays <= 0 {
		req.PaymentTermsDays = 30
	}

	customer := &repository.Customer{
		TenantID:         tenantID,
		Code:             req.Code,
		CompanyName:      req.CompanyName,
		ContactPerson:    req.ContactPerson,
		Email:            req.Email,
		Phone:            req.Phone,
		PriceTierID:      req.PriceTierID,
		CreditLimitCents: req.CreditLimitCents,
		PaymentTermsDays: req.PaymentTermsDays,
		IsCreditHeld:     false,
		IsActive:         true,
	}

	created, err := h.repo.CreateCustomer(c.Context(), customer)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_CUSTOMER_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    created,
	})
}

// ListCustomers retrieves all customers for the tenant.
func (h *PartnerHandler) ListCustomers(c *fiber.Ctx) error {
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

	customers, err := h.repo.ListCustomersByTenant(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_CUSTOMERS_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    customers,
	})
}

// CreateSupplier handles supplier creation.
func (h *PartnerHandler) CreateSupplier(c *fiber.Ctx) error {
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

	var req CreateSupplierRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.Code == "" || req.CompanyName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Supplier code and company_name are required",
			},
		})
	}

	if req.PaymentTermsDays <= 0 {
		req.PaymentTermsDays = 30
	}

	supplier := &repository.Supplier{
		TenantID:         tenantID,
		Code:             req.Code,
		CompanyName:      req.CompanyName,
		ContactPerson:    req.ContactPerson,
		Email:            req.Email,
		Phone:            req.Phone,
		PaymentTermsDays: req.PaymentTermsDays,
		IsActive:         true,
	}

	created, err := h.repo.CreateSupplier(c.Context(), supplier)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "CREATE_SUPPLIER_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    created,
	})
}

// ListSuppliers retrieves all suppliers for the tenant.
func (h *PartnerHandler) ListSuppliers(c *fiber.Ctx) error {
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

	suppliers, err := h.repo.ListSuppliersByTenant(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "FETCH_SUPPLIERS_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    suppliers,
	})
}
