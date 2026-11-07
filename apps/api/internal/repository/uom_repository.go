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

type UnitOfMeasure struct {
	ID         uuid.UUID `json:"id"`
	TenantID   uuid.UUID `json:"tenant_id"`
	Code       string    `json:"code"`
	Name       string    `json:"name"`
	IsBaseUnit bool      `json:"is_base_unit"`
	CreatedAt  time.Time `json:"created_at"`
}

type UOMRepository struct {
	db *pgxpool.Pool
}

func NewUOMRepository(db *pgxpool.Pool) *UOMRepository {
	return &UOMRepository{db: db}
}

// Create inserts a new Unit of Measure scoped to a tenant.
func (r *UOMRepository) Create(ctx context.Context, tenantID uuid.UUID, code, name string, isBaseUnit bool) (*UnitOfMeasure, error) {
	var uom UnitOfMeasure
	err := r.db.QueryRow(ctx, `
		INSERT INTO units_of_measure (tenant_id, code, name, is_base_unit)
		VALUES ($1, $2, $3, $4)
		RETURNING id, tenant_id, code, name, is_base_unit, created_at
	`, tenantID, code, name, isBaseUnit).Scan(
		&uom.ID, &uom.TenantID, &uom.Code, &uom.Name, &uom.IsBaseUnit, &uom.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create unit of measure: %w", err)
	}

	return &uom, nil
}

// ListByTenant retrieves all units of measure registered under a tenant.
func (r *UOMRepository) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*UnitOfMeasure, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, tenant_id, code, name, is_base_unit, created_at
		FROM units_of_measure
		WHERE tenant_id = $1
		ORDER BY created_at ASC
	`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query units of measure: %w", err)
	}
	defer rows.Close()

	var uoms []*UnitOfMeasure
	for rows.Next() {
		var u UnitOfMeasure
		if err := rows.Scan(&u.ID, &u.TenantID, &u.Code, &u.Name, &u.IsBaseUnit, &u.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan uom row: %w", err)
		}
		uoms = append(uoms, &u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating uom rows: %w", err)
	}

	return uoms, nil
}

// GetByID retrieves a single unit of measure by ID, verifying tenant ownership.
func (r *UOMRepository) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*UnitOfMeasure, error) {
	var uom UnitOfMeasure
	err := r.db.QueryRow(ctx, `
		SELECT id, tenant_id, code, name, is_base_unit, created_at
		FROM units_of_measure
		WHERE tenant_id = $1 AND id = $2
	`, tenantID, id).Scan(
		&uom.ID, &uom.TenantID, &uom.Code, &uom.Name, &uom.IsBaseUnit, &uom.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to query unit of measure: %w", err)
	}

	return &uom, nil
}
