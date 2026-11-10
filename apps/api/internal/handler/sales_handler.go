package handler

import (
	"strconv"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SalesHandler struct {
	repo *repository.SalesRepository
}

func NewSalesHandler(repo *repository.SalesRepository) *SalesHandler {
	return &SalesHandler{repo: repo}
}

type CreateSOLineItemReq struct {
	ProductID       uuid.UUID `json:"product_id"`
	UOMID           uuid.UUID `json:"uom_id"`
	OrderedQuantity float64   `json:"ordered_quantity"`
	UnitPriceCents  int64     `json:"unit_price_cents"`
}

type CreateSalesOrderReq struct {
	OrderNumber string                `json:"order_number"`
	CustomerID  uuid.UUID             `json:"customer_id"`
	Items       []CreateSOLineItemReq `json:"items"`
}

// CreateSalesOrder drafts a new sales order and checks customer credit.
func (h *SalesHandler) CreateSalesOrder(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	userIDVal := c.Locals(middleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		userID = uuid.New()
	}

	var req CreateSalesOrderReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "INVALID_BODY", "message": "Failed to parse JSON body"}})
	}

	if req.OrderNumber == "" || req.CustomerID == uuid.Nil || len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "VALIDATION_ERROR", "message": "order_number, customer_id, and items are required"}})
	}

	so := &repository.SalesOrder{
		TenantID: tenantID, OrderNumber: req.OrderNumber, CustomerID: req.CustomerID, CreatedBy: userID,
	}
	for _, it := range req.Items {
		so.Items = append(so.Items, &repository.SOLineItem{
			ProductID: it.ProductID, UOMID: it.UOMID, OrderedQuantity: it.OrderedQuantity, UnitPriceCents: it.UnitPriceCents,
		})
	}

	created, err := h.repo.CreateSalesOrder(c.Context(), so)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "ORDER_FAILED", "message": err.Error()}})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": created})
}

// ListSalesOrders returns paginated sales orders.
func (h *SalesHandler) ListSalesOrders(c *fiber.Ctx) error {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "TENANT_NOT_FOUND", "message": err.Error()}})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	var custIDPtr *uuid.UUID
	if cidStr := c.Query("customer_id"); cidStr != "" {
		if cid, err := uuid.Parse(cidStr); err == nil {
			custIDPtr = &cid
		}
	}

	orders, total, err := h.repo.ListSalesOrders(c.Context(), tenantID, custIDPtr, c.Query("status", ""), page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": fiber.Map{"code": "DATABASE_ERROR", "message": err.Error()}})
	}

	return c.JSON(fiber.Map{"success": true, "data": orders, "meta": fiber.Map{"page": page, "limit": limit, "total_records": total}})
}
