package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// CancelAndReleaseStock cancels an order and releases all active stock reservations atomically.
func (r *SalesRepository) CancelAndReleaseStock(ctx context.Context, tenantID, orderID uuid.UUID) (*SalesOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var currentStatus string
	err = tx.QueryRow(ctx, `SELECT order_status FROM sales_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, tenantID, orderID).Scan(&currentStatus)
	if err != nil {
		return nil, fmt.Errorf("sales order not found: %w", err)
	}
	if currentStatus == string(SOStatusFulfilled) || currentStatus == string(SOStatusCancelled) {
		return nil, fmt.Errorf("cannot cancel order with status '%s'", currentStatus)
	}

	_, err = tx.Exec(ctx, `
		UPDATE inventory_reservations
		SET status = 'RELEASED'
		WHERE tenant_id = $1 AND so_line_item_id IN (
			SELECT id FROM so_line_items WHERE tenant_id = $1 AND sales_order_id = $2
		) AND status = 'ACTIVE'
	`, tenantID, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to release stock reservations: %w", err)
	}

	_, _ = tx.Exec(ctx, `UPDATE so_line_items SET reserved_quantity = 0 WHERE tenant_id = $1 AND sales_order_id = $2`, tenantID, orderID)
	_, _ = tx.Exec(ctx, `UPDATE sales_orders SET order_status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, string(SOStatusCancelled), tenantID, orderID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit order cancellation: %w", err)
	}
	return r.GetSalesOrderByID(ctx, tenantID, orderID)
}
