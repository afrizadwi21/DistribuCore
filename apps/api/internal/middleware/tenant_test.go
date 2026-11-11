package middleware_test

import (
	"net/http/httptest"
	"testing"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func TestRequireTenant(t *testing.T) {
	app := fiber.New()
	app.Get("/tenant-route", middleware.RequireTenant(), func(c *fiber.Ctx) error {
		tid, err := middleware.GetTenantID(c)
		if err != nil || tid == uuid.Nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		return c.SendStatus(fiber.StatusOK)
	})

	validUUID := uuid.New().String()

	tests := []struct {
		name       string
		headerVal  string
		wantStatus int
	}{
		{"missing header", "", fiber.StatusBadRequest},
		{"malformed uuid", "not-a-valid-uuid", fiber.StatusBadRequest},
		{"nil uuid", uuid.Nil.String(), fiber.StatusBadRequest},
		{"valid tenant uuid", validUUID, fiber.StatusOK},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/tenant-route", nil)
			if tc.headerVal != "" {
				req.Header.Set("X-Tenant-ID", tc.headerVal)
			}
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("unexpected app.Test error: %v", err)
			}
			if resp.StatusCode != tc.wantStatus {
				t.Errorf("got %d, want %d", resp.StatusCode, tc.wantStatus)
			}
		})
	}
}

func TestRequireTenant_PreResolved(t *testing.T) {
	app := fiber.New()
	expectedID := uuid.New()
	app.Get("/pre-resolved", func(c *fiber.Ctx) error {
		c.Locals(middleware.TenantIDKey, expectedID)
		return c.Next()
	}, middleware.RequireTenant(), func(c *fiber.Ctx) error {
		tid, _ := middleware.GetTenantID(c)
		if tid != expectedID {
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest("GET", "/pre-resolved", nil)
	resp, _ := app.Test(req)
	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("got %d, want 200", resp.StatusCode)
	}
}
