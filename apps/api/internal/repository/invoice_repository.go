package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BillingRepository struct {
	db *pgxpool.Pool
}

func NewBillingRepository(db *pgxpool.Pool) *BillingRepository {
	return &BillingRepository{db: db}
}

// GenerateInvoiceFromDelivery creates an official invoice from a confirmed delivery order (POD).
func (r *BillingRepository) GenerateInvoiceFromDelivery(ctx context.Context, tenantID, doID uuid.UUID, invNumber string) (*CustomerInvoice, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var soID uuid.UUID
	var status string
	err = tx.QueryRow(ctx, `SELECT sales_order_id, delivery_status FROM delivery_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, tenantID, doID).Scan(&soID, &status)
	if err != nil || status != string(DeliveryStatusDelivered) {
		return nil, fmt.Errorf("delivery order not found or not delivered")
	}

	var custID uuid.UUID
	var paymentTerms int
	err = tx.QueryRow(ctx, `SELECT so.customer_id, c.payment_terms_days FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE so.tenant_id = $1 AND so.id = $2`, tenantID, soID).Scan(&custID, &paymentTerms)
	if err != nil {
		return nil, fmt.Errorf("customer details not found: %w", err)
	}

	rows, err := tx.Query(ctx, `SELECT dli.product_id, dli.quantity_to_deliver, sli.unit_price_cents FROM do_line_items dli JOIN so_line_items sli ON dli.so_line_item_id = sli.id WHERE dli.tenant_id = $1 AND dli.delivery_order_id = $2`, tenantID, doID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch items: %w", err)
	}
	defer rows.Close()

	type iItem struct {
		pid   uuid.UUID
		qty   float64
		price int64
	}
	var items []iItem
	var subtotal int64 = 0
	for rows.Next() {
		var it iItem
		_ = rows.Scan(&it.pid, &it.qty, &it.price)
		subtotal += int64(it.qty * float64(it.price))
		items = append(items, it)
	}

	dueDate := time.Now().AddDate(0, 0, paymentTerms)
	inv := &CustomerInvoice{
		TenantID: tenantID, InvoiceNumber: invNumber, CustomerID: custID,
		SalesOrderID: &soID, DeliveryOrderID: &doID, Status: string(InvoiceStatusIssued),
		IssueDate: time.Now(), DueDate: dueDate, SubtotalCents: subtotal, TaxCents: 0,
		TotalAmountCents: subtotal, BalanceDueCents: subtotal,
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO customer_invoices (tenant_id, invoice_number, customer_id, sales_order_id, delivery_order_id, status, issue_date, due_date, subtotal_cents, tax_cents, total_amount_cents, balance_due_cents, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING id, created_at, updated_at
	`, inv.TenantID, inv.InvoiceNumber, inv.CustomerID, inv.SalesOrderID, inv.DeliveryOrderID, inv.Status, inv.IssueDate, inv.DueDate, inv.SubtotalCents, inv.TaxCents, inv.TotalAmountCents, inv.BalanceDueCents).Scan(&inv.ID, &inv.CreatedAt, &inv.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert invoice: %w", err)
	}

	for _, it := range items {
		sub := int64(it.qty * float64(it.price))
		_, _ = tx.Exec(ctx, `INSERT INTO invoice_line_items (tenant_id, invoice_id, product_id, quantity, unit_price_cents, subtotal_cents) VALUES ($1, $2, $3, $4, $5, $6)`, tenantID, inv.ID, it.pid, it.qty, it.price, sub)
	}

	_, _ = tx.Exec(ctx, `UPDATE customers SET outstanding_balance_cents = outstanding_balance_cents + $1 WHERE tenant_id = $2 AND id = $3`, subtotal, tenantID, custID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit invoice: %w", err)
	}
	return inv, nil
}
