package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SalesRepository struct {
	db *pgxpool.Pool
}

func NewSalesRepository(db *pgxpool.Pool) *SalesRepository {
	return &SalesRepository{db: db}
}

// CreateSalesOrder creates an order and automatically evaluates customer credit limit standing.
func (r *SalesRepository) CreateSalesOrder(ctx context.Context, so *SalesOrder) (*SalesOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var limitCents, outstandingCents int64
	var isCreditHeld bool
	err = tx.QueryRow(ctx, `
		SELECT credit_limit_cents, outstanding_balance_cents, is_credit_held
		FROM customers WHERE tenant_id = $1 AND id = $2 FOR UPDATE
	`, so.TenantID, so.CustomerID).Scan(&limitCents, &outstandingCents, &isCreditHeld)
	if err != nil {
		return nil, fmt.Errorf("customer not found: %w", err)
	}

	var totalCents int64 = 0
	for _, it := range so.Items {
		it.SubtotalCents = int64(it.OrderedQuantity * float64(it.UnitPriceCents))
		totalCents += it.SubtotalCents
	}
	so.TotalAmountCents = totalCents

	so.OrderStatus = string(SOStatusPendingApproval)
	if isCreditHeld || (outstandingCents+totalCents > limitCents && limitCents > 0) {
		so.CreditStatus = string(CreditStatusHeld)
	} else {
		so.CreditStatus = string(CreditStatusApproved)
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO sales_orders (
			tenant_id, order_number, quotation_id, customer_id,
			order_status, credit_status, total_amount_cents, order_date,
			created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW(), NOW())
		RETURNING id, order_date, created_at, updated_at
	`, so.TenantID, so.OrderNumber, so.QuotationID, so.CustomerID,
		so.OrderStatus, so.CreditStatus, so.TotalAmountCents, so.CreatedBy,
	).Scan(&so.ID, &so.OrderDate, &so.CreatedAt, &so.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert sales order header: %w", err)
	}

	for _, it := range so.Items {
		it.TenantID, it.SalesOrderID = so.TenantID, so.ID
		err = tx.QueryRow(ctx, `
			INSERT INTO so_line_items (
				tenant_id, sales_order_id, product_id, uom_id,
				ordered_quantity, reserved_quantity, delivered_quantity,
				unit_price_cents, subtotal_cents
			)
			VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7)
			RETURNING id
		`, it.TenantID, it.SalesOrderID, it.ProductID, it.UOMID,
			it.OrderedQuantity, it.UnitPriceCents, it.SubtotalCents,
		).Scan(&it.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert order line item: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit sales order: %w", err)
	}
	return so, nil
}
