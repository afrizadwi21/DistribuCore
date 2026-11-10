package repository

import (
	"time"

	"github.com/google/uuid"
)

type DeliveryStatus string

const (
	DeliveryStatusStaged     DeliveryStatus = "STAGED"
	DeliveryStatusDispatched DeliveryStatus = "DISPATCHED"
	DeliveryStatusDelivered  DeliveryStatus = "DELIVERED"
	DeliveryStatusFailed     DeliveryStatus = "FAILED"
)

type DOLineItem struct {
	ID                uuid.UUID `json:"id"`
	TenantID          uuid.UUID `json:"tenant_id"`
	DeliveryOrderID   uuid.UUID `json:"delivery_order_id"`
	SOLineItemID      uuid.UUID `json:"so_line_item_id"`
	ProductID         uuid.UUID `json:"product_id"`
	ProductSKU        string    `json:"product_sku,omitempty"`
	ProductName       string    `json:"product_name,omitempty"`
	SourceBinID       uuid.UUID `json:"source_bin_id"`
	BinCode           string    `json:"bin_code,omitempty"`
	QuantityToDeliver float64   `json:"quantity_to_deliver"`
}

type DeliveryOrder struct {
	ID                  uuid.UUID     `json:"id"`
	TenantID            uuid.UUID     `json:"tenant_id"`
	DeliveryNumber      string        `json:"delivery_number"`
	SalesOrderID        uuid.UUID     `json:"sales_order_id"`
	OrderNumber         string        `json:"order_number,omitempty"`
	OriginWarehouseID   uuid.UUID     `json:"origin_warehouse_id"`
	WarehouseName       string        `json:"warehouse_name,omitempty"`
	DeliveryStatus      string        `json:"delivery_status"`
	DriverName          *string       `json:"driver_name"`
	VehicleRegistration *string       `json:"vehicle_registration"`
	DispatchedAt        *time.Time    `json:"dispatched_at"`
	CreatedAt           time.Time     `json:"created_at"`
	Items               []*DOLineItem `json:"items,omitempty"`
}

type ProofOfDelivery struct {
	ID                    uuid.UUID  `json:"id"`
	TenantID              uuid.UUID  `json:"tenant_id"`
	DeliveryOrderID       uuid.UUID  `json:"delivery_order_id"`
	DeliveryNumber        string     `json:"delivery_number,omitempty"`
	RecipientName         string     `json:"recipient_name"`
	RecipientSignatureURL *string    `json:"recipient_signature_url"`
	DeliveryPhotoURL      *string    `json:"delivery_photo_url"`
	DeliveryConfirmedAt   time.Time  `json:"delivery_confirmed_at"`
	ReceivedStatus        string     `json:"received_status"`
	RejectionReason       *string    `json:"rejection_reason"`
	CreatedAt             time.Time  `json:"created_at"`
}
