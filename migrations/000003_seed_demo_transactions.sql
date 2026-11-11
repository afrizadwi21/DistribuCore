-- ==============================================================================
-- DistribuCore — Seed Demo Transactional Records (P2P, O2C, Invoicing)
-- ==============================================================================

-- 1. Demo Purchase Order (Issued to PT Semen Gresik)
INSERT INTO purchase_orders (id, tenant_id, po_number, supplier_id, destination_warehouse_id, status, issued_date, expected_delivery_date, total_amount_cents, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'PO-2026-001',
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000021',
    'ISSUED', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 3500000000,
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (tenant_id, po_number) DO NOTHING;

INSERT INTO po_line_items (id, tenant_id, purchase_order_id, product_id, uom_id, ordered_quantity, received_quantity, unit_cost_cents, subtotal_cents)
VALUES (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000011',
    500.0000, 0.0000, 7000000, 3500000000
) ON CONFLICT (id) DO NOTHING;

-- 2. Demo Confirmed Sales Order (Ordered by Toko Bangunan Sumber Makmur)
INSERT INTO sales_orders (id, tenant_id, order_number, customer_id, order_status, credit_status, total_amount_cents, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'SO-2026-001',
    '00000000-0000-0000-0000-000000000061',
    'CONFIRMED', 'APPROVED', 750000000,
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (tenant_id, order_number) DO NOTHING;

INSERT INTO so_line_items (id, tenant_id, sales_order_id, product_id, uom_id, ordered_quantity, reserved_quantity, unit_price_cents, subtotal_cents)
VALUES (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000011',
    100.0000, 100.0000, 7500000, 750000000
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Customer Invoice
INSERT INTO customer_invoices (id, tenant_id, invoice_number, customer_id, sales_order_id, status, issue_date, due_date, subtotal_cents, tax_cents, total_amount_cents, balance_due_cents)
VALUES (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    'INV-2026-001',
    '00000000-0000-0000-0000-000000000061',
    '00000000-0000-0000-0000-000000000201',
    'ISSUED', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
    750000000, 0, 750000000, 750000000
) ON CONFLICT (tenant_id, invoice_number) DO NOTHING;

INSERT INTO invoice_line_items (id, tenant_id, invoice_id, product_id, quantity, unit_price_cents, subtotal_cents)
VALUES (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000041',
    100.0000, 7500000, 750000000
) ON CONFLICT (id) DO NOTHING;
