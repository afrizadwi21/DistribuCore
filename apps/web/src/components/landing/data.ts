export const MODULES = [
  { id: "tenant", title: "Tenant & Identitas", desc: "Multi-perusahaan dengan RBAC: Admin, Staf Gudang, Sales, Manajer Keuangan, dan Auditor." },
  { id: "master", title: "Master Data", desc: "Katalog SKU, satuan (UOM), harga bertingkat, pemasok, dan profil kredit pelanggan." },
  { id: "warehouse", title: "Gudang & Inventori", desc: "Multi-gudang dengan bin per zona, penyesuaian stok, transfer, dan mesin reservasi." },
  { id: "purchasing", title: "Pembelian & Penerimaan", desc: "PO, GRN penerimaan sebagian, dan stok bertambah otomatis saat barang diterima." },
  { id: "sales", title: "Penjualan & Pengiriman", desc: "Sales order, pengiriman parsial banyak truk, dan POD tertanda tangan digital." },
  { id: "billing", title: "Faktur & Piutang", desc: "Faktur dari surat jalan, alokasi pembayaran multi-faktur, dan laporan AR aging." },
  { id: "analytics", title: "Analitik Eksekutif", desc: "KPI eksekutif, sales velocity, dan deteksi kesehatan stok real-time." },
];

export const PERSONAS = [
  { role: "Pemilik & Eksekutif", desc: "Dasbor omzet, aging piutang, dan perputaran stok lintas cabang dalam satu layar." },
  { role: "Manajer Gudang & Logistik", desc: "Lokasi bin, transfer antar gudang, daftar picking, dan verifikasi penerimaan barang." },
  { role: "Staf Pembelian", desc: "Katalog harga pemasok, titik pesan ulang (ROP), dan monitoring lead time pengiriman." },
  { role: "Sales Representative", desc: "Status reservasi stok real-time, harga bertingkat, dan indikator batas limit kredit." },
  { role: "Koordinator Pengiriman", desc: "Pengiriman bertahap (split DO), surat jalan resmi, dan bukti terima digital (POD)." },
  { role: "Keuangan & Piutang", desc: "Faktur otomatis dari pengiriman, alokasi penerimaan pembayaran, dan schedule penuaan piutang." },
];

export const FAQS = [
  { q: "Apa itu DistribuCore?", a: "Sistem manajemen distribusi B2B berbasis web untuk distributor, grosir, dan pemasok bahan bangunan. Pembelian, stok, penjualan, pengiriman, faktur, dan piutang terintegrasi dalam satu sumber kebenaran." },
  { q: "Bagaimana cara mencegah stok terjual ganda?", a: "Saat pesanan disetujui, stok langsung dikunci melalui mesin reservasi. Stok Available-to-Promise (ATP) adalah stok fisik dikurangi reservasi aktif. Order yang melebihi ATP ditolak otomatis." },
  { q: "Bisakah satu pesanan dikirim bertahap dengan banyak truk?", a: "Bisa. Satu Sales Order dapat dipecah ke beberapa Delivery Order (DO) surat jalan, masing-masing dengan Proof of Delivery (POD) dan faktur parsial." },
  { q: "Bagaimana kontrol limit kredit pelanggan?", a: "Pelanggan yang melebihi plafon limit kredit otomatis berstatus CREDIT HOLD dan memerlukan override dari pimpinan sebelum stok dapat diproses." },
  { q: "Apakah data perusahaan saya terisolasi dengan aman?", a: "Ya. Setiap tenant memiliki tenant_id terenkripsi yang disematkan pada setiap kueri database sehingga tidak ada risiko kebocoran antar-organisasi." },
];
