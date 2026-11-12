export type NavItem = { href: string; label: string; icon: string; title: string; subtitle: string };

export function getNavGroups(locale: "id" | "en") {
  const isEn = locale === "en";
  return [
    { group: isEn ? "Operations" : "Operasional", items: [
      { href: "/demo", label: isEn ? "Dashboard" : "Dasbor", icon: "grid", title: isEn ? "Executive Dashboard" : "Dasbor Eksekutif", subtitle: isEn ? "Real-time overview of operations, finance, and stock health" : "Ikhtisar operasional, keuangan, dan kesehatan stok real-time" },
      { href: "/demo/sales", label: isEn ? "Sales Orders" : "Pesanan Penjualan", icon: "cart", title: isEn ? "Sales Orders (O2C)" : "Pesanan Penjualan (O2C)", subtitle: isEn ? "Sales order pipeline, credit limit caps, and stock reservation locks" : "Manajemen pesanan penjualan, limit kredit, dan reservasi stok" },
      { href: "/demo/delivery", label: isEn ? "Delivery & POD" : "Pengiriman & POD", icon: "truck", title: isEn ? "Delivery Orders & Proof of Delivery" : "Pengiriman & Bukti Terima (POD)", subtitle: isEn ? "Partial truck dispatches and digital Proof of Delivery (POD)" : "Pengiriman bertahap (DO) dan konfirmasi bukti terima digital (POD)" },
      { href: "/demo/inventory", label: isEn ? "Stock & ATP" : "Stok & ATP", icon: "box", title: isEn ? "Stock & Available-to-Promise" : "Stok & Available-to-Promise", subtitle: isEn ? "Multi-bin inventory balances, active reservation locks, and ATP" : "Saldo stok multi-bin, alokasi reservasi, dan Available-to-Promise (ATP)" },
      { href: "/demo/purchasing", label: isEn ? "Purchasing & GRN" : "Pembelian & GRN", icon: "inbox", title: isEn ? "Procurement & Goods Receipt" : "Pembelian & Penerimaan Barang", subtitle: isEn ? "Factory purchase orders and staged goods receipt notes (GRN)" : "Pengadaan barang ke pemasok dan penerimaan fisik (GRN) bertahap" },
    ] },
    { group: isEn ? "Finance" : "Keuangan", items: [
      { href: "/demo/invoices", label: isEn ? "Invoices & Payments" : "Faktur & Pembayaran", icon: "doc", title: isEn ? "Invoices & Payments" : "Faktur & Pembayaran", subtitle: isEn ? "Invoice generation from delivery orders and FIFO settlement" : "Penerbitan faktur dari surat jalan dan alokasi pelunasan FIFO" },
      { href: "/demo/ar", label: isEn ? "Receivables (AR)" : "Piutang (AR Aging)", icon: "cash", title: isEn ? "Accounts Receivable (AR Aging)" : "Piutang (AR Aging)", subtitle: isEn ? "Aging bracket monitoring and prioritized collection workflows" : "Monitoring umur piutang dan prioritas penagihan pelanggan" },
    ] },
    { group: isEn ? "Master Data" : "Master data", items: [
      { href: "/demo/catalog", label: isEn ? "Product Catalog" : "Katalog Produk", icon: "tag", title: isEn ? "Product Catalog & Master SKUs" : "Katalog Produk", subtitle: isEn ? "Master SKU registry, base units (UOM), and stock buffer parameters" : "Master SKU barang, satuan dasar (UOM), dan buffer keselamatan stok" },
      { href: "/demo/partners", label: isEn ? "Customers & Suppliers" : "Pelanggan & Pemasok", icon: "users", title: isEn ? "B2B Customers & Suppliers" : "Pelanggan & Pemasok", subtitle: isEn ? "B2B customer credit profiles and strategic supplier directories" : "Direktori pelanggan B2B dengan plafon kredit dan mitra pemasok" },
      { href: "/demo/warehouses", label: isEn ? "Warehouses & Bins" : "Gudang & Bin", icon: "wh", title: isEn ? "Warehouses & Storage Bins" : "Gudang & Bin", subtitle: isEn ? "Central warehouse bin layout and regional branch storage capacities" : "Tata letak zona bin gudang pusat dan kapasitas cabang regional" },
    ] },
  ];
}

export const NAV_GROUPS = getNavGroups("id");
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
