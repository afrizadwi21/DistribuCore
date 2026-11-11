package repository

import (
	"time"

	"github.com/google/uuid"
)

type InvoiceStatus string

const (
	InvoiceStatusIssued        InvoiceStatus = "ISSUED"
	InvoiceStatusPartiallyPaid InvoiceStatus = "PARTIALLY_PAID"
	InvoiceStatusPaid          InvoiceStatus = "PAID"
	InvoiceStatusVoid          InvoiceStatus = "VOID"
)

type InvoiceLineItem struct {
	ID              uuid.UUID `json:"id"`
	TenantID        uuid.UUID `json:"tenant_id"`
	InvoiceID       uuid.UUID `json:"invoice_id"`
	ProductID       uuid.UUID `json:"product_id"`
	ProductSKU      string    `json:"product_sku,omitempty"`
	ProductName     string    `json:"product_name,omitempty"`
	Quantity        float64   `json:"quantity"`
	UnitPriceCents  int64     `json:"unit_price_cents"`
	SubtotalCents   int64     `json:"subtotal_cents"`
}

type CustomerInvoice struct {
	ID               uuid.UUID          `json:"id"`
	TenantID         uuid.UUID          `json:"tenant_id"`
	InvoiceNumber    string             `json:"invoice_number"`
	CustomerID       uuid.UUID          `json:"customer_id"`
	CustomerName     string             `json:"customer_name,omitempty"`
	SalesOrderID     *uuid.UUID         `json:"sales_order_id,omitempty"`
	DeliveryOrderID  *uuid.UUID         `json:"delivery_order_id,omitempty"`
	Status           string             `json:"status"`
	IssueDate        time.Time          `json:"issue_date"`
	DueDate          time.Time          `json:"due_date"`
	SubtotalCents    int64              `json:"subtotal_cents"`
	TaxCents         int64              `json:"tax_cents"`
	TotalAmountCents int64              `json:"total_amount_cents"`
	BalanceDueCents  int64              `json:"balance_due_cents"`
	CreatedAt        time.Time          `json:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at"`
	Items            []*InvoiceLineItem `json:"items,omitempty"`
}

type CustomerPayment struct {
	ID               uuid.UUID `json:"id"`
	TenantID         uuid.UUID `json:"tenant_id"`
	PaymentNumber    string    `json:"payment_number"`
	CustomerID       uuid.UUID `json:"customer_id"`
	CustomerName     string    `json:"customer_name,omitempty"`
	PaymentMethod    string    `json:"payment_method"`
	PaymentDate      time.Time `json:"payment_date"`
	AmountCents      int64     `json:"amount_cents"`
	UnallocatedCents int64     `json:"unallocated_cents"`
	ReferenceNumber  *string   `json:"reference_number"`
	ReceivedBy       uuid.UUID `json:"received_by"`
	CreatedAt        time.Time `json:"created_at"`
}

type PaymentAllocation struct {
	ID                   uuid.UUID `json:"id"`
	TenantID             uuid.UUID `json:"tenant_id"`
	PaymentID            uuid.UUID `json:"payment_id"`
	InvoiceID            uuid.UUID `json:"invoice_id"`
	AllocatedAmountCents int64     `json:"allocated_amount_cents"`
	AllocatedAt          time.Time `json:"allocated_at"`
	AllocatedBy          uuid.UUID `json:"allocated_by"`
}
