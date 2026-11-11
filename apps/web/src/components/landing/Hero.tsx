"use client";

import React, { useState } from "react";
import { LockIcon, CheckIcon, ArrowRightIcon } from "./Icons";

export function Hero() {
  const [extraLock, setExtraLock] = useState(0);
  const [inputVal, setInputVal] = useState("150");
  const [errorMsg, setErrorMsg] = useState("");

  const totalOnHand = 500;
  const currentLocked = 100 + extraLock;
  const atp = totalOnHand - currentLocked;

  const handleLock = () => {
    const qty = parseInt(inputVal, 10);
    if (isNaN(qty) || qty <= 0) return;
    if (qty > atp) {
      setErrorMsg(`insufficient stock for SMN-TR-50KG: ATP ${atp}, required ${qty}`);
    } else {
      setExtraLock((prev) => prev + qty);
      setErrorMsg("");
    }
  };

  const handleReset = () => { setExtraLock(0); setErrorMsg(""); };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-7 space-y-5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="w-3.5 h-3.5" /> Mesin Reservasi Stok Real-Time
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Stok yang dijanjikan harus stok yang benar-benar ada.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
          DistribuCore adalah sistem manajemen distribusi B2B multi-tenant untuk distributor, grosir, dan pemasok material bangunan. Pengadaan, reservasi stok, pengiriman bertahap, dan piutang berjalan di satu sumber data terpadu.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a href="#coba" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors">
            Coba Demo Langsung <ArrowRightIcon className="w-4 h-4" />
          </a>
          <a href="#fitur" className="rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Jelajahi 7 Modul
          </a>
        </div>
      </div>

      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <LockIcon className="w-4 h-4 text-amber-500" /> Simulator ATP · Semen Tiga Roda 50kg
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Redis Lock
          </span>
        </div>

        <div className="py-4 space-y-3">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span>Fisik: {totalOnHand} SAK</span>
            <span className="text-amber-500 font-bold">Terkunci: {currentLocked} SAK</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div style={{ width: `${(currentLocked / totalOnHand) * 100}%` }} className="bg-amber-500 transition-all duration-300" />
            <div style={{ width: `${(atp / totalOnHand) * 100}%` }} className="bg-emerald-500 transition-all duration-300" />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Available-to-Promise (ATP): <strong className={atp > 0 ? "text-emerald-500 text-sm" : "text-rose-500 text-sm"}>{atp} SAK</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
          />
          <button onClick={handleLock} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            Kunci Stok
          </button>
          <button onClick={handleReset} className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Reset
          </button>
        </div>
        {errorMsg ? (
          <p className="mt-3 text-[11px] font-mono text-rose-500">{errorMsg}</p>
        ) : (
          <p className="mt-3 text-[10px] text-slate-400">Ketik 450 SAK untuk menguji penolakan otomatis saat melebihi kuota ATP.</p>
        )}
      </div>
    </section>
  );
}
