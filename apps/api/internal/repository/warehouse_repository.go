package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Warehouse struct {
	ID            uuid.UUID `json:"id"`
	TenantID      uuid.UUID `json:"tenant_id"`
	Code          string    `json:"code"`
	Name          string    `json:"name"`
	AddressLine   *string   `json:"address_line"`
	City          *string   `json:"city"`
	StateProvince *string   `json:"state_province"`
	PostalCode    *string   `json:"postal_code"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
}

type WarehouseBin struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	WarehouseID uuid.UUID `json:"warehouse_id"`
	Code        string    `json:"code"`
	Zone        *string   `json:"zone"`
	IsActive    bool      `json:"is_active"`
}

type WarehouseRepository struct {
	db *pgxpool.Pool
}

func NewWarehouseRepository(db *pgxpool.Pool) *WarehouseRepository {
	return &WarehouseRepository{db: db}
}

// CreateWarehouse creates a new storage facility scoped to a tenant.
func (r *WarehouseRepository) CreateWarehouse(ctx context.Context, w *Warehouse) (*Warehouse, error) {
	err := r.db.QueryRow(ctx, `
		INSERT INTO warehouses (
			tenant_id, code, name, address_line, city, state_province, postal_code, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`,
		w.TenantID, w.Code, w.Name, w.AddressLine, w.City, w.StateProvince, w.PostalCode, w.IsActive,
	).Scan(&w.ID, &w.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create warehouse: %w", err)
	}

	return w, nil
}

// ListWarehousesByTenant retrieves all active warehouse facilities for a tenant.
func (r *WarehouseRepository) ListWarehousesByTenant(ctx context.Context, tenantID uuid.UUID) ([]*Warehouse, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, tenant_id, code, name, address_line, city, state_province, postal_code, is_active, created_at
		FROM warehouses
		WHERE tenant_id = $1
		ORDER BY name ASC
	`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query warehouses: %w", err)
	}
	defer rows.Close()

	var list []*Warehouse
	for rows.Next() {
		var w Warehouse
		if err := rows.Scan(
			&w.ID, &w.TenantID, &w.Code, &w.Name, &w.AddressLine, &w.City, &w.StateProvince, &w.PostalCode, &w.IsActive, &w.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan warehouse row: %w", err)
		}
		list = append(list, &w)
	}

	return list, nil
}

// CreateBin registers a specific rack/bin location within a warehouse.
func (r *WarehouseRepository) CreateBin(ctx context.Context, b *WarehouseBin) (*WarehouseBin, error) {
	err := r.db.QueryRow(ctx, `
		INSERT INTO warehouse_bins (tenant_id, warehouse_id, code, zone, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, b.TenantID, b.WarehouseID, b.Code, b.Zone, b.IsActive).Scan(&b.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to create warehouse bin: %w", err)
	}

	return b, nil
}

// ListBinsByWarehouse lists all storage bin locations in a specific warehouse facility.
func (r *WarehouseRepository) ListBinsByWarehouse(ctx context.Context, tenantID, warehouseID uuid.UUID) ([]*WarehouseBin, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, tenant_id, warehouse_id, code, zone, is_active
		FROM warehouse_bins
		WHERE tenant_id = $1 AND warehouse_id = $2
		ORDER BY code ASC
	`, tenantID, warehouseID)
	if err != nil {
		return nil, fmt.Errorf("failed to query bins: %w", err)
	}
	defer rows.Close()

	var bins []*WarehouseBin
	for rows.Next() {
		var b WarehouseBin
		if err := rows.Scan(&b.ID, &b.TenantID, &b.WarehouseID, &b.Code, &b.Zone, &b.IsActive); err != nil {
			return nil, fmt.Errorf("failed to scan bin row: %w", err)
		}
		bins = append(bins, &b)
	}

	return bins, nil
}
