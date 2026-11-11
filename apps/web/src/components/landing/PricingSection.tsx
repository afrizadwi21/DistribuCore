"use client";

import React, { useState } from "react";
import { CheckIcon } from "./Icons";

export function PricingSection() {
  const [period, setPeriod] = useState<"m" | "y" | "y2">("m");

  const discount = period === "y" ? 0.15 : period === "y2" ? 0.25 : 0;
  const multiplier = period === "y" ? 12 : period === "y2" ? 24 : 1;

  const tiers = [
    {
      name: "Starter",
      basePrice: 1500000,
      desc: "Untuk distributor berkembang yang ingin beralih dari pencatatan manual spreadsheet.",
      features: ["1 Gudang Penyimpanan", "Hingga 5 Pengguna", "Katalog SKU & Reservasi ATP", "Order Penjualan & Faktur", "Dukungan Email Teknis"],
      popular: false,
    },
    {
      name: "Growth",
      basePrice: 3500000,
      desc: "Untuk distributor aktif dengan multi-gudang dan pengiriman parsial bertahap.",
      features: ["Hingga 3 Gudang", "Hingga 20 Pengguna", "Pengiriman Parsial & POD Digital", "Pembelian (PO/GRN) & AR Aging", "Dasbor Eksekutif Real-Time", "Dukungan Prioritas WhatsApp"],
      popular: true,
    },
    {
      name: "Enterprise",
      basePrice: 0,
      desc: "Untuk holding group dengan multi-organisasi dan kebutuhan kustomisasi mendalam.",
      features: ["Gudang & User Tanpa Batas", "Multi-Tenant Holding", "Onboarding & Migrasi Data", "Kustomisasi Alur Kerja", "Dedicated Account Manager"],
      popular: false,
    },
  ];

  const waLink = (tier: string) => {
    const text = encodeURIComponent(`Halo Afriza, saya tertarik dengan paket ${tier} DistribuCore.`);
    return `https://wa.me/6281339529934?text=${text}`;
  };

  return (
    <section id="harga" className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--bd)]">
      <div className="max-w-xl mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">Harga Langganan</h2>
        <p className="mt-2 text-sm text-[var(--mu)]">Pilih periode tagihan. Semakin panjang periodenya, semakin hemat pengeluaran Anda.</p>
        <div className="mt-4 inline-flex rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-1">
          <button onClick={() => setPeriod("m")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "m" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)]"}`}>Bulanan</button>
          <button onClick={() => setPeriod("y")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "y" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)]"}`}>Tahunan (Hemat 15%)</button>
          <button onClick={() => setPeriod("y2")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "y2" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)]"}`}>2 Tahun (Hemat 25%)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((t, idx) => {
          const finalPrice = Math.round(t.basePrice * (1 - discount));
          return (
            <div key={idx} className={`rounded-2xl border p-6 flex flex-col justify-between ${t.popular ? "border-[var(--bl)] bg-[var(--card)] shadow-lg" : "border-[var(--bd)] bg-[var(--card)] shadow-sm"}`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--tx)]">{t.name}</h3>
                  {t.popular && <span className="rounded-full bg-[var(--bl)] text-[var(--act)] px-2.5 py-0.5 text-[11px] font-bold">Paling Populer</span>}
                </div>
                <p className="mt-2 text-xs text-[var(--mu)] min-h-10">{t.desc}</p>
                <div className="mt-4">
                  {t.basePrice > 0 ? (
                    <div className="text-2xl font-extrabold text-[var(--tx)]">Rp {finalPrice.toLocaleString("id-ID")} <span className="text-xs font-normal text-[var(--mu)]">/ bulan</span></div>
                  ) : (
                    <div className="text-2xl font-extrabold text-[var(--tx)]">Hubungi Kami</div>
                  )}
                </div>
                <div className="mt-6 space-y-2.5 border-t border-[var(--bd)] pt-6">
                  {t.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs text-[var(--tx)]">
                      <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <a href={waLink(t.name)} target="_blank" rel="noopener noreferrer" className={`mt-8 block w-full rounded-lg py-2.5 text-center text-xs font-bold transition-all ${t.popular ? "bg-[var(--bl)] text-[var(--act)] hover:opacity-90" : "border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] hover:bg-[var(--soft)]"}`}>
                {t.basePrice > 0 ? `Pilih Paket ${t.name}` : "Minta Penawaran"}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
