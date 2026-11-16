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

// UpdateUserRole updates a user's assigned role and optionally their full name or active status within a tenant.
func (r *AuthRepository) UpdateUserRole(ctx context.Context, tenantID, userID uuid.UUID, roleName, fullName string, isActive *bool) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if fullName != "" {
		_, _ = tx.Exec(ctx, `UPDATE users SET full_name = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, fullName, tenantID, userID)
	}
	if isActive != nil {
		_, _ = tx.Exec(ctx, `UPDATE users SET is_active = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, *isActive, tenantID, userID)
	}
	if roleName != "" {
		var roleID uuid.UUID
		err = tx.QueryRow(ctx, `
			INSERT INTO roles (tenant_id, name, description, is_system_role)
			VALUES ($1, $2, $3, FALSE)
			ON CONFLICT (tenant_id, name) DO UPDATE SET updated_at = NOW()
			RETURNING id
		`, tenantID, roleName, "Role "+roleName).Scan(&roleID)
		if err != nil {
			return err
		}
		_, _ = tx.Exec(ctx, `DELETE FROM user_roles WHERE user_id = $1`, userID)
		if _, err := tx.Exec(ctx, `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, userID, roleID); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

// DeleteTenantUser removes a user belonging to a tenant.
func (r *AuthRepository) DeleteTenantUser(ctx context.Context, tenantID, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM users WHERE tenant_id = $1 AND id = $2`, tenantID, idOrNil(userID))
	return err
}

func idOrNil(u uuid.UUID) uuid.UUID { return u }

func (r *AuthRepository) ensureStateTable(ctx context.Context) {
	_, _ = r.db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS tenant_workspace_states (
			tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
			state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
}

func (r *AuthRepository) GetWorkspaceState(ctx context.Context, tenantID uuid.UUID) ([]byte, error) {
	r.ensureStateTable(ctx)
	var raw []byte
	err := r.db.QueryRow(ctx, `SELECT state_json FROM tenant_workspace_states WHERE tenant_id = $1`, tenantID).Scan(&raw)
	if err != nil {
		return []byte("{}"), nil
	}
	return raw, nil
}

func (r *AuthRepository) SaveWorkspaceState(ctx context.Context, tenantID uuid.UUID, raw []byte) error {
	r.ensureStateTable(ctx)
	_, err := r.db.Exec(ctx, `
		INSERT INTO tenant_workspace_states (tenant_id, state_json, updated_at)
		VALUES ($1, $2::jsonb, NOW())
		ON CONFLICT (tenant_id) DO UPDATE SET state_json = EXCLUDED.state_json, updated_at = NOW()
	`, tenantID, string(raw))
	return err
}

