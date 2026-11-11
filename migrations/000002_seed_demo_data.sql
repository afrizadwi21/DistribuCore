-- ==============================================================================
-- DistribuCore — Seed Data for Local Development & Demonstrations
-- ==============================================================================

-- 1. Demo Tenant & Admin User
INSERT INTO tenants (id, code, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'SBA', 'PT Sumber Bangunan Abadi', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (id, tenant_id, email, password_hash, full_name, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@sba.co.id',
    '$2b$12$Tw.7rtBqDTTsosnNmXL8Jeri2fD7EdCW8kksV4EAsWwsLRpss93NW',
    'Budi Santoso (Admin Utama)',
    true
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- 2. Units of Measure (UOM)
INSERT INTO units_of_measure (id, tenant_id, code, name, is_base_unit)
VALUES
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'SAK', 'Sak 50 Kilogram', true),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'DUS', 'Dus Karton', true),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'BTG', 'Batang 12 Meter', true),
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'PAIL', 'Pail 20 Liter', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- 3. Warehouses & Bin Locations
INSERT INTO warehouses (id, tenant_id, code, name, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'WH-CKR', 'Gudang Pusat Cikarang', true)
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO warehouse_bins (id, tenant_id, warehouse_id, code, zone, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'A1-R01-B01', 'Area Semen', true),
    ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'B1-R02-B01', 'Area Besi & Cat', true)
ON CONFLICT (tenant_id, warehouse_id, code) DO NOTHING;

-- 4. Master Products Catalog
INSERT INTO products (id, tenant_id, sku, name, description, base_uom_id, safety_stock_quantity, reorder_point_quantity, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', 'SMN-TR-50KG', 'Semen Tiga Roda 50kg', 'Semen portland tipe 1 serbaguna', '00000000-0000-0000-0000-000000000011', 100, 250, true),
    ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', 'BSI-BT-10MM', 'Besi Beton Polos 10mm SNI', 'Besi tulangan panjang 12 meter', '00000000-0000-0000-0000-000000000013', 200, 500, true),
    ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000001', 'CAT-DLX-20L', 'Cat Tembok Weathershield 20L', 'Cat eksterior premium anti lumut', '00000000-0000-0000-0000-000000000014', 20, 50, true)
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- 5. Business Partners (Supplier & Customer with Credit Limit)
INSERT INTO suppliers (id, tenant_id, code, company_name, contact_person, email, phone, payment_terms_days, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000001', 'SUPP-SG', 'PT Semen Gresik Tbk', 'Agus Hendrawan', 'sales@semengresik.com', '0215551234', 45, true)
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO customers (id, tenant_id, code, company_name, contact_person, email, phone, credit_limit_cents, outstanding_balance_cents, payment_terms_days, is_credit_held, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000001', 'CUST-SBM', 'Toko Bangunan Sumber Makmur', 'Haji Slamet', 'slamet@sumbermakmur.com', '081234567890', 10000000000, 0, 30, false, true)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- 6. Initial Physical Inventory Balances & Audit Ledger
INSERT INTO inventory_balances (tenant_id, warehouse_id, bin_id, product_id, quantity_on_hand)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000041', 500.0000),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000042', 1200.0000),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000043', 85.0000)
ON CONFLICT (tenant_id, warehouse_id, bin_id, product_id) DO NOTHING;
