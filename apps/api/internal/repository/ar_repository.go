package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

type ARAgingBucket struct {
	CustomerID      uuid.UUID `json:"customer_id"`
	CustomerName    string    `json:"customer_name"`
	CurrentCents    int64     `json:"current_cents"`
	Days1To30Cents  int64     `json:"days_1_to_30_cents"`
	Days31To60Cents int64     `json:"days_31_to_60_cents"`
	DaysOver60Cents int64     `json:"days_over_60_cents"`
	TotalDueCents   int64     `json:"total_due_cents"`
}

// GetARAgingReport aggregates outstanding balances into aging schedules (Current, 1-30, 31-60, 60+ days).
func (r *BillingRepository) GetARAgingReport(ctx context.Context, tenantID uuid.UUID) ([]*ARAgingBucket, error) {
	query := `
		SELECT c.id, c.company_name,
		       COALESCE(SUM(CASE WHEN inv.due_date >= CURRENT_DATE THEN inv.balance_due_cents ELSE 0 END), 0) AS current_cents,
		       COALESCE(SUM(CASE WHEN inv.due_date < CURRENT_DATE AND inv.due_date >= CURRENT_DATE - INTERVAL '30 days' THEN inv.balance_due_cents ELSE 0 END), 0) AS days_1_30,
		       COALESCE(SUM(CASE WHEN inv.due_date < CURRENT_DATE - INTERVAL '30 days' AND inv.due_date >= CURRENT_DATE - INTERVAL '60 days' THEN inv.balance_due_cents ELSE 0 END), 0) AS days_31_60,
		       COALESCE(SUM(CASE WHEN inv.due_date < CURRENT_DATE - INTERVAL '60 days' THEN inv.balance_due_cents ELSE 0 END), 0) AS days_over_60,
		       COALESCE(SUM(inv.balance_due_cents), 0) AS total_due
		FROM customers c
		JOIN customer_invoices inv ON c.id = inv.customer_id
		WHERE c.tenant_id = $1 AND inv.balance_due_cents > 0
		GROUP BY c.id, c.company_name
		ORDER BY total_due DESC
	`
	rows, err := r.db.Query(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate AR aging: %w", err)
	}
	defer rows.Close()

	var reports []*ARAgingBucket
	for rows.Next() {
		var b ARAgingBucket
		err := rows.Scan(&b.CustomerID, &b.CustomerName, &b.CurrentCents, &b.Days1To30Cents, &b.Days31To60Cents, &b.DaysOver60Cents, &b.TotalDueCents)
		if err != nil {
			return nil, fmt.Errorf("failed to scan aging record: %w", err)
		}
		reports = append(reports, &b)
	}
	return reports, nil
}
