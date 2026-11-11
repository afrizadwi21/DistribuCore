export const MODULES = [
  { id: "tenant", title: "Tenant & Identitas", desc: "Multi-perusahaan dengan RBAC: Admin, Staf Gudang, Sales, Manajer Keuangan, dan Auditor." },
  { id: "master", title: "Master Data", desc: "Katalog SKU, satuan (UOM), harga bertingkat, pemasok, dan profil kredit pelanggan." },
  { id: "warehouse", title: "Gudang & Inventori", desc: "Multi-gudang dengan bin per zona, penyesuaian stok, transfer, dan mesin reservasi." },
  { id: "purchasing", title: "Pembelian & Penerimaan", desc: "PO, GRN penerimaan sebagian, dan stok bertambah otomatis saat barang diterima." },
  { id: "sales", title: "Penjualan & Pengiriman", desc: "Sales order, pengiriman parsial banyak truk, dan POD tertanda tangan digital." },
  { id: "billing", title: "Faktur & Piutang", desc: "Faktur dari surat jalan, alokasi pembayaran multi-faktur, dan laporan AR aging." },
  { id: "analytics", title: "Analitik Eksekutif", desc: "KPI eksekutif, sales velocity, dan deteksi kesehatan stok real-time." },
];

export const MODULES_EN = [
  { id: "tenant", title: "Tenant & Identity", desc: "Multi-entity with RBAC: Admin, Warehouse Staff, Sales, Finance Manager, and Auditor." },
  { id: "master", title: "Master Data", desc: "SKU catalog, units of measure (UOM), tiered pricing, suppliers, and customer credit profiles." },
  { id: "warehouse", title: "Warehouse & Inventory", desc: "Multi-warehouse with zoned bins, stock adjustments, internal transfers, and reservation engine." },
  { id: "purchasing", title: "Purchasing & Receiving", desc: "PO, partial GRN receiving, and automated inventory increases upon physical goods receipt." },
  { id: "sales", title: "Sales & Delivery", desc: "Sales orders, split multi-truck deliveries, and digitally signed proof-of-delivery (POD)." },
  { id: "billing", title: "Billing & Receivables", desc: "Invoices generated from delivery notes, multi-invoice payment allocation, and AR aging." },
  { id: "analytics", title: "Executive Analytics", desc: "Executive KPIs, sales velocity tracking, and real-time inventory health diagnostics." },
];

export const PERSONAS = [
  { role: "Pemilik & Eksekutif", desc: "Dasbor omzet, aging piutang, dan perputaran stok lintas cabang dalam satu layar." },
  { role: "Manajer Gudang & Logistik", desc: "Lokasi bin, transfer antar gudang, daftar picking, dan verifikasi penerimaan barang." },
  { role: "Staf Pembelian", desc: "Katalog harga pemasok, titik pesan ulang (ROP), dan monitoring lead time pengiriman." },
  { role: "Sales Representative", desc: "Status reservasi stok real-time, harga bertingkat, dan indikator batas limit kredit." },
  { role: "Koordinator Pengiriman", desc: "Pengiriman bertahap (split DO), surat jalan resmi, dan bukti terima digital (POD)." },
  { role: "Keuangan & Piutang", desc: "Faktur otomatis dari pengiriman, alokasi penerimaan pembayaran, dan schedule penuaan piutang." },
];

export const PERSONAS_EN = [
  { role: "Owners & Executives", desc: "Revenue dashboard, AR aging metrics, and cross-branch inventory turnover in a single view." },
  { role: "Warehouse & Logistics", desc: "Bin mapping, inter-warehouse transfers, picking routes, and goods receipt verification." },
  { role: "Purchasing Staff", desc: "Supplier price matrices, reorder points (ROP), and automated vendor lead time tracking." },
  { role: "Sales Representatives", desc: "Real-time stock reservation status, tiered pricing tiers, and automated credit limit flags." },
  { role: "Dispatch Coordinators", desc: "Split delivery orders (DO), official travel documents, and digital signed POD receipts." },
  { role: "Finance & Receivables", desc: "Automated delivery-backed invoicing, multi-invoice payment allocation, and AR aging schedules." },
];

export const FAQS = [
  { q: "Apa itu DistribuCore?", a: "Sistem manajemen distribusi B2B berbasis web untuk distributor, grosir, dan pemasok bahan bangunan. Pembelian, stok, penjualan, pengiriman, faktur, dan piutang terintegrasi dalam satu sumber kebenaran." },
  { q: "Bagaimana cara mencegah stok terjual ganda?", a: "Saat pesanan disetujui, stok langsung dikunci melalui mesin reservasi. Stok Available-to-Promise (ATP) adalah stok fisik dikurangi reservasi aktif. Order yang melebihi ATP ditolak otomatis." },
  { q: "Bisakah satu pesanan dikirim bertahap dengan banyak truk?", a: "Bisa. Satu Sales Order dapat dipecah ke beberapa Delivery Order (DO) surat jalan, masing-masing dengan Proof of Delivery (POD) dan faktur parsial." },
  { q: "Bagaimana kontrol limit kredit pelanggan?", a: "Pelanggan yang melebihi plafon limit kredit otomatis berstatus CREDIT HOLD dan memerlukan override dari pimpinan sebelum stok dapat diproses." },
  { q: "Apakah data perusahaan saya terisolasi dengan aman?", a: "Ya. Setiap tenant memiliki tenant_id terenkripsi yang disematkan pada setiap kueri database sehingga tidak ada risiko kebocoran antar-organisasi." },
];

export const FAQS_EN = [
  { q: "What is DistribuCore?", a: "A cloud-based B2B distribution management system for building material distributors, wholesalers, and suppliers. Purchasing, inventory, sales, dispatch, invoicing, and receivables operate on a unified source of truth." },
  { q: "How is overselling / double-selling prevented?", a: "When orders are approved, stock is immediately locked by the reservation engine. Available-to-Promise (ATP) equals on-hand inventory minus active reservations. Orders exceeding ATP are automatically rejected." },
  { q: "Can a single order be fulfilled across multiple trucks?", a: "Yes. A single Sales Order can be split into multiple Delivery Orders (DO), each with its own digital Proof of Delivery (POD) and partial invoice." },
  { q: "How are customer credit limits controlled?", a: "Customers exceeding their credit ceiling are automatically placed on CREDIT HOLD and require executive authorization before stock allocation proceeds." },
  { q: "Is tenant data securely isolated?", a: "Yes. Every tenant operates with encrypted tenant_id scoping embedded into every database query, ensuring zero risk of cross-organizational data leakage." },
];
