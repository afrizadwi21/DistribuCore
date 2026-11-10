package handler

import (
	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CreateGRNItemReq struct {
	POLineItemID     uuid.UUID `json:"po_line_item_id"`
	ProductID        uuid.UUID `json:"product_id"`
	TargetBinID      uuid.UUID `json:"target_bin_id"`
	QuantityReceived float64   `json:"quantity_received"`
}

type CreateGRNReq struct {
	GRNNumber               string             `json:"grn_number"`
	PurchaseOrderID         uuid.UUID          `json:"purchase_order_id"`
	WarehouseID             uuid.UUID          `json:"warehouse_id"`
	SupplierDeliveryNoteRef *string            `json:"supplier_delivery_note_ref"`
	Items                   []CreateGRNItemReq `json:"items"`
}

// CreateGoodsReceipt handles recording inbound delivery and increments physical stock.
func (h *PurchaseHandler) CreateGoodsReceipt(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		userID = uuid.New()
	}

	var req CreateGRNReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_BODY", "message": "Failed to parse JSON body"}})
	}

	if req.GRNNumber == "" || req.PurchaseOrderID == uuid.Nil || len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "grn_number, purchase_order_id, and items are required"}})
	}

	grn := &repository.GoodsReceiptNote{
		TenantID: tenantID, GRNNumber: req.GRNNumber, PurchaseOrderID: req.PurchaseOrderID,
		WarehouseID: req.WarehouseID, ReceivedBy: userID, SupplierDeliveryNoteRef: req.SupplierDeliveryNoteRef,
	}
	for _, it := range req.Items {
		grn.Items = append(grn.Items, &repository.GRNLineItem{
			POLineItemID: it.POLineItemID, ProductID: it.ProductID, TargetBinID: it.TargetBinID, QuantityReceived: it.QuantityReceived,
		})
	}

	created, err := h.repo.CreateGoodsReceiptNote(c.Context(), grn)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "GRN_FAILED", "message": err.Error()}})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": created})
}
