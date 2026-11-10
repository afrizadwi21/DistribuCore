package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListSalesOrders retrieves paginated sales orders with customer metadata.
func (r *SalesRepository) ListSalesOrders(ctx context.Context, tenantID uuid.UUID, customerID *uuid.UUID, status string, page, limit int) ([]*SalesOrder, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := "WHERE so.tenant_id = $1"
	args := []interface{}{tenantID}
	if customerID != nil && *customerID != uuid.Nil {
		where += " AND so.customer_id = $2"
		args = append(args, *customerID)
	}
	if status != "" {
		where += fmt.Sprintf(" AND so.order_status = $%d", len(args)+1)
		args = append(args, status)
	}

	var total int
	_ = r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM sales_orders so %s", where), args...).Scan(&total)

	query := fmt.Sprintf(`
		SELECT so.id, so.tenant_id, so.order_number, so.quotation_id, so.customer_id, c.company_name,
		       so.order_status, so.credit_status, so.total_amount_cents, so.order_date, so.created_by, so.created_at, so.updated_at
		FROM sales_orders so
		JOIN customers c ON so.customer_id = c.id
		%s ORDER BY so.created_at DESC LIMIT $%d OFFSET $%d
	`, where, len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list sales orders: %w", err)
	}
	defer rows.Close()

	var orders []*SalesOrder
	for rows.Next() {
		var o SalesOrder
		_ = rows.Scan(&o.ID, &o.TenantID, &o.OrderNumber, &o.QuotationID, &o.CustomerID, &o.CustomerName,
			&o.OrderStatus, &o.CreditStatus, &o.TotalAmountCents, &o.OrderDate, &o.CreatedBy, &o.CreatedAt, &o.UpdatedAt)
		orders = append(orders, &o)
	}
	return orders, total, nil
}

// GetSalesOrderByID retrieves a single sales order with all line items.
func (r *SalesRepository) GetSalesOrderByID(ctx context.Context, tenantID, orderID uuid.UUID) (*SalesOrder, error) {
	var o SalesOrder
	err := r.db.QueryRow(ctx, `
		SELECT so.id, so.tenant_id, so.order_number, so.quotation_id, so.customer_id, c.company_name,
		       so.order_status, so.credit_status, so.total_amount_cents, so.order_date, so.created_by, so.created_at, so.updated_at
		FROM sales_orders so
		JOIN customers c ON so.customer_id = c.id
		WHERE so.tenant_id = $1 AND so.id = $2
	`, tenantID, orderID).Scan(&o.ID, &o.TenantID, &o.OrderNumber, &o.QuotationID, &o.CustomerID, &o.CustomerName,
		&o.OrderStatus, &o.CreditStatus, &o.TotalAmountCents, &o.OrderDate, &o.CreatedBy, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("sales order not found: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT sli.id, sli.tenant_id, sli.sales_order_id, sli.product_id, p.sku, p.name,
		       sli.uom_id, u.code, sli.ordered_quantity, sli.reserved_quantity, sli.delivered_quantity,
		       sli.unit_price_cents, sli.subtotal_cents
		FROM so_line_items sli
		JOIN products p ON sli.product_id = p.id
		JOIN units_of_measure u ON sli.uom_id = u.id
		WHERE sli.tenant_id = $1 AND sli.sales_order_id = $2
		ORDER BY sli.id ASC
	`, tenantID, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch order line items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var it SOLineItem
		_ = rows.Scan(&it.ID, &it.TenantID, &it.SalesOrderID, &it.ProductID, &it.ProductSKU, &it.ProductName,
			&it.UOMID, &it.UOMCode, &it.OrderedQuantity, &it.ReservedQuantity, &it.DeliveredQuantity, &it.UnitPriceCents, &it.SubtotalCents)
		o.Items = append(o.Items, &it)
	}
	return &o, nil
}
