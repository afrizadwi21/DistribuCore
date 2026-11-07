package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound       = errors.New("record not found")
	ErrDuplicateKey   = errors.New("record with this identifier already exists")
)

type Tenant struct {
	ID             uuid.UUID `json:"id"`
	Code           string    `json:"code"`
	Name           string    `json:"name"`
	TaxIdentifier  *string   `json:"tax_identifier"`
	CurrencyCode   string    `json:"currency_code"`
	Timezone       string    `json:"timezone"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type User struct {
	ID           uuid.UUID `json:"id"`
	TenantID     uuid.UUID `json:"tenant_id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	PhoneNumber  *string   `json:"phone_number"`
	IsActive     bool      `json:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Roles        []string  `json:"roles"`
}

type AuthRepository struct {
	db *pgxpool.Pool
}

func NewAuthRepository(db *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{db: db}
}

// CreateTenantWithAdmin creates a new tenant, an admin role, and the first administrator user inside a single database transaction.
func (r *AuthRepository) CreateTenantWithAdmin(ctx context.Context, tenantCode, tenantName, email, passwordHash, fullName string) (*Tenant, *User, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // Safe to call: no-op if tx is already committed

	// 1. Insert Tenant
	var tenant Tenant
	err = tx.QueryRow(ctx, `
		INSERT INTO tenants (code, name)
		VALUES ($1, $2)
		RETURNING id, code, name, tax_identifier, currency_code, timezone, is_active, created_at, updated_at
	`, tenantCode, tenantName).Scan(
		&tenant.ID, &tenant.Code, &tenant.Name, &tenant.TaxIdentifier,
		&tenant.CurrencyCode, &tenant.Timezone, &tenant.IsActive,
		&tenant.CreatedAt, &tenant.UpdatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create tenant: %w", err)
	}

	// 2. Insert Admin Role for Tenant
	var roleID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO roles (tenant_id, name, description, is_system_role)
		VALUES ($1, 'ADMIN', 'Tenant Administrator with full operational privileges', TRUE)
		RETURNING id
	`, tenant.ID).Scan(&roleID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create tenant admin role: %w", err)
	}

	// 3. Insert Administrator User
	var user User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (tenant_id, email, password_hash, full_name)
		VALUES ($1, $2, $3, $4)
		RETURNING id, tenant_id, email, full_name, phone_number, is_active, last_login_at, created_at, updated_at
	`, tenant.ID, email, passwordHash, fullName).Scan(
		&user.ID, &user.TenantID, &user.Email, &user.FullName,
		&user.PhoneNumber, &user.IsActive, &user.LastLoginAt,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create user: %w", err)
	}

	// 4. Assign Admin Role to User
	_, err = tx.Exec(ctx, `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
	`, user.ID, roleID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to assign admin role: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	user.Roles = []string{"ADMIN"}
	return &tenant, &user, nil
}

// GetUserByEmailWithRoles queries user records and aggregated role names for authentication.
func (r *AuthRepository) GetUserByEmailWithRoles(ctx context.Context, tenantCode, email string) (*User, *Tenant, error) {
	// First resolve the tenant by code
	var tenant Tenant
	err := r.db.QueryRow(ctx, `
		SELECT id, code, name, tax_identifier, currency_code, timezone, is_active, created_at, updated_at
		FROM tenants
		WHERE code = $1 AND is_active = TRUE
	`, tenantCode).Scan(
		&tenant.ID, &tenant.Code, &tenant.Name, &tenant.TaxIdentifier,
		&tenant.CurrencyCode, &tenant.Timezone, &tenant.IsActive,
		&tenant.CreatedAt, &tenant.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, ErrNotFound
		}
		return nil, nil, fmt.Errorf("failed to query tenant: %w", err)
	}

	// Query user and their assigned roles within the verified tenant boundary
	var user User
	err = r.db.QueryRow(ctx, `
		SELECT u.id, u.tenant_id, u.email, u.password_hash, u.full_name, u.phone_number,
		       u.is_active, u.last_login_at, u.created_at, u.updated_at,
		       COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.id
		WHERE u.tenant_id = $1 AND u.email = $2
		GROUP BY u.id
	`, tenant.ID, email).Scan(
		&user.ID, &user.TenantID, &user.Email, &user.PasswordHash,
		&user.FullName, &user.PhoneNumber, &user.IsActive,
		&user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt,
		&user.Roles,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, ErrNotFound
		}
		return nil, nil, fmt.Errorf("failed to query user: %w", err)
	}

	return &user, &tenant, nil
}

// GetUserByID retrieves a user by ID and Tenant ID (defense-in-depth scoping).
func (r *AuthRepository) GetUserByID(ctx context.Context, tenantID, userID uuid.UUID) (*User, error) {
	var user User
	err := r.db.QueryRow(ctx, `
		SELECT u.id, u.tenant_id, u.email, u.full_name, u.phone_number,
		       u.is_active, u.last_login_at, u.created_at, u.updated_at,
		       COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.id
		WHERE u.tenant_id = $1 AND u.id = $2
		GROUP BY u.id
	`, tenantID, userID).Scan(
		&user.ID, &user.TenantID, &user.Email, &user.FullName,
		&user.PhoneNumber, &user.IsActive, &user.LastLoginAt,
		&user.CreatedAt, &user.UpdatedAt,
		&user.Roles,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to query user by id: %w", err)
	}

	return &user, nil
}

// UpdateLastLogin updates the timestamp when user signs in.
func (r *AuthRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1
	`, userID)
	return err
}
