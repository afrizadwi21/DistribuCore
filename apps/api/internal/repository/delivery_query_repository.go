package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListDeliveryOrders retrieves paginated delivery orders with order and warehouse references.
func (r *FulfillmentRepository) ListDeliveryOrders(ctx context.Context, tenantID uuid.UUID, salesOrderID *uuid.UUID, status string, page, limit int) ([]*DeliveryOrder, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := "WHERE do.tenant_id = $1"
	args := []interface{}{tenantID}
	if salesOrderID != nil && *salesOrderID != uuid.Nil {
		where += " AND do.sales_order_id = $2"
		args = append(args, *salesOrderID)
	}
	if status != "" {
		where += fmt.Sprintf(" AND do.delivery_status = $%d", len(args)+1)
		args = append(args, status)
	}

	var total int
	_ = r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM delivery_orders do %s", where), args...).Scan(&total)

	query := fmt.Sprintf(`
		SELECT do.id, do.tenant_id, do.delivery_number, do.sales_order_id, so.order_number,
		       do.origin_warehouse_id, w.name, do.delivery_status, do.driver_name, do.vehicle_registration,
		       do.dispatched_at, do.created_at
		FROM delivery_orders do
		JOIN sales_orders so ON do.sales_order_id = so.id
		JOIN warehouses w ON do.origin_warehouse_id = w.id
		%s ORDER BY do.created_at DESC LIMIT $%d OFFSET $%d
	`, where, len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list delivery orders: %w", err)
	}
	defer rows.Close()

	var orders []*DeliveryOrder
	for rows.Next() {
		var d DeliveryOrder
		_ = rows.Scan(&d.ID, &d.TenantID, &d.DeliveryNumber, &d.SalesOrderID, &d.OrderNumber,
			&d.OriginWarehouseID, &d.WarehouseName, &d.DeliveryStatus, &d.DriverName, &d.VehicleRegistration, &d.DispatchedAt, &d.CreatedAt)
		orders = append(orders, &d)
	}
	return orders, total, nil
}

// GetDeliveryOrderByID retrieves a delivery order along with its line items.
func (r *FulfillmentRepository) GetDeliveryOrderByID(ctx context.Context, tenantID, doID uuid.UUID) (*DeliveryOrder, error) {
	var d DeliveryOrder
	err := r.db.QueryRow(ctx, `
		SELECT do.id, do.tenant_id, do.delivery_number, do.sales_order_id, so.order_number,
		       do.origin_warehouse_id, w.name, do.delivery_status, do.driver_name, do.vehicle_registration, do.dispatched_at, do.created_at
		FROM delivery_orders do
		JOIN sales_orders so ON do.sales_order_id = so.id
		JOIN warehouses w ON do.origin_warehouse_id = w.id
		WHERE do.tenant_id = $1 AND do.id = $2
	`, tenantID, doID).Scan(&d.ID, &d.TenantID, &d.DeliveryNumber, &d.SalesOrderID, &d.OrderNumber,
		&d.OriginWarehouseID, &d.WarehouseName, &d.DeliveryStatus, &d.DriverName, &d.VehicleRegistration, &d.DispatchedAt, &d.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("delivery order not found: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT dli.id, dli.tenant_id, dli.delivery_order_id, dli.so_line_item_id, dli.product_id, p.sku, p.name, dli.source_bin_id, b.code, dli.quantity_to_deliver
		FROM do_line_items dli
		JOIN products p ON dli.product_id = p.id
		JOIN warehouse_bins b ON dli.source_bin_id = b.id
		WHERE dli.tenant_id = $1 AND dli.delivery_order_id = $2
	`, tenantID, doID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch DO items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var it DOLineItem
		_ = rows.Scan(&it.ID, &it.TenantID, &it.DeliveryOrderID, &it.SOLineItemID, &it.ProductID, &it.ProductSKU, &it.ProductName, &it.SourceBinID, &it.BinCode, &it.QuantityToDeliver)
		d.Items = append(d.Items, &it)
	}
	return &d, nil
}
