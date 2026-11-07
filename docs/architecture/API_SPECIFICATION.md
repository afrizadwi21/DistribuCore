# DistribuCore REST API Specification & Service Contracts

**Document Version:** 1.0.0  
**Phase:** 0 — Architectural Specification & Service Boundaries  
**Protocol:** HTTPS / RESTful JSON  
**Base URL:** `/api/v1`

---

## Table of Contents

1. [API Design Principles & Standards](#1-api-design-principles--standards)
2. [Global Headers & Multi-Tenant Authentication](#2-global-headers--multi-tenant-authentication)
3. [Standard Envelope & Error Responses](#3-standard-envelope--error-responses)
4. [Service Boundary 1: Authentication & Identity (`/auth`)](#service-boundary-1-authentication--identity-auth)
5. [Service Boundary 2: Product Catalog & Pricing (`/catalog`)](#service-boundary-2-product-catalog--pricing-catalog)
6. [Service Boundary 3: Multi-Warehouse Inventory (`/inventory`)](#service-boundary-3-multi-warehouse-inventory-inventory)
7. [Service Boundary 4: Procurement & Receiving (`/procurement`)](#service-boundary-4-procurement--receiving-procurement)
8. [Service Boundary 5: Customers, Sales & Stock Reservation (`/sales`)](#service-boundary-5-customers-sales--stock-reservation-sales)
9. [Service Boundary 6: Outbound Delivery & Proof of Delivery (`/fulfillment`)](#service-boundary-6-outbound-delivery--proof-of-delivery-fulfillment)
10. [Service Boundary 7: Invoicing, Payments & AR (`/billing`)](#service-boundary-7-invoicing-payments--ar-billing)
11. [Service Boundary 8: Analytics & Dashboards (`/analytics`)](#service-boundary-8-analytics--dashboards-analytics)

---

## 1. API Design Principles & Standards

DistribuCore's RESTful API conforms to the following engineering conventions:

- **Resource-Oriented URIs:** Nouns in plural form (e.g., `/products`, `/purchase-orders`, `/sales-orders`).
- **Standard HTTP Verbs:**
  - `GET`: Idempotent read operations.
  - `POST`: Create resource or execute domain transitions (e.g., `/sales-orders/{id}/confirm`).
  - `PUT`: Full resource replacement.
  - `PATCH`: Partial resource update.
  - `DELETE`: Logical deactivation / soft delete.
- **Idempotency Keys:** Mutating transactions (payment recordings, order confirmations) accept an optional `Idempotency-Key: <UUID>` header to safeguard against network retries.
- **Cursor & Offset Pagination:** List endpoints accept `page` (default: 1), `limit` (default: 20, max: 100), `sort`, and `order` parameters.

---

## 2. Global Headers & Multi-Tenant Authentication

| Header | Required | Description | Example |
|---|---|---|---|
| `Authorization` | Yes (Protected) | Bearer JWT containing authenticated user claims and tenant ID | `Bearer eyJhbGciOiJIUzI1Ni...` |
| `Content-Type` | Yes (for body) | Media type of the request payload | `application/json` |
| `X-Request-ID` | Recommended | Distributed tracing correlation ID | `req-8c9e4e2e-4b2a-4a64-9a8c` |
| `Idempotency-Key`| Optional | Unique client token to prevent double-execution | `idemp-9f5b6e12-32a1-4cb7` |

> [!NOTE]
> Tenant identification is derived directly from the signed JWT payload (`tenant_id` claim) to guarantee tenant isolation and prevent cross-tenant parameter tampering.

---

## 3. Standard Envelope & Error Responses

### Success Response Envelope

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total_records": 150,
    "total_pages": 8
  }
}
```

### Standard Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Available-to-promise inventory is lower than the requested quantity.",
    "details": [
      {
        "field": "ordered_quantity",
        "issue": "Requested 50.0000 PCS, but only 22.0000 PCS are available to promise."
      }
    ],
    "request_id": "req-8c9e4e2e-4b2a-4a64-9a8c"
  }
}
```

---

## Service Boundary 1: Authentication & Identity (`/auth`)

| Method | Endpoint | Description | Access Level |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate user with email and password | Public |
| `POST` | `/auth/refresh` | Exchange valid refresh token for a new access token | Authenticated |
| `POST` | `/auth/logout` | Invalidate current session and refresh token | Authenticated |
| `GET` | `/auth/me` | Retrieve profile, assigned roles, and permission matrix | Authenticated |

---

## Service Boundary 2: Product Catalog & Pricing (`/catalog`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/catalog/products` | Search and filter master products | `catalog:read` |
| `POST` | `/catalog/products` | Create a new product SKU | `catalog:write` |
| `GET` | `/catalog/products/{id}` | Get product details, UOM conversions, and price tiers | `catalog:read` |
| `PUT` | `/catalog/products/{id}` | Update product specifications and metadata | `catalog:write` |
| `GET` | `/catalog/uom` | List configured Units of Measure | `catalog:read` |
| `POST` | `/catalog/uom` | Define a new Unit of Measure | `catalog:write` |
| `GET` | `/catalog/price-tiers` | List price tiers (Wholesale, Contractor, Retail) | `pricing:read` |
| `POST` | `/catalog/prices/batch` | Update tiered pricing matrices for products | `pricing:write` |

---

## Service Boundary 3: Multi-Warehouse Inventory (`/inventory`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/inventory/warehouses` | List active warehouse facilities | `inventory:read` |
| `POST` | `/inventory/warehouses` | Create a new warehouse facility | `inventory:admin` |
| `GET` | `/inventory/warehouses/{id}/bins` | List storage bins/locations within a warehouse | `inventory:read` |
| `POST` | `/inventory/warehouses/{id}/bins` | Register bin location (Aisle/Rack/Shelf/Bin) | `inventory:admin` |
| `GET` | `/inventory/balances` | Query physical on-hand balances across locations | `inventory:read` |
| `GET` | `/inventory/atp` | Calculate real-time Available-to-Promise stock | `inventory:read` |
| `POST` | `/inventory/transfers` | Initiate stock transfer between warehouses | `inventory:transfer` |
| `POST` | `/inventory/adjustments` | Record cycle count adjustments or scrap | `inventory:adjust` |
| `GET` | `/inventory/transactions` | Query immutable inventory transaction history | `inventory:audit` |

---

## Service Boundary 4: Procurement & Receiving (`/procurement`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/procurement/suppliers` | List approved vendors and suppliers | `procurement:read` |
| `POST` | `/procurement/suppliers` | Register new supplier profile | `procurement:write` |
| `GET` | `/procurement/purchase-orders` | Filter and paginate Purchase Orders | `procurement:read` |
| `POST` | `/procurement/purchase-orders` | Create draft Purchase Order | `procurement:write` |
| `GET` | `/procurement/purchase-orders/{id}` | Get PO details with line items and receiving status | `procurement:read` |
| `POST` | `/procurement/purchase-orders/{id}/submit` | Transition PO from DRAFT to SUBMITTED | `procurement:approve` |
| `POST` | `/procurement/goods-receipts` | Create Goods Receipt Note (GRN) for inbound goods | `warehouse:receive` |
| `GET` | `/procurement/goods-receipts/{id}` | Inspect GRN details and receiving inspection log | `procurement:read` |

---

## Service Boundary 5: Customers, Sales & Stock Reservation (`/sales`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/sales/customers` | List customer accounts with credit standing | `sales:read` |
| `POST` | `/sales/customers` | Register a new customer organization | `sales:write` |
| `GET` | `/sales/quotations` | List sales quotations | `sales:read` |
| `POST` | `/sales/quotations` | Create a new sales quotation with tiered pricing | `sales:write` |
| `POST` | `/sales/quotations/{id}/convert` | Convert accepted quotation into a Sales Order | `sales:write` |
| `GET` | `/sales/orders` | List sales orders with fulfillment status | `sales:read` |
| `POST` | `/sales/orders` | Create sales order directly | `sales:write` |
| `GET` | `/sales/orders/{id}` | View sales order line items and reservations | `sales:read` |
| `POST` | `/sales/orders/{id}/confirm` | Confirm order and trigger stock reservation | `sales:confirm` |
| `POST` | `/sales/orders/{id}/cancel` | Cancel order and release reserved stock | `sales:cancel` |

---

## Service Boundary 6: Outbound Delivery & Proof of Delivery (`/fulfillment`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/fulfillment/staging` | Query orders pending warehouse pick and staging | `fulfillment:read` |
| `POST` | `/fulfillment/delivery-orders` | Create partial or full Delivery Order (DO) | `fulfillment:write` |
| `GET` | `/fulfillment/delivery-orders/{id}` | View packing list and dispatch details | `fulfillment:read` |
| `POST` | `/fulfillment/delivery-orders/{id}/dispatch` | Mark shipment as dispatched in transit | `fulfillment:dispatch` |
| `POST` | `/fulfillment/delivery-orders/{id}/pod` | Submit Proof of Delivery (signature & confirmation) | `fulfillment:pod` |

---

## Service Boundary 7: Invoicing, Payments & AR (`/billing`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/billing/invoices` | List customer invoices with balance due | `billing:read` |
| `POST` | `/billing/invoices/generate-from-delivery` | Create invoice from fulfilled delivery order | `billing:write` |
| `GET` | `/billing/invoices/{id}` | View invoice line items and payment history | `billing:read` |
| `POST` | `/billing/payments` | Record customer payment (wire, check, card) | `billing:payment` |
| `POST` | `/billing/payments/{id}/allocate` | Allocate unallocated payment across open invoices | `billing:payment` |
| `GET` | `/billing/ar-aging` | Generate Accounts Receivable aging report | `billing:reports` |

---

## Service Boundary 8: Analytics & Dashboards (`/analytics`)

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| `GET` | `/analytics/executive-kpis` | Real-time overview of revenue, margins & AR | `analytics:view` |
| `GET` | `/analytics/sales-velocity` | SKU sales trends and volume velocity | `analytics:view` |
| `GET` | `/analytics/inventory-turnover` | Inventory turnover rates and dead stock indicators | `analytics:view` |
