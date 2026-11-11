package middleware_test

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func generateTestToken(secret string, expired bool) string {
	exp := time.Now().Add(1 * time.Hour)
	if expired {
		exp = time.Now().Add(-1 * time.Hour)
	}
	claims := &middleware.JWTClaims{
		UserID:   uuid.New(),
		TenantID: uuid.New(),
		Email:    "test@example.com",
		Roles:    []string{"admin", "dispatcher"},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := t.SignedString([]byte(secret))
	return tokenStr
}

func TestRequireAuth(t *testing.T) {
	const secret = "test-secret-key-123"
	app := fiber.New()
	app.Get("/protected", middleware.RequireAuth(secret), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	tests := []struct {
		name       string
		authHeader string
		wantStatus int
	}{
		{"missing header", "", fiber.StatusUnauthorized},
		{"malformed header", "Basic xyz123", fiber.StatusUnauthorized},
		{"expired token", "Bearer " + generateTestToken(secret, true), fiber.StatusUnauthorized},
		{"wrong secret token", "Bearer " + generateTestToken("other-secret", false), fiber.StatusUnauthorized},
		{"valid token", "Bearer " + generateTestToken(secret, false), fiber.StatusOK},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/protected", nil)
			if tc.authHeader != "" {
				req.Header.Set("Authorization", tc.authHeader)
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

func TestRequireRole(t *testing.T) {
	app := fiber.New()
	app.Get("/admin-only", func(c *fiber.Ctx) error {
		c.Locals(middleware.UserRolesKey, []string{"dispatcher"})
		return c.Next()
	}, middleware.RequireRole("admin"), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest("GET", "/admin-only", nil)
	resp, _ := app.Test(req)
	if resp.StatusCode != fiber.StatusForbidden {
		t.Errorf("got %d, want %d", resp.StatusCode, fiber.StatusForbidden)
	}
}
