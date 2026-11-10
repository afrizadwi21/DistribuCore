package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// DispatchDeliveryOrder marks a staged DO as in transit with assigned vehicle.
func (r *FulfillmentRepository) DispatchDeliveryOrder(ctx context.Context, tenantID, doID uuid.UUID) (*DeliveryOrder, error) {
	_, err := r.db.Exec(ctx, `
		UPDATE delivery_orders
		SET delivery_status = 'DISPATCHED', dispatched_at = NOW()
		WHERE tenant_id = $1 AND id = $2 AND delivery_status = 'STAGED'
	`, tenantID, doID)
	if err != nil {
		return nil, fmt.Errorf("failed to dispatch delivery order: %w", err)
	}
	return r.GetDeliveryOrderByID(ctx, tenantID, doID)
}

// SubmitProofOfDelivery records physical receipt by client, deducts on-hand stock, and releases reservations atomically.
func (r *FulfillmentRepository) SubmitProofOfDelivery(ctx context.Context, pod *ProofOfDelivery) (*ProofOfDelivery, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var soID, whID uuid.UUID
	var doNum string
	err = tx.QueryRow(ctx, `
		SELECT sales_order_id, origin_warehouse_id, delivery_number
		FROM delivery_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE
	`, pod.TenantID, pod.DeliveryOrderID).Scan(&soID, &whID, &doNum)
	if err != nil {
		return nil, fmt.Errorf("delivery order not found: %w", err)
	}

	pod.ReceivedStatus = "ACCEPTED_FULL"
	err = tx.QueryRow(ctx, `
		INSERT INTO proof_of_deliveries (
			tenant_id, delivery_order_id, recipient_name, recipient_signature_url,
			delivery_photo_url, delivery_confirmed_at, received_status, rejection_reason, created_at
		)
		VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, NOW())
		RETURNING id, delivery_confirmed_at, created_at
	`, pod.TenantID, pod.DeliveryOrderID, pod.RecipientName, pod.RecipientSignatureURL,
		pod.DeliveryPhotoURL, pod.ReceivedStatus, pod.RejectionReason,
	).Scan(&pod.ID, &pod.DeliveryConfirmedAt, &pod.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to record proof of delivery: %w", err)
	}

	_, _ = tx.Exec(ctx, `UPDATE delivery_orders SET delivery_status = 'DELIVERED' WHERE tenant_id = $1 AND id = $2`, pod.TenantID, pod.DeliveryOrderID)

	rows, err := tx.Query(ctx, `SELECT so_line_item_id, product_id, source_bin_id, quantity_to_deliver FROM do_line_items WHERE tenant_id = $1 AND delivery_order_id = $2`, pod.TenantID, pod.DeliveryOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch DO items: %w", err)
	}
	defer rows.Close()

	type dItem struct {
		soItemID, prodID, binID uuid.UUID
		qty                     float64
	}
	var items []dItem
	for rows.Next() {
		var it dItem
		_ = rows.Scan(&it.soItemID, &it.prodID, &it.binID, &it.qty)
		items = append(items, it)
	}

	for _, it := range items {
		_, _ = tx.Exec(ctx, `UPDATE inventory_balances SET quantity_on_hand = GREATEST(0, quantity_on_hand - $1), updated_at = NOW() WHERE tenant_id = $2 AND warehouse_id = $3 AND bin_id = $4 AND product_id = $5`, it.qty, pod.TenantID, whID, it.binID, it.prodID)
		notes := fmt.Sprintf("Fulfillment delivery %s with confirmed POD", doNum)
		_, _ = tx.Exec(ctx, `INSERT INTO inventory_transactions (tenant_id, warehouse_id, bin_id, product_id, transaction_type, quantity_delta, reference_type, reference_id, performed_by, notes, created_at) VALUES ($1, $2, $3, $4, 'DISPATCH_FULFILLMENT', -$5, 'POD', $6, $7, $8, NOW())`, pod.TenantID, whID, it.binID, it.prodID, it.qty, pod.ID, pod.TenantID, notes)
		_, _ = tx.Exec(ctx, `UPDATE so_line_items SET delivered_quantity = delivered_quantity + $1, reserved_quantity = GREATEST(0, reserved_quantity - $1) WHERE tenant_id = $2 AND id = $3`, it.qty, pod.TenantID, it.soItemID)
		_, _ = tx.Exec(ctx, `UPDATE inventory_reservations SET status = 'FULFILLED' WHERE tenant_id = $1 AND so_line_item_id = $2 AND status = 'ACTIVE'`, pod.TenantID, it.soItemID)
	}

	var unfulfilled int
	_ = tx.QueryRow(ctx, `SELECT COUNT(*) FROM so_line_items WHERE tenant_id = $1 AND sales_order_id = $2 AND delivered_quantity < ordered_quantity`, pod.TenantID, soID).Scan(&unfulfilled)
	newSOStatus := SOStatusFulfilled
	if unfulfilled > 0 {
		newSOStatus = SOStatusPartiallyPicked
	}
	_, _ = tx.Exec(ctx, `UPDATE sales_orders SET order_status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, string(newSOStatus), pod.TenantID, soID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit POD fulfillment: %w", err)
	}
	return pod, nil
}
