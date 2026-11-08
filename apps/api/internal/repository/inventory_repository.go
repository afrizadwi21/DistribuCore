package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type InventoryBalance struct {
	ID              uuid.UUID `json:"id"`
	TenantID        uuid.UUID `json:"tenant_id"`
	WarehouseID     uuid.UUID `json:"warehouse_id"`
	BinID           uuid.UUID `json:"bin_id"`
	ProductID       uuid.UUID `json:"product_id"`
	ProductSKU      string    `json:"product_sku,omitempty"`
	ProductName     string    `json:"product_name,omitempty"`
	BinCode         string    `json:"bin_code,omitempty"`
	QuantityOnHand  float64   `json:"quantity_on_hand"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type StockAdjustmentPayload struct {
	TenantID        uuid.UUID
	WarehouseID     uuid.UUID
	BinID           uuid.UUID
	ProductID       uuid.UUID
	QuantityDelta   float64
	TransactionType string
	ReferenceType   string
	ReferenceID     uuid.UUID
	PerformedBy     uuid.UUID
	Notes           string
}

type InventoryRepository struct {
	db *pgxpool.Pool
}

func NewInventoryRepository(db *pgxpool.Pool) *InventoryRepository {
	return &InventoryRepository{db: db}
}

// AdjustStock adjusts physical stock and logs an immutable audit trail transaction atomically.
func (r *InventoryRepository) AdjustStock(ctx context.Context, p StockAdjustmentPayload) (*InventoryBalance, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin stock adjustment transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. UPSERT on-hand balance
	var balance InventoryBalance
	err = tx.QueryRow(ctx, `
		INSERT INTO inventory_balances (tenant_id, warehouse_id, bin_id, product_id, quantity_on_hand, updated_at)
		VALUES ($1, $2, $3, $4, GREATEST(0, $5), NOW())
		ON CONFLICT (tenant_id, warehouse_id, bin_id, product_id)
		DO UPDATE SET
			quantity_on_hand = GREATEST(0, inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand),
			updated_at = NOW()
		RETURNING id, tenant_id, warehouse_id, bin_id, product_id, quantity_on_hand, updated_at
	`, p.TenantID, p.WarehouseID, p.BinID, p.ProductID, p.QuantityDelta).Scan(
		&balance.ID, &balance.TenantID, &balance.WarehouseID, &balance.BinID,
		&balance.ProductID, &balance.QuantityOnHand, &balance.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update inventory balance: %w", err)
	}

	// 2. Insert immutable inventory audit ledger
	_, err = tx.Exec(ctx, `
		INSERT INTO inventory_transactions (
			tenant_id, warehouse_id, bin_id, product_id, transaction_type,
			quantity_delta, reference_type, reference_id, performed_by, notes, created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
	`, p.TenantID, p.WarehouseID, p.BinID, p.ProductID, p.TransactionType,
		p.QuantityDelta, p.ReferenceType, p.ReferenceID, p.PerformedBy, p.Notes)
	if err != nil {
		return nil, fmt.Errorf("failed to record inventory ledger transaction: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit stock transaction: %w", err)
	}

	return &balance, nil
}

// ListBalancesByWarehouse retrieves current on-hand quantities per bin and product in a warehouse.
func (r *InventoryRepository) ListBalancesByWarehouse(ctx context.Context, tenantID, warehouseID uuid.UUID) ([]*InventoryBalance, error) {
	rows, err := r.db.Query(ctx, `
		SELECT ib.id, ib.tenant_id, ib.warehouse_id, ib.bin_id, ib.product_id,
		       p.sku AS product_sku, p.name AS product_name, b.code AS bin_code,
		       ib.quantity_on_hand, ib.updated_at
		FROM inventory_balances ib
		JOIN products p ON ib.product_id = p.id
		JOIN warehouse_bins b ON ib.bin_id = b.id
		WHERE ib.tenant_id = $1 AND ib.warehouse_id = $2
		ORDER BY p.name ASC, b.code ASC
	`, tenantID, warehouseID)
	if err != nil {
		return nil, fmt.Errorf("failed to query inventory balances: %w", err)
	}
	defer rows.Close()

	var balances []*InventoryBalance
	for rows.Next() {
		var b InventoryBalance
		if err := rows.Scan(
			&b.ID, &b.TenantID, &b.WarehouseID, &b.BinID, &b.ProductID,
			&b.ProductSKU, &b.ProductName, &b.BinCode,
			&b.QuantityOnHand, &b.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan inventory balance row: %w", err)
		}
		balances = append(balances, &b)
	}

	return balances, nil
}
