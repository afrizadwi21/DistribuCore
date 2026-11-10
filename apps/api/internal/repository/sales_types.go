package repository

import (
	"time"

	"github.com/google/uuid"
)

type SalesOrderStatus string

const (
	SOStatusDraft           SalesOrderStatus = "DRAFT"
	SOStatusPendingApproval SalesOrderStatus = "PENDING_APPROVAL"
	SOStatusConfirmed       SalesOrderStatus = "CONFIRMED"
	SOStatusPartiallyPicked SalesOrderStatus = "PARTIALLY_PICKED"
	SOStatusFulfilled       SalesOrderStatus = "FULFILLED"
	SOStatusCancelled       SalesOrderStatus = "CANCELLED"
)

type CreditCheckStatus string

const (
	CreditStatusPending    CreditCheckStatus = "PENDING"
	CreditStatusApproved   CreditCheckStatus = "APPROVED"
	CreditStatusHeld       CreditCheckStatus = "HELD"
	CreditStatusOverridden CreditCheckStatus = "OVERRIDDEN"
)

type SOLineItem struct {
	ID                uuid.UUID `json:"id"`
	TenantID          uuid.UUID `json:"tenant_id"`
	SalesOrderID      uuid.UUID `json:"sales_order_id"`
	ProductID         uuid.UUID `json:"product_id"`
	ProductSKU        string    `json:"product_sku,omitempty"`
	ProductName       string    `json:"product_name,omitempty"`
	UOMID             uuid.UUID `json:"uom_id"`
	UOMCode           string    `json:"uom_code,omitempty"`
	OrderedQuantity   float64   `json:"ordered_quantity"`
	ReservedQuantity  float64   `json:"reserved_quantity"`
	DeliveredQuantity float64   `json:"delivered_quantity"`
	UnitPriceCents    int64     `json:"unit_price_cents"`
	SubtotalCents     int64     `json:"subtotal_cents"`
}

type SalesOrder struct {
	ID               uuid.UUID     `json:"id"`
	TenantID         uuid.UUID     `json:"tenant_id"`
	OrderNumber      string        `json:"order_number"`
	QuotationID      *uuid.UUID    `json:"quotation_id,omitempty"`
	CustomerID       uuid.UUID     `json:"customer_id"`
	CustomerName     string        `json:"customer_name,omitempty"`
	OrderStatus      string        `json:"order_status"`
	CreditStatus     string        `json:"credit_status"`
	TotalAmountCents int64         `json:"total_amount_cents"`
	OrderDate        time.Time     `json:"order_date"`
	CreatedBy        uuid.UUID     `json:"created_by"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
	Items            []*SOLineItem `json:"items,omitempty"`
}

type InventoryReservation struct {
	ID               uuid.UUID `json:"id"`
	TenantID         uuid.UUID `json:"tenant_id"`
	SOLineItemID     uuid.UUID `json:"so_line_item_id"`
	ProductID        uuid.UUID `json:"product_id"`
	WarehouseID      uuid.UUID `json:"warehouse_id"`
	WarehouseName    string    `json:"warehouse_name,omitempty"`
	ReservedQuantity float64   `json:"reserved_quantity"`
	Status           string    `json:"status"`
	ExpiresAt        time.Time `json:"expires_at"`
	CreatedAt        time.Time `json:"created_at"`
}
