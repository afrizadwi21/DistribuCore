package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// ListPurchaseOrders returns paginated purchase orders with supplier and warehouse metadata.
func (r *PurchaseRepository) ListPurchaseOrders(ctx context.Context, tenantID uuid.UUID, supplierID *uuid.UUID, status string, page, limit int) ([]*PurchaseOrder, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	whereClause := "WHERE po.tenant_id = $1"
	args := []interface{}{tenantID}
	argIdx := 2

	if supplierID != nil && *supplierID != uuid.Nil {
		whereClause += fmt.Sprintf(" AND po.supplier_id = $%d", argIdx)
		args = append(args, *supplierID)
		argIdx++
	}
	if status != "" {
		whereClause += fmt.Sprintf(" AND po.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM purchase_orders po %s", whereClause)
	var totalCount int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("failed to count purchase orders: %w", err)
	}

	query := fmt.Sprintf(`
		SELECT po.id, po.tenant_id, po.po_number, po.supplier_id, s.company_name AS supplier_name,
		       po.destination_warehouse_id, w.name AS warehouse_name, po.status,
		       po.issued_date, po.expected_delivery_date, po.total_amount_cents,
		       po.created_by, po.created_at, po.updated_at
		FROM purchase_orders po
		JOIN suppliers s ON po.supplier_id = s.id
		JOIN warehouses w ON po.destination_warehouse_id = w.id
		%s
		ORDER BY po.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list purchase orders: %w", err)
	}
	defer rows.Close()

	var orders []*PurchaseOrder
	for rows.Next() {
		var po PurchaseOrder
		err := rows.Scan(
			&po.ID, &po.TenantID, &po.PONumber, &po.SupplierID, &po.SupplierName,
			&po.DestinationWarehouseID, &po.WarehouseName, &po.Status,
			&po.IssuedDate, &po.ExpectedDeliveryDate, &po.TotalAmountCents,
			&po.CreatedBy, &po.CreatedAt, &po.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan purchase order: %w", err)
		}
		orders = append(orders, &po)
	}

	return orders, totalCount, nil
}
