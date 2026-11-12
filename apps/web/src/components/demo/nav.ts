export type NavItem = { href: string; label: string; icon: string; title: string; subtitle: string };

export const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  { group: "Operasional", items: [
    { href: "/demo", label: "Dasbor", icon: "grid", title: "Dasbor Eksekutif", subtitle: "Ikhtisar operasional, keuangan, dan kesehatan stok real-time" },
    { href: "/demo/sales", label: "Pesanan Penjualan", icon: "cart", title: "Pesanan Penjualan (O2C)", subtitle: "Manajemen pesanan penjualan, limit kredit, dan reservasi stok" },
    { href: "/demo/delivery", label: "Pengiriman & POD", icon: "truck", title: "Pengiriman & Bukti Terima (POD)", subtitle: "Pengiriman bertahap (DO) dan konfirmasi bukti terima digital (POD)" },
    { href: "/demo/inventory", label: "Stok & ATP", icon: "box", title: "Stok & Available-to-Promise", subtitle: "Saldo stok multi-bin, alokasi reservasi, dan Available-to-Promise (ATP)" },
    { href: "/demo/purchasing", label: "Pembelian & GRN", icon: "inbox", title: "Pembelian & Penerimaan Barang", subtitle: "Pengadaan barang ke pemasok dan penerimaan fisik (GRN) bertahap" },
  ] },
  { group: "Keuangan", items: [
    { href: "/demo/invoices", label: "Faktur & Pembayaran", icon: "doc", title: "Faktur & Pembayaran", subtitle: "Penerbitan faktur dari surat jalan dan alokasi pelunasan FIFO" },
    { href: "/demo/ar", label: "Piutang (AR Aging)", icon: "cash", title: "Piutang (AR Aging)", subtitle: "Monitoring umur piutang dan prioritas penagihan pelanggan" },
  ] },
  { group: "Master data", items: [
    { href: "/demo/catalog", label: "Katalog Produk", icon: "tag", title: "Katalog Produk", subtitle: "Master SKU barang, satuan dasar (UOM), dan buffer keselamatan stok" },
    { href: "/demo/partners", label: "Pelanggan & Pemasok", icon: "users", title: "Pelanggan & Pemasok", subtitle: "Direktori pelanggan B2B dengan plafon kredit dan mitra pemasok" },
    { href: "/demo/warehouses", label: "Gudang & Bin", icon: "wh", title: "Gudang & Bin", subtitle: "Tata letak zona bin gudang pusat dan kapasitas cabang regional" },
  ] },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
