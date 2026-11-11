package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// RecordPaymentAndAllocate records incoming funds and allocates payment to an outstanding invoice atomically.
func (r *BillingRepository) RecordPaymentAndAllocate(ctx context.Context, p *CustomerPayment, invoiceID uuid.UUID, allocateCents int64) (*CustomerPayment, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if allocateCents > p.AmountCents {
		return nil, fmt.Errorf("allocated amount cannot exceed payment amount")
	}
	p.UnallocatedCents = p.AmountCents - allocateCents

	err = tx.QueryRow(ctx, `
		INSERT INTO customer_payments (tenant_id, payment_number, customer_id, payment_method, payment_date, amount_cents, unallocated_cents, reference_number, received_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id, created_at
	`, p.TenantID, p.PaymentNumber, p.CustomerID, p.PaymentMethod, p.PaymentDate, p.AmountCents, p.UnallocatedCents, p.ReferenceNumber, p.ReceivedBy).Scan(&p.ID, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert payment: %w", err)
	}

	if allocateCents > 0 {
		var balanceDue int64
		err = tx.QueryRow(ctx, `SELECT balance_due_cents FROM customer_invoices WHERE tenant_id = $1 AND id = $2 FOR UPDATE`, p.TenantID, invoiceID).Scan(&balanceDue)
		if err != nil {
			return nil, fmt.Errorf("target invoice not found: %w", err)
		}
		if allocateCents > balanceDue {
			return nil, fmt.Errorf("allocated amount (%d) exceeds balance due (%d)", allocateCents, balanceDue)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO payment_allocations (tenant_id, payment_id, invoice_id, allocated_amount_cents, allocated_at, allocated_by)
			VALUES ($1, $2, $3, $4, NOW(), $5)
		`, p.TenantID, p.ID, invoiceID, allocateCents, p.ReceivedBy)
		if err != nil {
			return nil, fmt.Errorf("failed to insert allocation: %w", err)
		}

		newBalance := balanceDue - allocateCents
		newStatus := InvoiceStatusPartiallyPaid
		if newBalance == 0 {
			newStatus = InvoiceStatusPaid
		}
		_, _ = tx.Exec(ctx, `UPDATE customer_invoices SET balance_due_cents = $1, status = $2, updated_at = NOW() WHERE tenant_id = $3 AND id = $4`, newBalance, string(newStatus), p.TenantID, invoiceID)

		_, _ = tx.Exec(ctx, `
			UPDATE customers
			SET outstanding_balance_cents = GREATEST(0, outstanding_balance_cents - $1),
			    is_credit_held = CASE WHEN (outstanding_balance_cents - $1) <= credit_limit_cents THEN FALSE ELSE is_credit_held END
			WHERE tenant_id = $2 AND id = $3
		`, allocateCents, p.TenantID, p.CustomerID)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit payment: %w", err)
	}
	return p, nil
}
