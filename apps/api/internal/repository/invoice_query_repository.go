package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListCustomerInvoices retrieves paginated customer invoices with customer names.
func (r *BillingRepository) ListCustomerInvoices(ctx context.Context, tenantID uuid.UUID, customerID *uuid.UUID, status string, page, limit int) ([]*CustomerInvoice, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := "WHERE inv.tenant_id = $1"
	args := []interface{}{tenantID}
	if customerID != nil && *customerID != uuid.Nil {
		where += " AND inv.customer_id = $2"
		args = append(args, *customerID)
	}
	if status != "" {
		where += fmt.Sprintf(" AND inv.status = $%d", len(args)+1)
		args = append(args, status)
	}

	var total int
	_ = r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM customer_invoices inv %s", where), args...).Scan(&total)

	query := fmt.Sprintf(`
		SELECT inv.id, inv.tenant_id, inv.invoice_number, inv.customer_id, c.company_name,
		       inv.sales_order_id, inv.delivery_order_id, inv.status, inv.issue_date, inv.due_date,
		       inv.subtotal_cents, inv.tax_cents, inv.total_amount_cents, inv.balance_due_cents,
		       inv.created_at, inv.updated_at
		FROM customer_invoices inv
		JOIN customers c ON inv.customer_id = c.id
		%s ORDER BY inv.created_at DESC LIMIT $%d OFFSET $%d
	`, where, len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list invoices: %w", err)
	}
	defer rows.Close()

	var invoices []*CustomerInvoice
	for rows.Next() {
		var i CustomerInvoice
		_ = rows.Scan(&i.ID, &i.TenantID, &i.InvoiceNumber, &i.CustomerID, &i.CustomerName,
			&i.SalesOrderID, &i.DeliveryOrderID, &i.Status, &i.IssueDate, &i.DueDate,
			&i.SubtotalCents, &i.TaxCents, &i.TotalAmountCents, &i.BalanceDueCents, &i.CreatedAt, &i.UpdatedAt)
		invoices = append(invoices, &i)
	}
	return invoices, total, nil
}

// GetInvoiceByID retrieves a single invoice along with its line items.
func (r *BillingRepository) GetInvoiceByID(ctx context.Context, tenantID, invID uuid.UUID) (*CustomerInvoice, error) {
	var i CustomerInvoice
	err := r.db.QueryRow(ctx, `
		SELECT inv.id, inv.tenant_id, inv.invoice_number, inv.customer_id, c.company_name,
		       inv.sales_order_id, inv.delivery_order_id, inv.status, inv.issue_date, inv.due_date,
		       inv.subtotal_cents, inv.tax_cents, inv.total_amount_cents, inv.balance_due_cents, inv.created_at, inv.updated_at
		FROM customer_invoices inv
		JOIN customers c ON inv.customer_id = c.id
		WHERE inv.tenant_id = $1 AND inv.id = $2
	`, tenantID, invID).Scan(&i.ID, &i.TenantID, &i.InvoiceNumber, &i.CustomerID, &i.CustomerName,
		&i.SalesOrderID, &i.DeliveryOrderID, &i.Status, &i.IssueDate, &i.DueDate,
		&i.SubtotalCents, &i.TaxCents, &i.TotalAmountCents, &i.BalanceDueCents, &i.CreatedAt, &i.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("invoice not found: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT ili.id, ili.tenant_id, ili.invoice_id, ili.product_id, p.sku, p.name, ili.quantity, ili.unit_price_cents, ili.subtotal_cents
		FROM invoice_line_items ili JOIN products p ON ili.product_id = p.id
		WHERE ili.tenant_id = $1 AND ili.invoice_id = $2
	`, tenantID, invID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch invoice items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var it InvoiceLineItem
		_ = rows.Scan(&it.ID, &it.TenantID, &it.InvoiceID, &it.ProductID, &it.ProductSKU, &it.ProductName, &it.Quantity, &it.UnitPriceCents, &it.SubtotalCents)
		i.Items = append(i.Items, &it)
	}
	return &i, nil
}
