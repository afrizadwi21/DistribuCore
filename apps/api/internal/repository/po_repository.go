package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PurchaseRepository struct {
	db *pgxpool.Pool
}

func NewPurchaseRepository(db *pgxpool.Pool) *PurchaseRepository {
	return &PurchaseRepository{db: db}
}

// CreatePurchaseOrder inserts a PO header along with all line items atomically.
func (r *PurchaseRepository) CreatePurchaseOrder(ctx context.Context, po *PurchaseOrder) (*PurchaseOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var totalCents int64 = 0
	for _, item := range po.Items {
		item.SubtotalCents = int64(item.OrderedQuantity * float64(item.UnitCostCents))
		totalCents += item.SubtotalCents
	}
	po.TotalAmountCents = totalCents
	if po.Status == "" {
		po.Status = string(POStatusDraft)
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO purchase_orders (
			tenant_id, po_number, supplier_id, destination_warehouse_id,
			status, issued_date, expected_delivery_date, total_amount_cents,
			created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`, po.TenantID, po.PONumber, po.SupplierID, po.DestinationWarehouseID,
		po.Status, po.IssuedDate, po.ExpectedDeliveryDate, po.TotalAmountCents, po.CreatedBy,
	).Scan(&po.ID, &po.CreatedAt, &po.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert purchase order header: %w", err)
	}

	for _, item := range po.Items {
		item.TenantID = po.TenantID
		item.PurchaseOrderID = po.ID
		item.ReceivedQuantity = 0.0

		err = tx.QueryRow(ctx, `
			INSERT INTO po_line_items (
				tenant_id, purchase_order_id, product_id, uom_id,
				ordered_quantity, received_quantity, unit_cost_cents, subtotal_cents
			)
			VALUES ($1, $2, $3, $4, $5, 0, $6, $7)
			RETURNING id
		`, item.TenantID, item.PurchaseOrderID, item.ProductID, item.UOMID,
			item.OrderedQuantity, item.UnitCostCents, item.SubtotalCents,
		).Scan(&item.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert po line item: %w", err)
		}
		item.RemainingQuantity = item.OrderedQuantity
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit purchase order: %w", err)
	}

	return po, nil
}
