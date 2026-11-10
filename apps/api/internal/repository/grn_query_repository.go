package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListGoodsReceiptNotes retrieves paginated GRNs with PO and warehouse references.
func (r *PurchaseRepository) ListGoodsReceiptNotes(ctx context.Context, tenantID uuid.UUID, poID *uuid.UUID, page, limit int) ([]*GoodsReceiptNote, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := "WHERE grn.tenant_id = $1"
	args := []interface{}{tenantID}
	if poID != nil && *poID != uuid.Nil {
		where += " AND grn.purchase_order_id = $2"
		args = append(args, *poID)
	}

	var total int
	_ = r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM goods_receipt_notes grn %s", where), args...).Scan(&total)

	query := fmt.Sprintf(`
		SELECT grn.id, grn.tenant_id, grn.grn_number, grn.purchase_order_id, po.po_number,
		       grn.warehouse_id, w.name, grn.received_date, grn.received_by, grn.supplier_delivery_note_ref, grn.status
		FROM goods_receipt_notes grn
		JOIN purchase_orders po ON grn.purchase_order_id = po.id
		JOIN warehouses w ON grn.warehouse_id = w.id
		%s ORDER BY grn.received_date DESC LIMIT $%d OFFSET $%d
	`, where, len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list GRNs: %w", err)
	}
	defer rows.Close()

	var grns []*GoodsReceiptNote
	for rows.Next() {
		var g GoodsReceiptNote
		_ = rows.Scan(&g.ID, &g.TenantID, &g.GRNNumber, &g.PurchaseOrderID, &g.PONumber, &g.WarehouseID, &g.WarehouseName, &g.ReceivedDate, &g.ReceivedBy, &g.SupplierDeliveryNoteRef, &g.Status)
		grns = append(grns, &g)
	}
	return grns, total, nil
}

// GetGoodsReceiptNoteByID fetches a single GRN with its line items.
func (r *PurchaseRepository) GetGoodsReceiptNoteByID(ctx context.Context, tenantID, grnID uuid.UUID) (*GoodsReceiptNote, error) {
	var g GoodsReceiptNote
	err := r.db.QueryRow(ctx, `
		SELECT grn.id, grn.tenant_id, grn.grn_number, grn.purchase_order_id, po.po_number,
		       grn.warehouse_id, w.name, grn.received_date, grn.received_by, grn.supplier_delivery_note_ref, grn.status
		FROM goods_receipt_notes grn
		JOIN purchase_orders po ON grn.purchase_order_id = po.id
		JOIN warehouses w ON grn.warehouse_id = w.id
		WHERE grn.tenant_id = $1 AND grn.id = $2
	`, tenantID, grnID).Scan(&g.ID, &g.TenantID, &g.GRNNumber, &g.PurchaseOrderID, &g.PONumber, &g.WarehouseID, &g.WarehouseName, &g.ReceivedDate, &g.ReceivedBy, &g.SupplierDeliveryNoteRef, &g.Status)
	if err != nil {
		return nil, fmt.Errorf("GRN not found: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT gli.id, gli.tenant_id, gli.grn_id, gli.po_line_item_id, gli.product_id,
		       p.sku, p.name, gli.target_bin_id, b.code, gli.quantity_received
		FROM grn_line_items gli
		JOIN products p ON gli.product_id = p.id
		JOIN warehouse_bins b ON gli.target_bin_id = b.id
		WHERE gli.tenant_id = $1 AND gli.grn_id = $2
	`, tenantID, grnID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch GRN items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item GRNLineItem
		_ = rows.Scan(&item.ID, &item.TenantID, &item.GRNID, &item.POLineItemID, &item.ProductID, &item.ProductSKU, &item.ProductName, &item.TargetBinID, &item.BinCode, &item.QuantityReceived)
		g.Items = append(g.Items, &item)
	}
	return &g, nil
}
