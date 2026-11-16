package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListTenantUsers returns all users registered under a specific tenant along with their assigned roles.
func (r *AuthRepository) ListTenantUsers(ctx context.Context, tenantID uuid.UUID) ([]*User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT u.id, u.tenant_id, u.email, u.full_name, u.phone_number,
		       u.is_active, u.last_login_at, u.created_at, u.updated_at,
		       COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.id
		WHERE u.tenant_id = $1
		GROUP BY u.id
		ORDER BY u.created_at ASC
	`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tenant users: %w", err)
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.TenantID, &u.Email, &u.FullName, &u.PhoneNumber,
			&u.IsActive, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt, &u.Roles); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, nil
}

// CreateTenantUser creates a user within a tenant and assigns the specified role.
func (r *AuthRepository) CreateTenantUser(ctx context.Context, tenantID uuid.UUID, email, passwordHash, fullName, roleName string) (*User, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var roleID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO roles (tenant_id, name, description, is_system_role)
		VALUES ($1, $2, $3, FALSE)
		ON CONFLICT (tenant_id, name) DO UPDATE SET updated_at = NOW()
		RETURNING id
	`, tenantID, roleName, "Role "+roleName).Scan(&roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve role: %w", err)
	}

	var u User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (tenant_id, email, password_hash, full_name)
		VALUES ($1, $2, $3, $4)
		RETURNING id, tenant_id, email, full_name, phone_number, is_active, last_login_at, created_at, updated_at
	`, tenantID, email, passwordHash, fullName).Scan(
		&u.ID, &u.TenantID, &u.Email, &u.FullName, &u.PhoneNumber, &u.IsActive, &u.LastLoginAt, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	if _, err := tx.Exec(ctx, `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, u.ID, roleID); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	u.Roles = []string{roleName}
	return &u, nil
}
