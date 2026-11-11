"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CheckIcon } from "./Icons";

export function PricingSection() {
  const { t, locale } = useLanguage();
  const [period, setPeriod] = useState<"m" | "y" | "y2">("m");

  const discount = period === "y" ? 0.15 : period === "y2" ? 0.25 : 0;

  const tiers = [
    {
      name: "Starter",
      basePrice: 1500000,
      desc: locale === "en" ? "For growing distributors transitioning from manual spreadsheets." : "Untuk distributor berkembang yang ingin beralih dari pencatatan manual spreadsheet.",
      features: locale === "en" ? ["1 Storage Warehouse", "Up to 5 Users", "SKU Catalog & ATP Reservation", "Sales Orders & Invoices", "Technical Email Support"] : ["1 Gudang Penyimpanan", "Hingga 5 Pengguna", "Katalog SKU & Reservasi ATP", "Order Penjualan & Faktur", "Dukungan Email Teknis"],
      popular: false,
    },
    {
      name: "Growth",
      basePrice: 3500000,
      desc: locale === "en" ? "For active distributors with multi-warehouses and phased split deliveries." : "Untuk distributor aktif dengan multi-gudang dan pengiriman parsial bertahap.",
      features: locale === "en" ? ["Up to 3 Warehouses", "Up to 20 Users", "Split Delivery & Digital POD", "Purchasing (PO/GRN) & AR Aging", "Real-Time Executive Dashboard", "Priority WhatsApp Support"] : ["Hingga 3 Gudang", "Hingga 20 Pengguna", "Pengiriman Parsial & POD Digital", "Pembelian (PO/GRN) & AR Aging", "Dasbor Eksekutif Real-Time", "Dukungan Prioritas WhatsApp"],
      popular: true,
    },
    {
      name: "Enterprise",
      basePrice: 0,
      desc: locale === "en" ? "For holding groups with multi-entity needs and deep custom integrations." : "Untuk holding group dengan multi-organisasi dan kebutuhan kustomisasi mendalam.",
      features: locale === "en" ? ["Unlimited Warehouses & Users", "Multi-Tenant Holding Scoping", "Dedicated Onboarding & Migration", "Custom Business Logic", "Dedicated Account Manager"] : ["Gudang & User Tanpa Batas", "Multi-Tenant Holding", "Onboarding & Migrasi Data", "Kustomisasi Alur Kerja", "Dedicated Account Manager"],
      popular: false,
    },
  ];

  const waLink = (tier: string) => {
    const text = encodeURIComponent(locale === "en" ? `Hello Afriza, I am interested in DistribuCore ${tier} tier.` : `Halo Afriza, saya tertarik dengan paket ${tier} DistribuCore.`);
    return `https://wa.me/6281339529934?text=${text}`;
  };

  return (
    <section id="harga" className="mx-auto max-w-6xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="max-w-2xl mb-12">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">{t("pricing_title")}</h2>
        <p className="mt-3 text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">{t("pricing_desc")}</p>
        <div className="mt-6 inline-flex rounded-xl border border-[var(--bd)] bg-[var(--soft)] p-1.5">
          <button onClick={() => setPeriod("m")} className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${period === "m" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>{t("pricing_m")}</button>
          <button onClick={() => setPeriod("y")} className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${period === "y" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>{t("pricing_y")}</button>
          <button onClick={() => setPeriod("y2")} className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${period === "y2" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>{t("pricing_y2")}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {tiers.map((tItem, idx) => {
          const finalPrice = Math.round(tItem.basePrice * (1 - discount));
          return (
            <div key={idx} className={`rounded-2xl border p-7 flex flex-col justify-between ${tItem.popular ? "border-[var(--bl)] bg-[var(--card)] shadow-xl" : "border-[var(--bd)] bg-[var(--card)] shadow-sm"}`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-[var(--tx)]">{tItem.name}</h3>
                  {tItem.popular && <span className="rounded-full bg-[var(--bl)] text-[var(--act)] px-3 py-1 text-xs font-bold uppercase tracking-wider">{t("pricing_popular")}</span>}
                </div>
                <p className="mt-3 text-sm sm:text-base text-[var(--mu)] min-h-12 leading-relaxed">{tItem.desc}</p>
                <div className="mt-5">
                  {tItem.basePrice > 0 ? (
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[var(--tx)]">Rp {finalPrice.toLocaleString("id-ID")} <span className="text-xs sm:text-sm font-medium text-[var(--mu)] font-sans">{t("pricing_per_mo")}</span></div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black font-heading text-[var(--tx)]">{t("pricing_contact")}</div>
                  )}
                </div>
                <div className="mt-7 space-y-3 border-t border-[var(--bd)] pt-7">
                  {tItem.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2.5 text-sm sm:text-base text-[var(--tx)] font-medium">
                      <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <a href={waLink(tItem.name)} target="_blank" rel="noopener noreferrer" className={`mt-8 block w-full rounded-xl py-3.5 text-center text-sm sm:text-base font-bold transition-all ${tItem.popular ? "bg-[var(--bl)] text-[var(--act)] hover:opacity-90 shadow-md" : "border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] hover:bg-[var(--soft)]"}`}>
                {tItem.basePrice > 0 ? `${t("pricing_choose")} ${tItem.name}` : t("pricing_quote")}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
