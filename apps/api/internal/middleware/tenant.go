package middleware

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const TenantIDKey = "tenant_id"

var ErrTenantMissing = errors.New("tenant identifier is missing or invalid")

// RequireTenant extracts and enforces the presence of a valid UUID tenant_id
func RequireTenant() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// First check if already resolved by Auth middleware
		if tid, ok := c.Locals(TenantIDKey).(uuid.UUID); ok && tid != uuid.Nil {
			return c.Next()
		}

		// Fallback to X-Tenant-ID header (for pre-auth or public tenant routes)
		tenantHeader := c.Get("X-Tenant-ID")
		if tenantHeader == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "TENANT_HEADER_MISSING",
					"message": "X-Tenant-ID header is required for this request",
				},
			})
		}

		tenantID, err := uuid.Parse(tenantHeader)
		if err != nil || tenantID == uuid.Nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "INVALID_TENANT_ID",
					"message": "Provided tenant identifier is not a valid UUID",
				},
			})
		}

		c.Locals(TenantIDKey, tenantID)
		return c.Next()
	}
}

// GetTenantID retrieves the resolved UUID tenant_id from Fiber context
func GetTenantID(c *fiber.Ctx) (uuid.UUID, error) {
	val := c.Locals(TenantIDKey)
	if val == nil {
		return uuid.Nil, ErrTenantMissing
	}
	tenantID, ok := val.(uuid.UUID)
	if !ok || tenantID == uuid.Nil {
		return uuid.Nil, ErrTenantMissing
	}
	return tenantID, nil
}
