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
    <section id="harga" className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-xl mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Harga Langganan</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Pilih periode tagihan. Semakin panjang periodenya, semakin hemat pengeluaran Anda.</p>
        <div className="mt-4 inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
          <button onClick={() => setPeriod("m")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "m" ? "bg-white dark:bg-slate-800 text-blue-600 shadow" : "text-slate-600 dark:text-slate-400"}`}>Bulanan</button>
          <button onClick={() => setPeriod("y")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "y" ? "bg-white dark:bg-slate-800 text-blue-600 shadow" : "text-slate-600 dark:text-slate-400"}`}>Tahunan (Hemat 15%)</button>
          <button onClick={() => setPeriod("y2")} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${period === "y2" ? "bg-white dark:bg-slate-800 text-blue-600 shadow" : "text-slate-600 dark:text-slate-400"}`}>2 Tahun (Hemat 25%)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((t, idx) => {
          const finalPrice = Math.round(t.basePrice * (1 - discount));
          return (
            <div key={idx} className={`rounded-2xl border p-6 flex flex-col justify-between ${t.popular ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-lg" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm"}`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.name}</h3>
                  {t.popular && <span className="rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">Paling Populer</span>}
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 min-h-10">{t.desc}</p>
                <div className="mt-4">
                  {t.basePrice > 0 ? (
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Rp {finalPrice.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-500">/ bulan</span></div>
                  ) : (
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Hubungi Kami</div>
                  )}
                </div>
                <div className="mt-6 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {t.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <a href={waLink(t.name)} target="_blank" rel="noopener noreferrer" className={`mt-8 block w-full rounded-lg py-2.5 text-center text-xs font-bold transition-colors ${t.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"}`}>
                {t.basePrice > 0 ? `Pilih Paket ${t.name}` : "Minta Penawaran"}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
