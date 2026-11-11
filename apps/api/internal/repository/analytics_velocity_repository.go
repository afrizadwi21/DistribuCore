package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// GetSalesVelocity returns top performing SKUs ranked by revenue and units sold.
func (r *AnalyticsRepository) GetSalesVelocity(ctx context.Context, tenantID uuid.UUID, limit int) ([]*SKUSalesVelocity, error) {
	if limit < 1 || limit > 100 {
		limit = 10
	}
	query := `
		SELECT p.id, p.sku, p.name,
		       COALESCE(SUM(sli.ordered_quantity), 0) AS total_qty,
		       COALESCE(SUM(sli.subtotal_cents), 0) AS total_revenue,
		       COUNT(DISTINCT sli.sales_order_id) AS orders_count
		FROM products p
		JOIN so_line_items sli ON p.id = sli.product_id
		JOIN sales_orders so ON sli.sales_order_id = so.id
		WHERE p.tenant_id = $1 AND so.order_status != 'CANCELLED'
		GROUP BY p.id, p.sku, p.name
		ORDER BY total_revenue DESC
		LIMIT $2
	`
	rows, err := r.db.Query(ctx, query, tenantID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate sales velocity: %w", err)
	}
	defer rows.Close()

	var results []*SKUSalesVelocity
	for rows.Next() {
		var s SKUSalesVelocity
		_ = rows.Scan(&s.ProductID, &s.SKU, &s.ProductName, &s.TotalQuantity, &s.TotalRevenue, &s.OrdersCount)
		results = append(results, &s)
	}
	return results, nil
}

// GetInventoryHealth computes stock health across SKUs compared to safety thresholds.
func (r *AnalyticsRepository) GetInventoryHealth(ctx context.Context, tenantID uuid.UUID) ([]*InventoryHealthMetric, error) {
	query := `
		SELECT p.id, p.sku, p.name,
		       COALESCE(SUM(ib.quantity_on_hand), 0) AS on_hand,
		       p.safety_stock_quantity, p.reorder_point_quantity,
		       CASE
		           WHEN COALESCE(SUM(ib.quantity_on_hand), 0) <= p.safety_stock_quantity THEN 'CRITICAL_LOW'
		           WHEN COALESCE(SUM(ib.quantity_on_hand), 0) <= p.reorder_point_quantity THEN 'WARNING_REORDER'
		           ELSE 'HEALTHY'
		       END AS health_status
		FROM products p
		LEFT JOIN inventory_balances ib ON p.id = ib.product_id
		WHERE p.tenant_id = $1
		GROUP BY p.id, p.sku, p.name, p.safety_stock_quantity, p.reorder_point_quantity
		ORDER BY on_hand ASC
		LIMIT 20
	`
	rows, err := r.db.Query(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query inventory health: %w", err)
	}
	defer rows.Close()

	var results []*InventoryHealthMetric
	for rows.Next() {
		var m InventoryHealthMetric
		_ = rows.Scan(&m.ProductID, &m.SKU, &m.ProductName, &m.QuantityOnHand, &m.SafetyStock, &m.ReorderPoint, &m.HealthStatus)
		results = append(results, &m)
	}
	return results, nil
}
