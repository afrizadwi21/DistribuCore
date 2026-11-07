package handler

import (
	"errors"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type RegisterTenantRequest struct {
	TenantCode string `json:"tenant_code"`
	TenantName string `json:"tenant_name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	FullName   string `json:"full_name"`
}

type LoginRequest struct {
	TenantCode string `json:"tenant_code"`
	Email      string `json:"email"`
	Password   string `json:"password"`
}

// RegisterTenant handles tenant and primary admin account registration.
func (h *AuthHandler) RegisterTenant(c *fiber.Ctx) error {
	var req RegisterTenantRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.TenantCode == "" || req.TenantName == "" || req.Email == "" || len(req.Password) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Tenant code, name, email, and a password of at least 8 characters are required",
			},
		})
	}

	tokens, err := h.svc.RegisterTenant(c.Context(), req.TenantCode, req.TenantName, req.Email, req.Password, req.FullName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "REGISTRATION_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    tokens,
	})
}

// Login validates user credentials within a tenant and issues tokens.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INVALID_REQUEST_BODY",
				"message": "Unable to parse request JSON payload",
			},
		})
	}

	if req.TenantCode == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "VALIDATION_ERROR",
				"message": "Tenant code, email, and password must not be empty",
			},
		})
	}

	tokens, err := h.svc.Login(c.Context(), req.TenantCode, req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "INVALID_CREDENTIALS",
					"message": "Invalid email, password, or tenant code",
				},
			})
		}
		if errors.Is(err, service.ErrUserInactive) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "USER_DEACTIVATED",
					"message": "Your account has been deactivated. Contact your administrator.",
				},
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "LOGIN_FAILED",
				"message": err.Error(),
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tokens,
	})
}

// GetMe returns profile and assigned roles for the current authenticated user.
func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
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

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "UNAUTHORIZED",
				"message": "User session is invalid",
			},
		})
	}

	user, err := h.svc.GetCurrentUser(c.Context(), tenantID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "USER_NOT_FOUND",
				"message": "User profile could not be located",
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}
