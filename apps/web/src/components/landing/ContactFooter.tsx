"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldIcon } from "./Icons";

export function ContactFooter() {
  const { t, locale } = useLanguage();
  const wa = (text: string) => `https://wa.me/6281339529934?text=${encodeURIComponent(text)}`;
  const waMsg = locale === "en" ? "Hello Afriza, I would like to learn more about DistribuCore." : "Halo Afriza, saya ingin tahu lebih lanjut tentang DistribuCore.";

  return (
    <>
      <section id="kontak" className="max-w-[1200px] mx-auto py-16 lg:py-24 px-[5vw]">
        <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 justify-between transition-colors shadow-sm">
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">{t("footer_cta_t")}</h2>
            <p className="text-base sm:text-lg text-[var(--mu)] mt-3 leading-relaxed [text-wrap:pretty]">{t("footer_cta_d")}</p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <a target="_blank" rel="noopener noreferrer" href={wa(waMsg)} className="inline-flex items-center justify-center border border-[var(--bl)] bg-[var(--bl)] text-[var(--act)] rounded-xl px-6 py-3.5 font-bold text-sm sm:text-base hover:opacity-90 shadow-md transition-opacity">
              WhatsApp 081339529934
            </a>
            <a href="mailto:afriza.dwi21@gmail.com" className="inline-flex items-center justify-center border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] rounded-xl px-6 py-3.5 font-bold text-sm sm:text-base hover:bg-[var(--soft)] transition-colors">
              afriza.dwi21@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--bd)] bg-[var(--card)] pt-14 pb-8 px-[5vw] transition-colors">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 group">
              <Image
                src="/Logo.png"
                alt="DistribuCore"
                width={176}
                height={32}
                className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="sr-only">DistribuCore</span>
            </a>
            <p className="text-[var(--mu)] text-sm mt-4 max-w-[300px] leading-relaxed">{t("footer_tagline")}</p>
          </div>
          <div>
            <h4 className="text-sm font-black font-heading tracking-wide uppercase text-[var(--tx)] mb-3">{t("footer_strengths")}</h4>
            <ul className="space-y-2 text-sm text-[var(--mu)] list-none p-0 m-0 font-medium">
              <li>{locale === "en" ? "Locked stock, zero double selling" : "Stok terkunci, tanpa jual ganda"}</li>
              <li>{locale === "en" ? "Partial shipments & digital POD" : "Pengiriman parsial & POD digital"}</li>
              <li>{locale === "en" ? "Automated credit ceiling checks" : "Limit kredit otomatis"}</li>
              <li>{locale === "en" ? "Invoices backed by delivery orders" : "Faktur dari surat jalan"}</li>
              <li>{locale === "en" ? "Multi-warehouse & multi-entity" : "Banyak gudang & perusahaan"}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black font-heading tracking-wide uppercase text-[var(--tx)] mb-3">{t("footer_menu")}</h4>
            <div className="space-y-2 text-sm text-[var(--mu)] flex flex-col font-medium">
              <a href="#fitur" className="hover:text-[var(--tx)] transition-colors">{t("nav_modules")}</a>
              <a href="#alur" className="hover:text-[var(--tx)] transition-colors">{t("nav_workflow")}</a>
              <a href="#peran" className="hover:text-[var(--tx)] transition-colors">{t("nav_personas")}</a>
              <a href="#harga" className="hover:text-[var(--tx)] transition-colors">{t("nav_pricing")}</a>
              <a href="#faq" className="hover:text-[var(--tx)] transition-colors">{t("nav_faq")}</a>
              <a href="#coba" className="hover:text-[var(--tx)] transition-colors">{t("nav_demo")}</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black font-heading tracking-wide uppercase text-[var(--tx)] mb-3">{t("footer_contact_us")}</h4>
            <div className="space-y-2 text-sm text-[var(--mu)] flex flex-col font-medium">
              <a target="_blank" rel="noopener noreferrer" href={wa(waMsg)} className="hover:text-[var(--tx)] transition-colors">WhatsApp 081339529934</a>
              <a href="mailto:afriza.dwi21@gmail.com" className="hover:text-[var(--tx)] transition-colors">afriza.dwi21@gmail.com</a>
              <span className="text-xs text-[var(--mu)]">{t("footer_wa_hint")}</span>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-12 pt-6 border-t border-[var(--bd)] flex flex-wrap justify-between gap-4 text-xs sm:text-sm text-[var(--mu)] font-medium">
          <span>{t("footer_copy")}</span>
          <span>{t("footer_sub")}</span>
        </div>
      </footer>
    </>
  );
}
