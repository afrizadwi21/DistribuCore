package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// CreateGoodsReceiptNote records receipt of inbound goods, increases physical stock, and logs audit ledger.
func (r *PurchaseRepository) CreateGoodsReceiptNote(ctx context.Context, grn *GoodsReceiptNote) (*GoodsReceiptNote, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var poStatus string
	var destWarehouseID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT status, destination_warehouse_id FROM purchase_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, grn.TenantID, grn.PurchaseOrderID).Scan(&poStatus, &destWarehouseID)
	if err != nil {
		return nil, fmt.Errorf("target purchase order not found: %w", err)
	}
	if poStatus != string(POStatusApproved) && poStatus != string(POStatusPartiallyReceived) {
		return nil, fmt.Errorf("cannot receive goods for PO status '%s'", poStatus)
	}

	if grn.WarehouseID == uuid.Nil {
		grn.WarehouseID = destWarehouseID
	}
	grn.Status = "COMPLETED"

	err = tx.QueryRow(ctx, `
		INSERT INTO goods_receipt_notes (tenant_id, grn_number, purchase_order_id, warehouse_id, received_date, received_by, supplier_delivery_note_ref, status)
		VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING id, received_date
	`, grn.TenantID, grn.GRNNumber, grn.PurchaseOrderID, grn.WarehouseID, grn.ReceivedBy, grn.SupplierDeliveryNoteRef, grn.Status).Scan(&grn.ID, &grn.ReceivedDate)
	if err != nil {
		return nil, fmt.Errorf("failed to insert GRN header: %w", err)
	}

	for _, item := range grn.Items {
		item.TenantID, item.GRNID = grn.TenantID, grn.ID
		var orderedQty, receivedQty float64
		var poProductID uuid.UUID
		err = tx.QueryRow(ctx, `SELECT product_id, ordered_quantity, received_quantity FROM po_line_items WHERE tenant_id = $1 AND id = $2 AND purchase_order_id = $3 FOR UPDATE`, grn.TenantID, item.POLineItemID, grn.PurchaseOrderID).Scan(&poProductID, &orderedQty, &receivedQty)
		if err != nil {
			return nil, fmt.Errorf("invalid po_line_item_id %s: %w", item.POLineItemID, err)
		}
		if (receivedQty + item.QuantityReceived) > orderedQty {
			return nil, fmt.Errorf("cannot over-receive: ordered %.4f, received %.4f, attempted %.4f", orderedQty, receivedQty, item.QuantityReceived)
		}
		item.ProductID = poProductID

		err = tx.QueryRow(ctx, `
			INSERT INTO grn_line_items (tenant_id, grn_id, po_line_item_id, product_id, target_bin_id, quantity_received)
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
		`, item.TenantID, item.GRNID, item.POLineItemID, item.ProductID, item.TargetBinID, item.QuantityReceived).Scan(&item.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert grn line item: %w", err)
		}

		_, _ = tx.Exec(ctx, `UPDATE po_line_items SET received_quantity = received_quantity + $1 WHERE tenant_id = $2 AND id = $3`, item.QuantityReceived, grn.TenantID, item.POLineItemID)

		_, _ = tx.Exec(ctx, `
			INSERT INTO inventory_balances (tenant_id, warehouse_id, bin_id, product_id, quantity_on_hand, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
			ON CONFLICT (tenant_id, warehouse_id, bin_id, product_id)
			DO UPDATE SET quantity_on_hand = inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand, updated_at = NOW()
		`, grn.TenantID, grn.WarehouseID, item.TargetBinID, item.ProductID, item.QuantityReceived)

		notes := fmt.Sprintf("Goods receipt under GRN %s", grn.GRNNumber)
		_, _ = tx.Exec(ctx, `
			INSERT INTO inventory_transactions (tenant_id, warehouse_id, bin_id, product_id, transaction_type, quantity_delta, reference_type, reference_id, performed_by, notes, created_at)
			VALUES ($1, $2, $3, $4, 'GRN_RECEIPT', $5, 'GRN', $6, $7, $8, NOW())
		`, grn.TenantID, grn.WarehouseID, item.TargetBinID, item.ProductID, item.QuantityReceived, grn.ID, grn.ReceivedBy, notes)
	}

	var unfulfilled int
	_ = tx.QueryRow(ctx, `SELECT COUNT(*) FROM po_line_items WHERE tenant_id = $1 AND purchase_order_id = $2 AND received_quantity < ordered_quantity`, grn.TenantID, grn.PurchaseOrderID).Scan(&unfulfilled)
	newStatus := POStatusCompleted
	if unfulfilled > 0 {
		newStatus = POStatusPartiallyReceived
	}
	_, _ = tx.Exec(ctx, `UPDATE purchase_orders SET status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3`, string(newStatus), grn.TenantID, grn.PurchaseOrderID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit GRN: %w", err)
	}
	return grn, nil
}
