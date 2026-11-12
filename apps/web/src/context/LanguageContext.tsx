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
    nav_login: "Login",
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
    // Login Server
    login_title: "Masuk ke Server Asli",
    login_desc: "Akses akun distributor untuk mengelola operasional penjualan, gudang, dan keuangan bisnis Anda.",
    login_f1_t: "Keamanan Multi-Tenant",
    login_f1_d: "Setiap perusahaan memiliki ruang data dan enkripsi sesi yang terisolasi.",
    login_f2_t: "Kontrol Akses Berbasis Peran (RBAC)",
    login_f2_d: "Akses disesuaikan untuk pemilik, manajer gudang, sales, dan tim keuangan.",
    login_lbl_tenant: "Kode Tenant (Perusahaan)",
    login_lbl_email: "Email Pengguna",
    login_lbl_password: "Kata Sandi",
    login_btn_submit: "Masuk ke Server",
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
    nav_login: "Login",
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
    // Login Server
    login_title: "Sign in to Live Server",
    login_desc: "Access your distributor account to manage sales, warehouse operations, and financial workflows.",
    login_f1_t: "Multi-Tenant Security",
    login_f1_d: "Every enterprise operates within isolated data scopes and encrypted sessions.",
    login_f2_t: "Role-Based Access Control (RBAC)",
    login_f2_d: "Tailored access for business owners, warehouse managers, sales, and finance teams.",
    login_lbl_tenant: "Tenant Code",
    login_lbl_email: "User Email",
    login_lbl_password: "Password",
    login_btn_submit: "Sign In to Server",
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
