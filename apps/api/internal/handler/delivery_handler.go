package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FulfillmentHandler struct {
	repo *repository.FulfillmentRepository
}

func NewFulfillmentHandler(repo *repository.FulfillmentRepository) *FulfillmentHandler {
	return &FulfillmentHandler{repo: repo}
}

type CreateDOItemReq struct {
	SOLineItemID      uuid.UUID `json:"so_line_item_id"`
	ProductID         uuid.UUID `json:"product_id"`
	SourceBinID       uuid.UUID `json:"source_bin_id"`
	QuantityToDeliver float64   `json:"quantity_to_deliver"`
}

type CreateDeliveryOrderReq struct {
	DeliveryNumber      string            `json:"delivery_number"`
	SalesOrderID        uuid.UUID         `json:"sales_order_id"`
	OriginWarehouseID   uuid.UUID         `json:"origin_warehouse_id"`
	DriverName          *string           `json:"driver_name"`
	VehicleRegistration *string           `json:"vehicle_registration"`
	Items               []CreateDOItemReq `json:"items"`
}

// CreateDeliveryOrder creates a staged shipment order (Surat Jalan).
func (h *FulfillmentHandler) CreateDeliveryOrder(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	var req CreateDeliveryOrderReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_BODY", "message": "Failed to parse JSON body"}})
	}

	if req.DeliveryNumber == "" || req.SalesOrderID == uuid.Nil || req.OriginWarehouseID == uuid.Nil || len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "delivery_number, sales_order_id, origin_warehouse_id, and items are required"}})
	}

	do := &repository.DeliveryOrder{
		TenantID: tenantID, DeliveryNumber: req.DeliveryNumber, SalesOrderID: req.SalesOrderID,
		OriginWarehouseID: req.OriginWarehouseID, DriverName: req.DriverName, VehicleRegistration: req.VehicleRegistration,
	}
	for _, it := range req.Items {
		do.Items = append(do.Items, &repository.DOLineItem{
			SOLineItemID: it.SOLineItemID, ProductID: it.ProductID, SourceBinID: it.SourceBinID, QuantityToDeliver: it.QuantityToDeliver,
		})
	}

	created, err := h.repo.CreateDeliveryOrder(c.Context(), do)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DO_FAILED", "message": err.Error()}})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": created})
}

// ListDeliveryOrders retrieves paginated delivery orders.
func (h *FulfillmentHandler) ListDeliveryOrders(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	var soIDPtr *uuid.UUID
	if soStr := c.Query("sales_order_id"); soStr != "" {
		if soID, err := uuid.Parse(soStr); err == nil {
			soIDPtr = &soID
		}
	}

	orders, total, err := h.repo.ListDeliveryOrders(c.Context(), tenantID, soIDPtr, c.Query("status", ""), page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}
	return c.JSON(fiber.Map{"success": true, "data": orders, "meta": fiber.Map{"page": page, "limit": limit, "total_records": total}})
}
