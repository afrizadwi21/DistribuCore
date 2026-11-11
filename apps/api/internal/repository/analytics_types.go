package repository

import (
	"github.com/google/uuid"
)

type ExecutiveKPIs struct {
	TotalRevenueCents       int64   `json:"total_revenue_cents"`
	TotalOutstandingARCents int64   `json:"total_outstanding_ar_cents"`
	ActiveOrdersCount       int     `json:"active_orders_count"`
	TotalProductsCatalogued int     `json:"total_products_catalogued"`
	TotalStockOnHandUnits   float64 `json:"total_stock_on_hand_units"`
	TotalUnallocatedCents   int64   `json:"total_unallocated_cash_cents"`
}

type SKUSalesVelocity struct {
	ProductID     uuid.UUID `json:"product_id"`
	SKU           string    `json:"sku"`
	ProductName   string    `json:"product_name"`
	TotalQuantity float64   `json:"total_quantity_sold"`
	TotalRevenue  int64     `json:"total_revenue_cents"`
	OrdersCount   int       `json:"orders_count"`
}

type InventoryHealthMetric struct {
	ProductID     uuid.UUID `json:"product_id"`
	SKU           string    `json:"sku"`
	ProductName   string    `json:"product_name"`
	QuantityOnHand float64  `json:"quantity_on_hand"`
	SafetyStock   float64   `json:"safety_stock"`
	ReorderPoint  float64   `json:"reorder_point"`
	HealthStatus  string    `json:"health_status"` // CRITICAL_LOW, WARNING_REORDER, HEALTHY
}
