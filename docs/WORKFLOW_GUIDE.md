# DistribuCore — Panduan Lengkap Alur Kerja & Workflow Sistem

Dokumen ini berisi visualisasi grafis (diagram alur, sequence, dan state machine) serta penjelasan operasional lengkap untuk sistem **DistribuCore (B2B Distribution Management System)**.

---

## Daftar Isi
1. [Peta Jalan Alur Pengerjaan Proyek (Fase 0 s/d 7)](#1-peta-jalan-alur-pengerjaan-proyek)
2. [Alur Pembelian Barang (Procure-to-Pay / P2P)](#2-alur-pembelian-barang-procure-to-pay)
3. [Alur Penjualan & Pengiriman (Order-to-Cash / O2C)](#3-alur-penjualan--pengiriman-order-to-cash)
4. [Arsitektur Teknis & Isolasi Data Multi-Tenant](#4-arsitektur-teknis--isolasi-data-multi-tenant)
5. [Mekanisme Kunci Stok Real-Time (Stock Reservation)](#5-mekanisme-kunci-stok-real-time)

---

## 1. Peta Jalan Alur Pengerjaan Proyek

Diagram ini menunjukkan urutan pengerjaan teknis dari fondasi awal hingga aplikasi siap produksi:

```mermaid
flowchart TD
    subgraph Selesai ["✅ TAHAP SELESAI"]
        F0["Fase 0: Blueprint & Skema DB<br/>(33 Tabel PostgreSQL & Kontrak REST)"]
        F1["Fase 1: Server Go Fiber & Auth<br/>(Docker, PGX Pool, JWT, Multi-Tenant)"]
        F2["Fase 2: Master Data Terpadu<br/>(Satuan UOM, Produk SKU, Mitra, Gudang, Stok)"]
        F0 --> F1 --> F2
    end

    subgraph Berjalan ["🚀 TAHAP OPERASIONAL & TRANSAKSI"]
        F3["Fase 3: Pembelian & Penerimaan (P2P)<br/>(Purchase Order & Goods Receipt Note)"]
        F4["Fase 4: Penjualan & Kunci Stok (O2C)<br/>(Quotation, Sales Order, Redis Reservation)"]
        F5["Fase 5: Logistik & Bukti Terima (POD)<br/>(Delivery Order Parsial & Bukti Kirim)"]
        F6["Fase 6: Faktur & Manajemen Piutang<br/>(Invoicing, Pelunasan, AR Aging Macet)"]
        F2 --> F3 --> F4 --> F5 --> F6
    end

    subgraph Visual ["💻 TAHAP ANTARMUKA WEB"]
        F7["Fase 7: Frontend Web Next.js<br/>(Tailwind, shadcn/ui, Dashboard Eksekutif)"]
        F6 --> F7
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
