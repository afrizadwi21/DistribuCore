package repository

import (
	"time"

	"github.com/google/uuid"
)

type PurchaseOrderStatus string

const (
	POStatusDraft             PurchaseOrderStatus = "DRAFT"
	POStatusSubmitted         PurchaseOrderStatus = "SUBMITTED"
	POStatusApproved          PurchaseOrderStatus = "APPROVED"
	POStatusPartiallyReceived PurchaseOrderStatus = "PARTIALLY_RECEIVED"
	POStatusCompleted         PurchaseOrderStatus = "COMPLETED"
	POStatusCancelled         PurchaseOrderStatus = "CANCELLED"
)

type POLineItem struct {
	ID                uuid.UUID `json:"id"`
	TenantID          uuid.UUID `json:"tenant_id"`
	PurchaseOrderID   uuid.UUID `json:"purchase_order_id"`
	ProductID         uuid.UUID `json:"product_id"`
	ProductSKU        string    `json:"product_sku,omitempty"`
	ProductName       string    `json:"product_name,omitempty"`
	UOMID             uuid.UUID `json:"uom_id"`
	UOMCode           string    `json:"uom_code,omitempty"`
	OrderedQuantity   float64   `json:"ordered_quantity"`
	ReceivedQuantity  float64   `json:"received_quantity"`
	RemainingQuantity float64   `json:"remaining_quantity"`
	UnitCostCents     int64     `json:"unit_cost_cents"`
	SubtotalCents     int64     `json:"subtotal_cents"`
}

type PurchaseOrder struct {
	ID                     uuid.UUID     `json:"id"`
	TenantID               uuid.UUID     `json:"tenant_id"`
	PONumber               string        `json:"po_number"`
	SupplierID             uuid.UUID     `json:"supplier_id"`
	SupplierName           string        `json:"supplier_name,omitempty"`
	DestinationWarehouseID uuid.UUID     `json:"destination_warehouse_id"`
	WarehouseName          string        `json:"warehouse_name,omitempty"`
	Status                 string        `json:"status"`
	IssuedDate             time.Time     `json:"issued_date"`
	ExpectedDeliveryDate   *time.Time    `json:"expected_delivery_date"`
	TotalAmountCents       int64         `json:"total_amount_cents"`
	CreatedBy              uuid.UUID     `json:"created_by"`
	CreatedAt              time.Time     `json:"created_at"`
	UpdatedAt              time.Time     `json:"updated_at"`
	Items                  []*POLineItem `json:"items,omitempty"`
}

type GRNLineItem struct {
	ID               uuid.UUID `json:"id"`
	TenantID         uuid.UUID `json:"tenant_id"`
	GRNID            uuid.UUID `json:"grn_id"`
	POLineItemID     uuid.UUID `json:"po_line_item_id"`
	ProductID        uuid.UUID `json:"product_id"`
	ProductSKU       string    `json:"product_sku,omitempty"`
	ProductName      string    `json:"product_name,omitempty"`
	TargetBinID      uuid.UUID `json:"target_bin_id"`
	BinCode          string    `json:"bin_code,omitempty"`
	QuantityReceived float64   `json:"quantity_received"`
}

type GoodsReceiptNote struct {
	ID                      uuid.UUID      `json:"id"`
	TenantID                uuid.UUID      `json:"tenant_id"`
	GRNNumber               string         `json:"grn_number"`
	PurchaseOrderID         uuid.UUID      `json:"purchase_order_id"`
	PONumber                string         `json:"po_number,omitempty"`
	WarehouseID             uuid.UUID      `json:"warehouse_id"`
	WarehouseName           string         `json:"warehouse_name,omitempty"`
	ReceivedDate            time.Time      `json:"received_date"`
	ReceivedBy              uuid.UUID      `json:"received_by"`
	SupplierDeliveryNoteRef *string        `json:"supplier_delivery_note_ref"`
	Status                  string         `json:"status"`
	Items                   []*GRNLineItem `json:"items,omitempty"`
}
