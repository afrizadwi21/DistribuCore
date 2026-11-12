export type NavItem = { href: string; label: string; icon: string; api: string; title: string };

export const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  { group: "Operasional", items: [
    { href: "/demo", label: "Dasbor", icon: "grid", title: "Dasbor Eksekutif", api: "GET /api/v1/analytics/executive-kpis · /inventory-health · /sales-velocity" },
    { href: "/demo/sales", label: "Pesanan Penjualan", icon: "cart", title: "Pesanan Penjualan (O2C)", api: "GET /api/v1/sales/orders · POST /sales/orders/{id}/confirm" },
    { href: "/demo/delivery", label: "Pengiriman & POD", icon: "truck", title: "Pengiriman & Bukti Terima (POD)", api: "GET /api/v1/fulfillment/delivery-orders · POST …/dispatch · POST …/pod" },
    { href: "/demo/inventory", label: "Stok & ATP", icon: "box", title: "Stok & Available-to-Promise", api: "GET /api/v1/inventory/warehouses/{id}/balances · POST /inventory/adjustments" },
    { href: "/demo/purchasing", label: "Pembelian & GRN", icon: "inbox", title: "Pembelian & Penerimaan Barang", api: "GET /api/v1/purchasing/orders · POST /purchasing/grn" },
  ] },
  { group: "Keuangan", items: [
    { href: "/demo/invoices", label: "Faktur & Pembayaran", icon: "doc", title: "Faktur & Pembayaran", api: "GET /api/v1/billing/invoices · POST /billing/payments" },
    { href: "/demo/ar", label: "Piutang (AR Aging)", icon: "cash", title: "Piutang (AR Aging)", api: "GET /api/v1/billing/ar-aging" },
  ] },
  { group: "Master data", items: [
    { href: "/demo/catalog", label: "Katalog Produk", icon: "tag", title: "Katalog Produk", api: "GET /api/v1/catalog/products · /catalog/uom" },
    { href: "/demo/partners", label: "Pelanggan & Pemasok", icon: "users", title: "Pelanggan & Pemasok", api: "GET /api/v1/partners/customers · /partners/suppliers" },
    { href: "/demo/warehouses", label: "Gudang & Bin", icon: "wh", title: "Gudang & Bin", api: "GET /api/v1/inventory/warehouses · …/{id}/bins" },
  ] },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
