package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// GetPurchaseOrderByID fetches a single PO along with all its line items and remaining quantities.
func (r *PurchaseRepository) GetPurchaseOrderByID(ctx context.Context, tenantID, poID uuid.UUID) (*PurchaseOrder, error) {
	var po PurchaseOrder
	err := r.db.QueryRow(ctx, `
		SELECT po.id, po.tenant_id, po.po_number, po.supplier_id, s.company_name AS supplier_name,
		       po.destination_warehouse_id, w.name AS warehouse_name, po.status,
		       po.issued_date, po.expected_delivery_date, po.total_amount_cents,
		       po.created_by, po.created_at, po.updated_at
		FROM purchase_orders po
		JOIN suppliers s ON po.supplier_id = s.id
		JOIN warehouses w ON po.destination_warehouse_id = w.id
		WHERE po.tenant_id = $1 AND po.id = $2
	`, tenantID, poID).Scan(
		&po.ID, &po.TenantID, &po.PONumber, &po.SupplierID, &po.SupplierName,
		&po.DestinationWarehouseID, &po.WarehouseName, &po.Status,
		&po.IssuedDate, &po.ExpectedDeliveryDate, &po.TotalAmountCents,
		&po.CreatedBy, &po.CreatedAt, &po.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("purchase order not found: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT pli.id, pli.tenant_id, pli.purchase_order_id, pli.product_id,
		       p.sku AS product_sku, p.name AS product_name,
		       pli.uom_id, u.code AS uom_code,
		       pli.ordered_quantity, pli.received_quantity,
		       (pli.ordered_quantity - pli.received_quantity) AS remaining_quantity,
		       pli.unit_cost_cents, pli.subtotal_cents
		FROM po_line_items pli
		JOIN products p ON pli.product_id = p.id
		JOIN units_of_measure u ON pli.uom_id = u.id
		WHERE pli.tenant_id = $1 AND pli.purchase_order_id = $2
		ORDER BY pli.id ASC
	`, tenantID, poID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch po line items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item POLineItem
		err := rows.Scan(
			&item.ID, &item.TenantID, &item.PurchaseOrderID, &item.ProductID,
			&item.ProductSKU, &item.ProductName,
			&item.UOMID, &item.UOMCode,
			&item.OrderedQuantity, &item.ReceivedQuantity,
			&item.RemainingQuantity,
			&item.UnitCostCents, &item.SubtotalCents,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan po line item: %w", err)
		}
		po.Items = append(po.Items, &item)
	}

	return &po, nil
}

// UpdatePOStatus changes status of a purchase order (e.g., DRAFT -> SUBMITTED -> APPROVED -> CANCELLED).
func (r *PurchaseRepository) UpdatePOStatus(ctx context.Context, tenantID, poID uuid.UUID, newStatus PurchaseOrderStatus) (*PurchaseOrder, error) {
	_, err := r.db.Exec(ctx, `
		UPDATE purchase_orders
		SET status = $1, updated_at = NOW()
		WHERE tenant_id = $2 AND id = $3 AND status NOT IN ('COMPLETED', 'CANCELLED')
	`, string(newStatus), tenantID, poID)
	if err != nil {
		return nil, fmt.Errorf("failed to update purchase order status: %w", err)
	}

	return r.GetPurchaseOrderByID(ctx, tenantID, poID)
}
