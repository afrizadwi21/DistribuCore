package handler

import (
	"time"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PurchaseHandler struct {
	repo *repository.PurchaseRepository
}

func NewPurchaseHandler(repo *repository.PurchaseRepository) *PurchaseHandler {
	return &PurchaseHandler{repo: repo}
}

type CreatePOLineItemReq struct {
	ProductID       uuid.UUID `json:"product_id"`
	UOMID           uuid.UUID `json:"uom_id"`
	OrderedQuantity float64   `json:"ordered_quantity"`
	UnitCostCents   int64     `json:"unit_cost_cents"`
}

type CreatePurchaseOrderReq struct {
	PONumber               string                `json:"po_number"`
	SupplierID             uuid.UUID             `json:"supplier_id"`
	DestinationWarehouseID uuid.UUID             `json:"destination_warehouse_id"`
	IssuedDate             string                `json:"issued_date"`
	ExpectedDeliveryDate   *string               `json:"expected_delivery_date"`
	Items                  []CreatePOLineItemReq `json:"items"`
}

// CreatePurchaseOrder handles drafting a new Purchase Order with items.
func (h *PurchaseHandler) CreatePurchaseOrder(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		userID = uuid.New()
	}

	var req CreatePurchaseOrderReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_BODY", "message": "Failed to parse JSON body"}})
	}

	if req.PONumber == "" || req.SupplierID == uuid.Nil || req.DestinationWarehouseID == uuid.Nil || len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "po_number, supplier_id, warehouse_id, and items are required"}})
	}

	issued := time.Now()
	if req.IssuedDate != "" {
		if parsed, err := time.Parse("2006-01-02", req.IssuedDate); err == nil {
			issued = parsed
		}
	}

	po := &repository.PurchaseOrder{
		TenantID: tenantID, PONumber: req.PONumber, SupplierID: req.SupplierID,
		DestinationWarehouseID: req.DestinationWarehouseID, IssuedDate: issued, CreatedBy: userID,
	}
	for _, it := range req.Items {
		po.Items = append(po.Items, &repository.POLineItem{
			ProductID: it.ProductID, UOMID: it.UOMID, OrderedQuantity: it.OrderedQuantity, UnitCostCents: it.UnitCostCents,
		})
	}

	created, err := h.repo.CreatePurchaseOrder(c.Context(), po)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": created})
}
