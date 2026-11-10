package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type FulfillmentRepository struct {
	db *pgxpool.Pool
}

func NewFulfillmentRepository(db *pgxpool.Pool) *FulfillmentRepository {
	return &FulfillmentRepository{db: db}
}

// CreateDeliveryOrder stages a new delivery order (Surat Jalan) for shipment.
func (r *FulfillmentRepository) CreateDeliveryOrder(ctx context.Context, do *DeliveryOrder) (*DeliveryOrder, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var soStatus string
	err = tx.QueryRow(ctx, `SELECT order_status FROM sales_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, do.TenantID, do.SalesOrderID).Scan(&soStatus)
	if err != nil {
		return nil, fmt.Errorf("sales order not found: %w", err)
	}
	if soStatus != string(SOStatusConfirmed) && soStatus != string(SOStatusPartiallyPicked) {
		return nil, fmt.Errorf("cannot create delivery order for sales order status '%s'", soStatus)
	}

	do.DeliveryStatus = string(DeliveryStatusStaged)
	err = tx.QueryRow(ctx, `
		INSERT INTO delivery_orders (
			tenant_id, delivery_number, sales_order_id, origin_warehouse_id,
			delivery_status, driver_name, vehicle_registration, created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		RETURNING id, created_at
	`, do.TenantID, do.DeliveryNumber, do.SalesOrderID, do.OriginWarehouseID,
		do.DeliveryStatus, do.DriverName, do.VehicleRegistration,
	).Scan(&do.ID, &do.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert delivery order: %w", err)
	}

	for _, it := range do.Items {
		it.TenantID, it.DeliveryOrderID = do.TenantID, do.ID
		var orderedQty, deliveredQty float64
		err = tx.QueryRow(ctx, `
			SELECT ordered_quantity, delivered_quantity FROM so_line_items
			WHERE tenant_id = $1 AND id = $2 AND sales_order_id = $3 FOR UPDATE
		`, do.TenantID, it.SOLineItemID, do.SalesOrderID).Scan(&orderedQty, &deliveredQty)
		if err != nil {
			return nil, fmt.Errorf("invalid so_line_item_id %s: %w", it.SOLineItemID, err)
		}

		if (deliveredQty + it.QuantityToDeliver) > orderedQty {
			return nil, fmt.Errorf("cannot over-deliver: ordered %.4f, delivered %.4f, attempting %.4f", orderedQty, deliveredQty, it.QuantityToDeliver)
		}

		err = tx.QueryRow(ctx, `
			INSERT INTO do_line_items (tenant_id, delivery_order_id, so_line_item_id, product_id, source_bin_id, quantity_to_deliver)
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
		`, it.TenantID, it.DeliveryOrderID, it.SOLineItemID, it.ProductID, it.SourceBinID, it.QuantityToDeliver).Scan(&it.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to insert delivery order item: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit delivery order: %w", err)
	}
	return do, nil
}
