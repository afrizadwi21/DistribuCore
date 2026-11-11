---
name: DistribuCore
description: Industrial Precision Design System for B2B Distribution Management
colors:
  bg-light: "#f8fafc"
  bg-dark: "#090d16"
  card-light: "#ffffff"
  card-dark: "#0f172a"
  border-light: "#e2e8f0"
  border-dark: "#1e293b"
  text-light: "#0f172a"
  text-dark: "#f8fafc"
  muted-light: "#64748b"
  primary: "#0f172a"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "var(--font-heading), Bricolage Grotesque, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
  headline:
    fontFamily: "var(--font-heading), Bricolage Grotesque, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
  body:
    fontFamily: "var(--font-sans), Instrument Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg-light}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System

<!-- impeccable:design-schema 1 -->

## Overview
DistribuCore mengadopsi pendekatan Industrial Precision: efisiensi data tinggi, kontras tegas, dan ketenangan visual operasional tanpa ornamen AI slop.

## Colors
Palet dibangun di atas token dua-tema (`:root` dan `.dark` / `[data-theme="dark"]`):
- **Base Ground (`--bg`)**: `#f8fafc` (Light) / `#090d16` (Dark) untuk kanvas dasar.
- **Card Surface (`--card`)**: `#ffffff` (Light) / `#0f172a` (Dark) untuk kontainer modul.
- **Border Rule (`--bd`)**: `#e2e8f0` (Light) / `#1e293b` (Dark) hairline 1px solid.
- **Text Primary (`--tx`)**: `#0f172a` (Light) / `#f8fafc` (Dark) kontras rasio > 7:1.
- **Text Muted (`--mu`)**: `#64748b` (Light) / `#94a3b8` (Dark) untuk teks sekunder.
- **Status Semantik**: Sukses (`--gr`: `#10b981`), Warning (`--am`: `#f59e0b`), Bahaya (`--rd`: `#ef4444`).

## Typography
Tipografi menggunakan Bricolage Grotesque (Headings) dan Instrument Sans (Body & Data): Display 2.75rem (44px) bold, Section Heading 1.75rem (28px) semi-bold, Body & Data 0.875rem (14px) regular. Tabular numerals menggunakan JetBrains Mono.

## Layout
Sistem Grid dengan kontainer 1280px (`max-w-7xl`), spasi vertikal seksi `py-16` hingga `py-20`, dan adaptif 1 kolom (mobile) hingga 4 kolom (desktop).

## Elevation & Depth
- **The Flat Border Rule**: Pemisahan modul dengan garis batas 1px (`border border-[var(--bd)]`) tanpa drop shadow tebal.
- **Shadow Halus**: `shadow-sm` hanya pada kartu interaktif (demo login, modal popup).

## Shapes
Radius kartu `rounded-xl` (12px), elemen kontrol `rounded-lg` (8px), dan pill badge `rounded-full`.

## Components
Tombol utama kontras solid (`bg-[var(--bl)] text-[var(--act)]`), kartu transaksi `bg-[var(--card)]` dengan border `border-[var(--bd)]`, dan navbar sticky dengan `backdrop-blur-md`.

## Do's and Don'ts
- **DO**: Selalu gunakan variabel tema (`var(--bg)`, `var(--tx)`, `var(--bd)`) untuk semua UI baru.
- **DO**: Pertahankan rasio kontras tinggi agar angka kuantitas dan nominal faktur terbaca jelas.
- **DON'T**: Jangan menggunakan gradien ungu-biru neon atau card berlapis tanpa alasan.
- **DON'T**: Jangan menyembunyikan status kritis di balik hover tooltip.
