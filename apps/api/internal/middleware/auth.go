package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	UserIDKey    = "user_id"
	UserRolesKey = "user_roles"
)

type JWTClaims struct {
	UserID   uuid.UUID `json:"user_id"`
	TenantID uuid.UUID `json:"tenant_id"`
	Email    string    `json:"email"`
	Roles    []string  `json:"roles"`
	jwt.RegisteredClaims
}

// RequireAuth validates the Bearer JWT token and extracts claims into Fiber context
func RequireAuth(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "UNAUTHORIZED",
					"message": "Authorization header with Bearer token is required",
				},
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &JWTClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "INVALID_TOKEN",
					"message": "Supplied JWT token is invalid or expired",
				},
			})
		}

		c.Locals(UserIDKey, claims.UserID)
		c.Locals(TenantIDKey, claims.TenantID)
		c.Locals(UserRolesKey, claims.Roles)

		return c.Next()
	}
}

// RequireRole checks if the authenticated user has at least one of the permitted roles
func RequireRole(permittedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		rolesVal := c.Locals(UserRolesKey)
		if rolesVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "FORBIDDEN",
					"message": "No roles associated with the authenticated context",
				},
			})
		}

		userRoles, ok := rolesVal.([]string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error": fiber.Map{
					"code":    "FORBIDDEN",
					"message": "Access denied",
				},
			})
		}

		for _, userRole := range userRoles {
			for _, permitted := range permittedRoles {
				if userRole == permitted || userRole == "SUPER_ADMIN" {
					return c.Next()
				}
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error": fiber.Map{
				"code":    "INSUFFICIENT_PERMISSIONS",
				"message": "You do not have the required permissions to perform this action",
			},
		})
	}
}
