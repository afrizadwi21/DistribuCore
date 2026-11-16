package handler

import (
	"encoding/json"
	"strings"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type TeamHandler struct {
	repo *repository.AuthRepository
}

func NewTeamHandler(repo *repository.AuthRepository) *TeamHandler {
	return &TeamHandler{repo: repo}
}

func (h *TeamHandler) ListUsers(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	users, err := h.repo.ListTenantUsers(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": users})
}

func (h *TeamHandler) CreateUser(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		FullName string `json:"full_name"`
		Role     string `json:"role"`
	}
	if err := c.BodyParser(&req); err != nil || req.Email == "" || req.Password == "" || req.FullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Email, full_name, and password are required"}})
	}
	role := strings.ToUpper(strings.TrimSpace(req.Role))
	if role == "" {
		role = "STAFF"
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Failed to hash password"}})
	}
	u, err := h.repo.CreateTenantUser(c.Context(), tenantID, strings.ToLower(strings.TrimSpace(req.Email)), string(hash), strings.TrimSpace(req.FullName), role)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": u})
}

func (h *TeamHandler) UpdateUser(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Invalid user ID"}})
	}
	var req struct {
		Role     string `json:"role"`
		FullName string `json:"full_name"`
		IsActive *bool  `json:"is_active"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Invalid request payload"}})
	}
	if err := h.repo.UpdateUserRole(c.Context(), tenantID, userID, strings.ToUpper(strings.TrimSpace(req.Role)), strings.TrimSpace(req.FullName), req.IsActive); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true})
}

func (h *TeamHandler) DeleteUser(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false})
	}
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false})
	}
	if callerID, ok := c.Locals(middleware.UserIDKey).(uuid.UUID); ok && callerID == userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Cannot delete active session user"}})
	}
	_ = h.repo.DeleteTenantUser(c.Context(), tenantID, userID)
	return c.JSON(fiber.Map{"success": true})
}

func (h *TeamHandler) GetState(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false})
	}
	raw, _ := h.repo.GetWorkspaceState(c.Context(), tenantID)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "data": json.RawMessage(raw)})
}

func (h *TeamHandler) SaveState(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false})
	}
	body := c.Body()
	if len(body) == 0 {
		body = []byte("{}")
	}
	if len(body) > 262144 || !json.Valid(body) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": "Invalid or oversized state payload"}})
	}
	if err := h.repo.SaveWorkspaceState(c.Context(), tenantID, body); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true})
}
