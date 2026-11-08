package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Customer struct {
	ID                     uuid.UUID  `json:"id"`
	TenantID               uuid.UUID  `json:"tenant_id"`
	Code                   string     `json:"code"`
	CompanyName            string     `json:"company_name"`
	ContactPerson          *string    `json:"contact_person"`
	Email                  *string    `json:"email"`
	Phone                  *string    `json:"phone"`
	PriceTierID            *uuid.UUID `json:"price_tier_id"`
	CreditLimitCents       int64      `json:"credit_limit_cents"`
	OutstandingBalanceCents int64     `json:"outstanding_balance_cents"`
	PaymentTermsDays       int        `json:"payment_terms_days"`
	IsCreditHeld           bool       `json:"is_credit_held"`
	IsActive               bool       `json:"is_active"`
	CreatedAt              time.Time  `json:"created_at"`
}

type Supplier struct {
	ID               uuid.UUID `json:"id"`
	TenantID         uuid.UUID `json:"tenant_id"`
	Code             string    `json:"code"`
	CompanyName      string    `json:"company_name"`
	ContactPerson    *string   `json:"contact_person"`
	Email            *string   `json:"email"`
	Phone            *string   `json:"phone"`
	PaymentTermsDays int       `json:"payment_terms_days"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
}

type PartnerRepository struct {
	db *pgxpool.Pool
}

func NewPartnerRepository(db *pgxpool.Pool) *PartnerRepository {
	return &PartnerRepository{db: db}
}

// CreateCustomer creates a new customer profile with credit control limits.
func (r *PartnerRepository) CreateCustomer(ctx context.Context, c *Customer) (*Customer, error) {
	err := r.db.QueryRow(ctx, `
		INSERT INTO customers (
			tenant_id, code, company_name, contact_person, email, phone,
			price_tier_id, credit_limit_cents, outstanding_balance_cents,
			payment_terms_days, is_credit_held, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at
	`,
		c.TenantID, c.Code, c.CompanyName, c.ContactPerson, c.Email, c.Phone,
		c.PriceTierID, c.CreditLimitCents, c.OutstandingBalanceCents,
		c.PaymentTermsDays, c.IsCreditHeld, c.IsActive,
	).Scan(&c.ID, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	return c, nil
}

// ListCustomersByTenant retrieves all customers scoped to a tenant.
func (r *PartnerRepository) ListCustomersByTenant(ctx context.Context, tenantID uuid.UUID) ([]*Customer, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, tenant_id, code, company_name, contact_person, email, phone,
		       price_tier_id, credit_limit_cents, outstanding_balance_cents,
		       payment_terms_days, is_credit_held, is_active, created_at
		FROM customers
		WHERE tenant_id = $1
		ORDER BY company_name ASC
	`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query customers: %w", err)
	}
	defer rows.Close()

	var customers []*Customer
	for rows.Next() {
		var c Customer
		if err := rows.Scan(
			&c.ID, &c.TenantID, &c.Code, &c.CompanyName, &c.ContactPerson, &c.Email, &c.Phone,
			&c.PriceTierID, &c.CreditLimitCents, &c.OutstandingBalanceCents,
			&c.PaymentTermsDays, &c.IsCreditHeld, &c.IsActive, &c.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan customer row: %w", err)
		}
		customers = append(customers, &c)
	}

	return customers, nil
}

// CreateSupplier registers a new supplier/vendor.
func (r *PartnerRepository) CreateSupplier(ctx context.Context, s *Supplier) (*Supplier, error) {
	err := r.db.QueryRow(ctx, `
		INSERT INTO suppliers (
			tenant_id, code, company_name, contact_person, email, phone,
			payment_terms_days, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`,
		s.TenantID, s.Code, s.CompanyName, s.ContactPerson, s.Email, s.Phone,
		s.PaymentTermsDays, s.IsActive,
	).Scan(&s.ID, &s.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create supplier: %w", err)
	}

	return s, nil
}

// ListSuppliersByTenant retrieves all suppliers scoped to a tenant.
func (r *PartnerRepository) ListSuppliersByTenant(ctx context.Context, tenantID uuid.UUID) ([]*Supplier, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, tenant_id, code, company_name, contact_person, email, phone,
		       payment_terms_days, is_active, created_at
		FROM suppliers
		WHERE tenant_id = $1
		ORDER BY company_name ASC
	`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query suppliers: %w", err)
	}
	defer rows.Close()

	var suppliers []*Supplier
	for rows.Next() {
		var s Supplier
		if err := rows.Scan(
			&s.ID, &s.TenantID, &s.Code, &s.CompanyName, &s.ContactPerson, &s.Email, &s.Phone,
			&s.PaymentTermsDays, &s.IsActive, &s.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan supplier row: %w", err)
		}
		suppliers = append(suppliers, &s)
	}

	return suppliers, nil
}
