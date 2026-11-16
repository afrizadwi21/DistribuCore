# DistribuCore — Panduan Lengkap Alur Kerja & Workflow Sistem

Dokumen ini berisi visualisasi grafis (diagram alur, sequence, dan state machine) serta penjelasan operasional lengkap untuk sistem **DistribuCore (B2B Distribution Management System)**.

---

## Daftar Isi
1. [Peta Jalan Alur Pengerjaan Proyek (Fase 0 s/d 8 — Selesai)](#1-peta-jalan-alur-pengerjaan-proyek)
2. [Alur Pembelian Barang (Procure-to-Pay / P2P)](#2-alur-pembelian-barang-procure-to-pay)
3. [Alur Penjualan & Pengiriman (Order-to-Cash / O2C)](#3-alur-penjualan--pengiriman-order-to-cash)
4. [Arsitektur Teknis & Isolasi Data Multi-Tenant](#4-arsitektur-teknis--isolasi-data-multi-tenant)
5. [Mekanisme Kunci Stok Real-Time (Stock Reservation)](#5-mekanisme-kunci-stok-real-time)
6. [Alur Manajemen Tim Tenant & Hak Akses Posisi (RBAC)](#6-alur-manajemen-tim-tenant--hak-akses-posisi-rbac)

---

## 1. Peta Jalan Alur Pengerjaan Proyek

Diagram ini menunjukkan urutan pengerjaan teknis dari fondasi awal hingga aplikasi produksi penuh (Fase 0 s/d Fase 8 telah selesai diimplementasikan):

```mermaid
flowchart TD
    subgraph Fondasi ["TAHAP FONDASI & MASTER DATA (SELESAI)"]
        F0["Fase 0: Blueprint & Skema DB<br/>(33+ Tabel PostgreSQL & Kontrak REST)"]
        F1["Fase 1: Server Go Fiber & Auth<br/>(Docker, PGX Pool, JWT, Multi-Tenant)"]
        F2["Fase 2: Master Data Terpadu<br/>(Satuan UOM, Produk SKU, Mitra, Gudang, Stok)"]
        F0 --> F1 --> F2
    end

    subgraph Operasional ["TAHAP OPERATIONAL & TRANSAKSI (SELESAI)"]
        F3["Fase 3: Pembelian & Penerimaan (P2P)<br/>(Purchase Order & Goods Receipt Note)"]
        F4["Fase 4: Penjualan & Kunci Stok (O2C)<br/>(Quotation, Sales Order, ATP Reservation)"]
        F5["Fase 5: Logistik & Bukti Terima (POD)<br/>(Delivery Order Otomatis & Bukti Kirim)"]
        F6["Fase 6: Faktur & Manajemen Piutang<br/>(Invoicing FIFO, Pelunasan, AR Aging)"]
        F2 --> F3 --> F4 --> F5 --> F6
    end

    subgraph Platform ["TAHAP WEB PLATFORM & RBAC (SELESAI)"]
        F7["Fase 7: Analytics & KPI Eksekutif<br/>(Metrik Pendapatan, Stok, & Eksposur AR)"]
        F8["Fase 8: Next.js 16 Dual-Mode Web & Tim RBAC<br/>(Sesi Server Nyata, Manajemen Role, Sinkronisasi DB)"]
        F6 --> F7 --> F8
    end
```

---

## 2. Alur Pembelian Barang (Procure-to-Pay)

Alur ketika distributor memesan stok barang ke pabrik sampai barang masuk ke rak gudang:

```mermaid
sequenceDiagram
    autonumber
    actor Purchasing as Tim Pengadaan (Purchasing)
    actor Supplier as Pabrik / Supplier
    actor Gudang as Staf Gudang
    participant API as Backend (Go Fiber)
    participant DB as PostgreSQL Database

    Purchasing->>API: 1. Buat Purchase Order (PO)
    API->>DB: Simpan PO status DRAFT/SUBMITTED
    Purchasing->>Supplier: 2. Kirim PO ke Pabrik
    Supplier-->>Gudang: 3. Truk Pabrik Tiba di Gudang
    Gudang->>API: 4. Buat Goods Receipt Note (GRN) & Hitung Fisik
    alt Barang Diterima Sebagian (Parsial)
        API->>DB: Catat Partial GRN, PO tetap terbuka
    else Barang Diterima Lengkap
        API->>DB: Catat Full GRN, PO selesai (CLOSED)
    end
    API->>DB: 5. Otomatis Tambah Saldo Stok di Rak (inventory_balances)
    API->>DB: 6. Catat Mutasi Masuk di Buku Besar (inventory_transactions)
    API-->>Gudang: Konfirmasi Stok Berhasil Ditambahkan
```

---

## 3. Alur Penjualan & Pengiriman (Order-to-Cash)

Alur ketika sales menerima pesanan dari toko bangunan hingga uang pembayaran diterima:

```mermaid
flowchart TD
    A["Toko / Kontraktor Minta Penawaran"] --> B["Sales Buat Sales Quotation"]
    B --> C{"Disetujui Toko?"}
    C -- Tidak --> Z["Quotation Batal / Arsip"]
    C -- Ya --> D["Konversi ke Sales Order (SO)"]
    
    D --> E{"Cek Batas Limit Kredit Toko"}
    E -- Melebihi Plafon --> F["Kredit Ditahan (Credit Hold)<br/>Butuh Izin Pimpinan"]
    F -- Ditolak --> Z
    F -- Disetujui Override --> G["Konfirmasi Order"]
    E -- Masih Ada Limit --> G
    
    G --> H["KUNCI STOK OTOMATIS<br/>(Stock Reservation via Redis)"]
    H --> I["Cetak Daftar Muat Gudang (Picking List)"]
    I --> J["Terbitkan Surat Jalan / Delivery Order (DO)"]
    J --> K["Truk Mengirim Barang ke Lokasi Toko"]
    K --> L["Penerima Tanda Tangan Bukti Terima (POD)"]
    
    L --> M["POTONG STOK FISIK RESMI<br/>& Lepas Kunci Reservasi"]
    M --> N["Terbitkan Faktur Tagihan (Customer Invoice)"]
    N --> O["Toko Membayar (Transfer / Giro)"]
    O --> P["Alokasikan Pembayaran ke Invoice"]
    P --> Q["Siklus Penjualan Selesai"]
```

---

## 4. Arsitektur Teknis & Isolasi Data Multi-Tenant

Bagaimana sistem memastikan data Perusahaan A tidak akan pernah bocor ke Perusahaan B:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Sales / Admin)
    participant Client as Browser (Next.js / Scalar)
    participant MW as Middleware (Go Fiber)
    participant DB as PostgreSQL 16 (Port 5433)

    User->>Client: 1. Request Data (misal: Daftar Produk)
    Client->>MW: 2. Kirim HTTP Request + Bearer JWT Token
    MW->>MW: 3. Verifikasi Keaslian JWT (HMAC-SHA256)
    MW->>MW: 4. Ekstrak 'tenant_id' dari isi token
    MW->>MW: 5. Sematkan tenant_id ke Context Request
    MW->>DB: 6. Kueri SQL Terkunci: SELECT * FROM products WHERE tenant_id = $1
    DB-->>MW: 7. Hanya mengembalikan baris milik tenant tersebut
    MW-->>Client: 8. Respon JSON Data Aman
```

---

## 5. Mekanisme Kunci Stok Real-Time (Stock Reservation)

Mencegah **penjualan ganda (double-selling)** saat banyak sales membuat order secara serentak:

```mermaid
stateDiagram-v2
    [*] --> StokTersedia: Barang ada di rak fisik
    StokTersedia --> StokDikunci: Sales konfirmasi order (Kunci Redis aktif)
    
    state StokDikunci {
        [*] --> MenungguSuratJalan: Reservasi berbatas waktu (TTL)
        MenungguSuratJalan --> OrderBatal: Toko batalkan / kredit ditolak
        MenungguSuratJalan --> BarangDikirim: Truk muat barang
    }
    
    OrderBatal --> StokTersedia: Kunci dilepas, stok kembali bebas dijual
    BarangDikirim --> StokTerpotong: Bukti Terima (POD) ditandatangani
    StokTerpotong --> [*]: Barang keluar resmi dari gudang
```

---

### Rumus Perhitungan Ketersediaan Stok (Available-to-Promise):

$$\text{Stok Tersedia (ATP)} = \text{Stok Fisik di Rak} - \text{Stok Sedang Dikunci (Reserved)} - \text{Batas Stok Aman (Safety Stock)}$$

Dengan rumus ini, sales tidak akan pernah bisa menjanjikan barang yang fisiknya ada di gudang tetapi sebenarnya sudah dibayar/dipesan oleh pelanggan lain.

---

## 6. Alur Manajemen Tim Tenant & Hak Akses Posisi (RBAC)

Pada menu **Profil & Tim RBAC (`/demo/profile`)**, Administrator perusahaan (`ADMIN` / `OWNER`) dapat melihat seluruh pengguna yang terdaftar di tenant tersebut, menambahkan staf baru, serta mengubah posisi/role secara dinamis:

| Role / Posisi | Hak Akses Operasional Utama |
|---|---|
| `ADMIN` | Akses penuh ke seluruh modul operasional, keuangan, master data, dan manajemen anggota tim tenant (`GET/POST/PATCH/DELETE /api/v1/tenant/users`). |
| `SALES_MANAGER` | Membuat Pesanan Penjualan (SO), mengelola Katalog Produk (Master SKU), serta menambah/menghapus Pelanggan B2B. |
| `WAREHOUSE_MANAGER` | Mendaftarkan Gudang, membuat Purchase Order (PO), mengonfirmasi penerimaan barang (GRN), melakukan Cycle Count stok fisik, serta mengelola pengiriman (DO/POD). |
| `FINANCE_OFFICER` | Mengelola limit kredit pelanggan, menerbitkan faktur penagihan, mencatat pembayaran masuk (FIFO), dan memantau umur piutang (AR Aging). |
| `STAFF` | Akses baca (read-only) untuk memantau status operasional dan stok lintas modul tanpa hak modifikasi data. |

---

## 7. Alur Komunikasi B2B Otomatis via WhatsApp

Seluruh kontak nomor WhatsApp (`phone`) dan email (`email`) disimpan pada tabel PostgreSQL (`customers` dan `suppliers`) saat pendaftaran mitra bisnis, bukan dipaksakan saat login awal. Sistem memformat nomor Indonesia secara otomatis (`08xx` ke `628xx`) pada 4 titik komunikasi utama:

1. **Penagihan Piutang Jatuh Tempo (`Piutang AR Aging` `/demo/ar`)**: Tombol **Kirim Pengingat WA** membuka pesan resmi berisi total tunggakan (`Rp`) langsung ke nomor WhatsApp pelanggan.
2. **Pengiriman PO ke Pemasok (`Pembelian & GRN` `/demo/purchasing`)**: Tombol **Kirim PO via WA** mengirimkan rincian nomor PO, barang SKU, kuantitas, dan nilai order ke pemasok.
3. **Konfirmasi Sales Order & Review Kredit (`Pesanan Penjualan` `/demo/sales`)**: Tombol **Review kredit (WA)** dan **WA** mengirimkan status persetujuan limit kredit serta progres pengiriman ke pelanggan.
4. **Direktori Mitra B2B (`Pelanggan & Pemasok` `/demo/partners`)**: Tombol **Chat WA** pada setiap baris pelanggan dan pemasok untuk komunikasi cepat.
