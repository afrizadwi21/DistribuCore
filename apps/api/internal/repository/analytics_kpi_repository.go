package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsRepository struct {
	db *pgxpool.Pool
}

func NewAnalyticsRepository(db *pgxpool.Pool) *AnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

// GetExecutiveKPIs aggregates real-time executive dashboard metrics for revenue, AR, and stock.
func (r *AnalyticsRepository) GetExecutiveKPIs(ctx context.Context, tenantID uuid.UUID) (*ExecutiveKPIs, error) {
	kpi := &ExecutiveKPIs{}

	query := `
		SELECT
			COALESCE((SELECT SUM(total_amount_cents) FROM customer_invoices WHERE tenant_id = $1 AND status != 'VOID'), 0),
			COALESCE((SELECT SUM(balance_due_cents) FROM customer_invoices WHERE tenant_id = $1 AND status != 'VOID'), 0),
			COALESCE((SELECT COUNT(*) FROM sales_orders WHERE tenant_id = $1 AND order_status IN ('PENDING_APPROVAL', 'CONFIRMED', 'PARTIALLY_PICKED')), 0),
			COALESCE((SELECT COUNT(*) FROM products WHERE tenant_id = $1), 0),
			COALESCE((SELECT SUM(quantity_on_hand) FROM inventory_balances WHERE tenant_id = $1), 0),
			COALESCE((SELECT SUM(unallocated_cents) FROM customer_payments WHERE tenant_id = $1), 0)
	`
	err := r.db.QueryRow(ctx, query, tenantID).Scan(
		&kpi.TotalRevenueCents,
		&kpi.TotalOutstandingARCents,
		&kpi.ActiveOrdersCount,
		&kpi.TotalProductsCatalogued,
		&kpi.TotalStockOnHandUnits,
		&kpi.TotalUnallocatedCents,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to aggregate executive KPIs: %w", err)
	}
	return kpi, nil
}
