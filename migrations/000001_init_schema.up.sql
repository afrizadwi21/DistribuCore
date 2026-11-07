-- ==============================================================================
-- DistribuCore Initial Migration: Multi-Tenant Architecture & Core Entities
-- Target Engine: PostgreSQL 15+
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TENANT & IDENTITY ACCESS MANAGEMENT (IAM)
-- ==============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tax_identifier VARCHAR(64),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    module VARCHAR(32) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ==============================================================================
-- 2. PRODUCT CATALOG & PRICING
-- ==============================================================================

CREATE TABLE units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(16) NOT NULL,
    name VARCHAR(64) NOT NULL,
    is_base_unit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(64) NOT NULL,
    barcode VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    safety_stock_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    reorder_point_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE product_uom_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    from_uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    to_uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    conversion_factor NUMERIC(12, 6) NOT NULL,
    UNIQUE(tenant_id, product_id, from_uom_id, to_uom_id)
);

CREATE TABLE price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    name VARCHAR(64) NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(tenant_id, name)
);

CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_tier_id UUID NOT NULL REFERENCES price_tiers(id) ON DELETE CASCADE,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    min_order_quantity NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
    unit_price_cents BIGINT NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    UNIQUE(tenant_id, product_id, price_tier_id, uom_id, min_order_quantity)
);

-- ==============================================================================
-- 3. MULTI-WAREHOUSE INVENTORY & LOCATIONS
-- ==============================================================================

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    address_line TEXT,
    city VARCHAR(64),
    state_province VARCHAR(64),
    postal_code VARCHAR(16),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE warehouse_bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    zone VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(tenant_id, warehouse_id, code)
);

CREATE TABLE inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    bin_id UUID NOT NULL REFERENCES warehouse_bins(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_on_hand NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (quantity_on_hand >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, warehouse_id, bin_id, product_id)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    bin_id UUID NOT NULL REFERENCES warehouse_bins(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(32) NOT NULL,
    quantity_delta NUMERIC(12, 4) NOT NULL,
    reference_type VARCHAR(32) NOT NULL,
    reference_id UUID NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PROCUREMENT (P2P)
-- ==============================================================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(32) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128),
    email VARCHAR(255),
    phone VARCHAR(32),
    payment_terms_days INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    po_number VARCHAR(64) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount_cents BIGINT NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, po_number)
);

CREATE TABLE po_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    ordered_quantity NUMERIC(12, 4) NOT NULL CHECK (ordered_quantity > 0),
    received_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    unit_cost_cents BIGINT NOT NULL,
    subtotal_cents BIGINT NOT NULL
);

CREATE TABLE goods_receipt_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    grn_number VARCHAR(64) NOT NULL,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    received_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supplier_delivery_note_ref VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    UNIQUE(tenant_id, grn_number)
);

CREATE TABLE grn_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    grn_id UUID NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    po_line_item_id UUID NOT NULL REFERENCES po_line_items(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    target_bin_id UUID NOT NULL REFERENCES warehouse_bins(id) ON DELETE RESTRICT,
    quantity_received NUMERIC(12, 4) NOT NULL CHECK (quantity_received > 0)
);

-- ==============================================================================
-- 5. SALES & STOCK RESERVATION
-- ==============================================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(32) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128),
    email VARCHAR(255),
    phone VARCHAR(32),
    price_tier_id UUID REFERENCES price_tiers(id) ON DELETE RESTRICT,
    credit_limit_cents BIGINT NOT NULL DEFAULT 0,
    outstanding_balance_cents BIGINT NOT NULL DEFAULT 0,
    payment_terms_days INT NOT NULL DEFAULT 30,
    is_credit_held BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE sales_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    quote_number VARCHAR(64) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    valid_until DATE NOT NULL,
    subtotal_cents BIGINT NOT NULL DEFAULT 0,
    tax_cents BIGINT NOT NULL DEFAULT 0,
    total_amount_cents BIGINT NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, quote_number)
);

CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    order_number VARCHAR(64) NOT NULL,
    quotation_id UUID REFERENCES sales_quotations(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    credit_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    total_amount_cents BIGINT NOT NULL DEFAULT 0,
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

CREATE TABLE so_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    ordered_quantity NUMERIC(12, 4) NOT NULL CHECK (ordered_quantity > 0),
    reserved_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    delivered_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    unit_price_cents BIGINT NOT NULL,
    subtotal_cents BIGINT NOT NULL
);

CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    so_line_item_id UUID NOT NULL REFERENCES so_line_items(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    reserved_quantity NUMERIC(12, 4) NOT NULL CHECK (reserved_quantity > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. FULFILLMENT & PROOF OF DELIVERY (POD)
-- ==============================================================================

CREATE TABLE delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    delivery_number VARCHAR(64) NOT NULL,
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE RESTRICT,
    origin_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    delivery_status VARCHAR(32) NOT NULL DEFAULT 'STAGED',
    driver_name VARCHAR(128),
    vehicle_registration VARCHAR(32),
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, delivery_number)
);

CREATE TABLE do_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
    so_line_item_id UUID NOT NULL REFERENCES so_line_items(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    source_bin_id UUID NOT NULL REFERENCES warehouse_bins(id) ON DELETE RESTRICT,
    quantity_to_deliver NUMERIC(12, 4) NOT NULL CHECK (quantity_to_deliver > 0)
);

CREATE TABLE proof_of_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    delivery_order_id UUID NOT NULL UNIQUE REFERENCES delivery_orders(id) ON DELETE RESTRICT,
    recipient_name VARCHAR(128) NOT NULL,
    recipient_signature_url TEXT,
    delivery_photo_url TEXT,
    delivery_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_status VARCHAR(32) NOT NULL DEFAULT 'ACCEPTED_FULL',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. BILLING, PAYMENTS & ACCOUNTS RECEIVABLE (O2C)
-- ==============================================================================

CREATE TABLE customer_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(64) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    delivery_order_id UUID REFERENCES delivery_orders(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal_cents BIGINT NOT NULL,
    tax_cents BIGINT NOT NULL DEFAULT 0,
    total_amount_cents BIGINT NOT NULL,
    balance_due_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    invoice_id UUID NOT NULL REFERENCES customer_invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL,
    unit_price_cents BIGINT NOT NULL,
    subtotal_cents BIGINT NOT NULL
);

CREATE TABLE customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    payment_number VARCHAR(64) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    payment_method VARCHAR(32) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    unallocated_cents BIGINT NOT NULL,
    reference_number VARCHAR(64),
    received_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, payment_number)
);

CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL REFERENCES customer_payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES customer_invoices(id) ON DELETE RESTRICT,
    allocated_amount_cents BIGINT NOT NULL CHECK (allocated_amount_cents > 0),
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    allocated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE & LOOKUPS
-- ==============================================================================

CREATE INDEX idx_inv_bal_product_wh ON inventory_balances (tenant_id, product_id, warehouse_id);
CREATE INDEX idx_inv_res_active ON inventory_reservations (tenant_id, product_id, warehouse_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_invoices_ar_aging ON customer_invoices (tenant_id, customer_id, due_date) WHERE balance_due_cents > 0;
CREATE INDEX idx_so_status ON sales_orders (tenant_id, order_status);
CREATE INDEX idx_do_status ON delivery_orders (tenant_id, delivery_status);
