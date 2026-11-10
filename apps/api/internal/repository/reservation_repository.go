package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// ConfirmAndReserveStock locks inventory for confirmed sales order items atomically.
func (r *SalesRepository) ConfirmAndReserveStock(ctx context.Context, tenantID, orderID, warehouseID uuid.UUID) (*SalesOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var orderStatus, creditStatus string
	err = tx.QueryRow(ctx, `SELECT order_status, credit_status FROM sales_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, tenantID, orderID).Scan(&orderStatus, &creditStatus)
	if err != nil {
		return nil, fmt.Errorf("sales order not found: %w", err)
	}
	if creditStatus == string(CreditStatusHeld) {
		return nil, fmt.Errorf("cannot confirm order on credit hold")
	}
	if orderStatus != string(SOStatusPendingApproval) && orderStatus != string(SOStatusDraft) {
		return nil, fmt.Errorf("order cannot be confirmed from status '%s'", orderStatus)
	}

	rows, err := tx.Query(ctx, `SELECT id, product_id, ordered_quantity FROM so_line_items WHERE tenant_id = $1 AND sales_order_id = $2`, tenantID, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch order items: %w", err)
	}
	defer rows.Close()

	type itemToReserve struct {
		id  uuid.UUID
		pid uuid.UUID
		qty float64
	}
	var items []itemToReserve
	for rows.Next() {
		var it itemToReserve
		_ = rows.Scan(&it.id, &it.pid, &it.qty)
		items = append(items, it)
	}

	expiresAt := time.Now().Add(48 * time.Hour)
	for _, it := range items {
		var onHand, reserved float64
		_ = tx.QueryRow(ctx, `SELECT COALESCE(SUM(quantity_on_hand), 0) FROM inventory_balances WHERE tenant_id = $1 AND warehouse_id = $2 AND product_id = $3`, tenantID, warehouseID, it.pid).Scan(&onHand)
		_ = tx.QueryRow(ctx, `SELECT COALESCE(SUM(reserved_quantity), 0) FROM inventory_reservations WHERE tenant_id = $1 AND warehouse_id = $2 AND product_id = $3 AND status = 'ACTIVE'`, tenantID, warehouseID, it.pid).Scan(&reserved)

		atp := onHand - reserved
		if atp < it.qty {
			return nil, fmt.Errorf("insufficient stock for product %s: ATP %.4f, required %.4f", it.pid, atp, it.qty)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO inventory_reservations (tenant_id, so_line_item_id, product_id, warehouse_id, reserved_quantity, status, expires_at, created_at)
			VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, NOW())
		`, tenantID, it.id, it.pid, warehouseID, it.qty, expiresAt)
		if err != nil {
			return nil, fmt.Errorf("failed to create reservation: %w", err)
		}

		_, _ = tx.Exec(ctx, `UPDATE so_line_items SET reserved_quantity = $1 WHERE tenant_id = $2 AND id = $3`, it.qty, tenantID, it.id)
	}

	_, _ = tx.Exec(ctx, `UPDATE sales_orders SET order_status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, string(SOStatusConfirmed), tenantID, orderID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit stock reservation: %w", err)
	}
	return r.GetSalesOrderByID(ctx, tenantID, orderID)
}
