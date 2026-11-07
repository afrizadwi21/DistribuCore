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

type Product struct {
	ID                  uuid.UUID  `json:"id"`
	TenantID            uuid.UUID  `json:"tenant_id"`
	CategoryID          *uuid.UUID `json:"category_id"`
	SKU                 string     `json:"sku"`
	Barcode             *string    `json:"barcode"`
	Name                string     `json:"name"`
	Description         *string    `json:"description"`
	BaseUOMID           uuid.UUID  `json:"base_uom_id"`
	BaseUOMCode         string     `json:"base_uom_code,omitempty"`
	SafetyStockQuantity float64    `json:"safety_stock_quantity"`
	ReorderPointQuantity float64   `json:"reorder_point_quantity"`
	IsActive            bool       `json:"is_active"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

type ProductRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create inserts a new master product SKU scoped to a tenant.
func (r *ProductRepository) Create(ctx context.Context, p *Product) (*Product, error) {
	err := r.db.QueryRow(ctx, `
		INSERT INTO products (
			tenant_id, category_id, sku, barcode, name, description,
			base_uom_id, safety_stock_quantity, reorder_point_quantity, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`,
		p.TenantID, p.CategoryID, p.SKU, p.Barcode, p.Name, p.Description,
		p.BaseUOMID, p.SafetyStockQuantity, p.ReorderPointQuantity, p.IsActive,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return p, nil
}

// ListByTenant retrieves paginated products with their base UOM code for a tenant.
func (r *ProductRepository) ListByTenant(ctx context.Context, tenantID uuid.UUID, limit, offset int) ([]*Product, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	rows, err := r.db.Query(ctx, `
		SELECT p.id, p.tenant_id, p.category_id, p.sku, p.barcode, p.name, p.description,
		       p.base_uom_id, u.code AS base_uom_code, p.safety_stock_quantity,
		       p.reorder_point_quantity, p.is_active, p.created_at, p.updated_at
		FROM products p
		JOIN units_of_measure u ON p.base_uom_id = u.id
		WHERE p.tenant_id = $1
		ORDER BY p.name ASC
		LIMIT $2 OFFSET $3
	`, tenantID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var products []*Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(
			&p.ID, &p.TenantID, &p.CategoryID, &p.SKU, &p.Barcode, &p.Name, &p.Description,
			&p.BaseUOMID, &p.BaseUOMCode, &p.SafetyStockQuantity,
			&p.ReorderPointQuantity, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan product row: %w", err)
		}
		products = append(products, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating product rows: %w", err)
	}

	return products, nil
}

// GetByID retrieves a single product by ID within a tenant boundary.
func (r *ProductRepository) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*Product, error) {
	var p Product
	err := r.db.QueryRow(ctx, `
		SELECT p.id, p.tenant_id, p.category_id, p.sku, p.barcode, p.name, p.description,
		       p.base_uom_id, u.code AS base_uom_code, p.safety_stock_quantity,
		       p.reorder_point_quantity, p.is_active, p.created_at, p.updated_at
		FROM products p
		JOIN units_of_measure u ON p.base_uom_id = u.id
		WHERE p.tenant_id = $1 AND p.id = $2
	`, tenantID, id).Scan(
		&p.ID, &p.TenantID, &p.CategoryID, &p.SKU, &p.Barcode, &p.Name, &p.Description,
		&p.BaseUOMID, &p.BaseUOMCode, &p.SafetyStockQuantity,
		&p.ReorderPointQuantity, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to query product by id: %w", err)
	}

	return &p, nil
}
