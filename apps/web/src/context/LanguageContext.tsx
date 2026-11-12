"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;
}

export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  id: {
    nav_modules: "Modul",
    nav_workflow: "Alur Kerja",
    nav_personas: "Untuk Siapa",
    nav_pricing: "Harga",
    nav_faq: "FAQ",
    nav_contact: "Kontak",
    nav_demo: "Coba Demo",
    // Hero
    hero_title: "Stok yang dijanjikan harus stok yang benar-benar ada.",
    hero_kicker: "Mesin Reservasi Stok Real-Time (ATP) Terintegrasi",
    hero_desc: "DistribuCore adalah sistem manajemen distribusi B2B multi-tenant untuk distributor, grosir, dan pemasok material bangunan. Pengadaan, reservasi stok, pengiriman bertahap, dan piutang berjalan di satu sumber data terpadu.",
    hero_cta_demo: "Coba Demo Langsung",
    hero_cta_modules: "Jelajahi 7 Modul",
    hero_sim_title: "Simulator ATP · Semen 50kg",
    hero_sim_physical: "Fisik",
    hero_sim_locked: "Terkunci",
    hero_sim_atp: "Available-to-Promise (ATP):",
    hero_sim_lock: "Kunci Stok",
    hero_sim_reset: "Reset",
    hero_sim_hint: "Ketik 450 SAK untuk menguji penolakan otomatis saat melebihi kuota ATP.",
    // Demo
    demo_title: "Coba langsung, tanpa instalasi",
    demo_desc: "Jelajahi alur pesanan, stok, pengiriman, dan faktur piutang secara langsung di browser Anda.",
    demo_f1_t: "Akses Demo Satu Klik",
    demo_f1_d: "Jelajahi dasbor operasional dengan data contoh tanpa perlu registrasi akun.",
    demo_f2_t: "Terhubung ke Server API Go Fiber",
    demo_f2_d: "Mendukung koneksi langsung ke backend multi-tenant dan Scalar docs.",
    demo_tab_demo: "Login Demo",
    demo_tab_real: "Login Server Asli",
    demo_sample_desc: "Jelajahi semua fitur dengan data sampel seed: PT Sumber Bangunan Abadi (SBA), Gudang Pusat Cikarang, dan transaksi PO/SO.",
    demo_btn_app: "Buka Aplikasi Demo Interaktif (Dengan Panduan)",
    demo_btn_scalar: "Buka Interactive API & Scalar Docs",
    demo_lbl_server: "Server API",
    demo_lbl_tenant: "Tenant Code",
    demo_lbl_email: "Email",
    demo_btn_connect: "Hubungkan Akun",
    // Modules
    modules_title: "Tujuh modul, satu sumber kebenaran",
    modules_desc: "Setiap modul memakai saldo stok, batasan plafon kredit, dan faktur yang sama secara terintegrasi.",
    // Workflow & Personas
    workflow_title: "Alur Kerja Distribusi Terpadu",
    workflow_desc: "Dari pengadaan barang pabrik hingga penagihan dan pembayaran pelanggan.",
    personas_title: "Satu sistem untuk setiap peran",
    personas_desc: "Dari staf gudang hingga jajaran direksi, setiap peran bekerja dengan data yang saling tersinkronisasi.",
    // Pricing
    pricing_title: "Harga Langganan",
    pricing_desc: "Pilih periode tagihan. Semakin panjang periodenya, semakin hemat pengeluaran Anda.",
    pricing_m: "Bulanan",
    pricing_y: "Tahunan (Hemat 15%)",
    pricing_y2: "2 Tahun (Hemat 25%)",
    pricing_popular: "Paling Populer",
    pricing_per_mo: "/ bulan",
    pricing_contact: "Hubungi Kami",
    pricing_choose: "Pilih Paket",
    pricing_quote: "Minta Penawaran",
    // FAQ
    faq_title: "Pertanyaan yang Sering Diajukan",
    faq_desc: "Semua yang perlu Anda ketahui tentang implementasi DistribuCore di bisnis Anda.",
    // Footer
    footer_cta_t: "Tertarik? Hubungi Afriza",
    footer_cta_d: "Minta demo langsung, penawaran harga, atau diskusi kebutuhan distribusi Anda.",
    footer_tagline: "Sistem manajemen distribusi B2B untuk distributor, grosir, dan pemasok bahan bangunan.",
    footer_strengths: "Keunggulan",
    footer_menu: "Menu",
    footer_contact_us: "Hubungi kami",
    footer_wa_hint: "Minta demo langsung lewat WhatsApp",
    footer_copy: "© 2026 Afriza. Hak cipta dilindungi undang-undang.",
    footer_sub: "DistribuCore · Sistem Manajemen Distribusi B2B",
  },
  en: {
    nav_modules: "Modules",
    nav_workflow: "Workflow",
    nav_personas: "Personas",
    nav_pricing: "Pricing",
    nav_faq: "FAQ",
    nav_contact: "Contact",
    nav_demo: "Try Demo",
    // Hero
    hero_title: "Promised stock must be stock that truly exists.",
    hero_kicker: "Integrated Real-Time Stock Reservation Engine (ATP)",
    hero_desc: "DistribuCore is a multi-tenant B2B distribution management system for building material distributors, wholesalers, and suppliers. Procurement, stock reservation, split deliveries, and receivables run on a unified source of truth.",
    hero_cta_demo: "Try Live Demo",
    hero_cta_modules: "Explore 7 Modules",
    hero_sim_title: "ATP Simulator · Cement 50kg",
    hero_sim_physical: "Physical",
    hero_sim_locked: "Locked",
    hero_sim_atp: "Available-to-Promise (ATP):",
    hero_sim_lock: "Lock Stock",
    hero_sim_reset: "Reset",
    hero_sim_hint: "Type 450 BAGS to test automated rejection when exceeding ATP quota.",
    // Demo
    demo_title: "Try immediately, no installation",
    demo_desc: "Explore order flows, stock, deliveries, and receivables invoices directly in your browser.",
    demo_f1_t: "One-Click Demo Access",
    demo_f1_d: "Explore the operational dashboard with seed sample data without account registration.",
    demo_f2_t: "Connected to Go Fiber API Server",
    demo_f2_d: "Supports direct live connection to the multi-tenant backend and Scalar docs.",
    demo_tab_demo: "Demo Login",
    demo_tab_real: "Live Server Login",
    demo_sample_desc: "Explore all features with sample seed data: PT Sumber Bangunan Abadi (SBA), Cikarang Central Warehouse, and PO/SO transactions.",
    demo_btn_app: "Launch Interactive Demo App (With Tour)",
    demo_btn_scalar: "Open Interactive API & Scalar Docs",
    demo_lbl_server: "API Server",
    demo_lbl_tenant: "Tenant Code",
    demo_lbl_email: "Email",
    demo_btn_connect: "Connect Account",
    // Modules
    modules_title: "Seven modules, one source of truth",
    modules_desc: "Every module shares synchronized stock balances, credit limit caps, and invoices seamlessly.",
    // Workflow & Personas
    workflow_title: "Unified Distribution Workflow",
    workflow_desc: "From factory procurement to customer invoicing, collection, and payment.",
    personas_title: "One system for every role",
    personas_desc: "From warehouse floor staff to executive directors, every role works with real-time synchronized data.",
    // Pricing
    pricing_title: "Subscription Pricing",
    pricing_desc: "Choose your billing period. The longer the commitment, the more you save.",
    pricing_m: "Monthly",
    pricing_y: "Yearly (Save 15%)",
    pricing_y2: "2 Years (Save 25%)",
    pricing_popular: "Most Popular",
    pricing_per_mo: "/ month",
    pricing_contact: "Contact Us",
    pricing_choose: "Choose Plan",
    pricing_quote: "Request Quote",
    // FAQ
    faq_title: "Frequently Asked Questions",
    faq_desc: "Everything you need to know about implementing DistribuCore in your operations.",
    // Footer
    footer_cta_t: "Interested? Contact Afriza",
    footer_cta_d: "Request a live demo, pricing quotation, or discuss your distribution workflow.",
    footer_tagline: "B2B distribution management system for distributors, wholesalers, and building suppliers.",
    footer_strengths: "Key Strengths",
    footer_menu: "Menu",
    footer_contact_us: "Contact Us",
    footer_wa_hint: "Request a live demo directly via WhatsApp",
    footer_copy: "© 2026 Afriza. All rights reserved.",
    footer_sub: "DistribuCore · B2B Distribution Management System",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  setLocale: () => {},
  t: (key: string) => TRANSLATIONS.id[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("dc_lang") as Locale;
    if (saved === "id" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    document.documentElement.lang = loc;
    try {
      localStorage.setItem("dc_lang", loc);
    } catch {}
  };

  const t = (key: string) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS.id[key] || key;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
