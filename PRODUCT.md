# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Distributor B2B bahan bangunan, pemilik bisnis grosir, sales lapangan, staf gudang, dan tim finance di Indonesia. Mereka membutuhkan sistem transaksi cepat, akurat, dan dapat diandalkan untuk operasional gudang, pesanan sales di toko, penagihan, serta pemantauan limit kredit secara real-time.

## Product Purpose

DistribuCore adalah sistem manajemen distribusi B2B terpadu (Distribution Management System / ERP) yang menyelesaikan masalah krusial operasional distributor: mencegah overselling/jual ganda melalui penguncian stok otomatis saat SO dibuat, mengelola pengiriman parsial dengan bukti serah terima (POD) digital, mengontrol risiko piutang melalui limit kredit otomatis, dan menerbitkan faktur instan tervalidasi surat jalan.

## Positioning

DistribuCore menggantikan proses manual berbasis kertas, spreadsheet terpisah, dan sistem ERP warisan yang kaku dengan platform modern yang cepat, terpadu, dan transparan. Menghubungkan secara langsung sales lapangan, admin kantor, gudang, finance, dan manajemen dalam satu aliran kerja real-time.

## Operating Context

Aplikasi web modern berbasis Next.js 16 (React 19) dan Go REST API backend dengan basis data PostgreSQL. Digunakan pada perangkat desktop (administrasi gudang, akuntansi/finance, dan direksi) serta responsif pada tablet dan smartphone (sales keliling dan kurir armada pengiriman).

## Capabilities and Constraints

- **Modul Utama**: Sales Order (SO) & Quotation, Multi-Warehouse Inventory & Lock Stock, Logistics & Digital Surat Jalan, Partial Delivery & Proof of Delivery (POD) Digital, Automated Invoice & Accounting Reconciliation, Automatic Credit Limit Engine.
- **Batasan**: Harus tetap cepat dan ringan untuk perangkat mobile dengan jaringan lapangan yang bervariasi.
- **Audit Finansial**: Transaksi finansial dan mutasi stok memiliki jejak audit ketat tanpa manipulasi sepihak.

## Brand Commitments

Modern industrial, profesional, efisien, dan berorientasi data. Menghindari AI slop, gradien mencolok tanpa tujuan, serta layout SaaS klise. Mengedepankan hierarki tipografi yang tajam, rasio kontras tinggi, kecepatan pemindaian data transaksi, serta konsistensi mode terang (Light Mode) dan mode gelap (Dark Mode).

## Product Principles

1. **Kejelasan dan Kecepatan Transaksi**: Informasi stok, harga, dan status pengiriman disajikan langsung tanpa distraksi visual.
2. **Integritas Data Operasional**: Status surat jalan dan penerimaan barang adalah sumber kebenaran tunggal untuk penerbitan faktur.
3. **Pencegahan Risiko Otomatis**: Limit kredit dan ketersediaan stok divalidasi oleh sistem sebelum persetujuan pesanan.

## Accessibility & Inclusion

Mendukung standar WCAG 2.1 AA. Memiliki kontras warna tinggi untuk keterbacaan di area gudang maupun luar ruangan, navigasi keyboard yang jelas, dan transisi tema (Light/Dark) yang mulus.
