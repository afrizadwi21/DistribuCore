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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--tx)] leading-[1.12]">
          Stok yang dijanjikan harus stok yang benar-benar ada.
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Mesin Reservasi Stok Real-Time (ATP) Terintegrasi</span>
        </div>
        <p className="text-sm sm:text-base text-[var(--mu)] max-w-xl leading-relaxed">
          DistribuCore adalah sistem manajemen distribusi B2B multi-tenant untuk distributor, grosir, dan pemasok material bangunan. Pengadaan, reservasi stok, pengiriman bertahap, dan piutang berjalan di satu sumber data terpadu.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a href="#coba" className="inline-flex items-center gap-2 rounded-lg bg-[var(--bl)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--act)] shadow hover:opacity-90 transition-opacity">
            Coba Demo Langsung <ArrowRightIcon className="w-4 h-4" />
          </a>
          <a href="#fitur" className="rounded-lg border border-[var(--bd)] bg-[var(--card)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--tx)] hover:bg-[var(--soft)] transition-colors">
            Jelajahi 7 Modul
          </a>
        </div>
      </div>

      <div className="lg:col-span-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--bd)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--tx)]">
            <LockIcon className="w-4 h-4 text-amber-500" /> Simulator ATP · Semen Tiga Roda 50kg
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Redis Lock
          </span>
        </div>

        <div className="py-4 space-y-3">
          <div className="flex justify-between text-xs text-[var(--mu)] font-mono">
            <span>Fisik: {totalOnHand} SAK</span>
            <span className="text-amber-500 font-bold">Terkunci: {currentLocked} SAK</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--soft)] overflow-hidden flex">
            <div style={{ width: `${(currentLocked / totalOnHand) * 100}%` }} className="bg-amber-500 transition-all duration-300" />
            <div style={{ width: `${(atp / totalOnHand) * 100}%` }} className="bg-emerald-500 transition-all duration-300" />
          </div>
          <div className="text-xs text-[var(--mu)] font-medium">
            Available-to-Promise (ATP): <strong className={atp > 0 ? "text-emerald-500 text-sm" : "text-rose-500 text-sm"}>{atp} SAK</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-24 rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-2.5 py-1.5 text-xs text-[var(--tx)]"
          />
          <button onClick={handleLock} className="rounded-lg bg-[var(--bl)] px-3 py-1.5 text-xs font-semibold text-[var(--act)] hover:opacity-90 transition-opacity">
            Kunci Stok
          </button>
          <button onClick={handleReset} className="rounded-lg border border-[var(--bd)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--tx)] hover:bg-[var(--soft)] transition-colors">
            Reset
          </button>
        </div>
        {errorMsg ? (
          <p className="mt-3 text-xs font-mono text-rose-500">{errorMsg}</p>
        ) : (
          <p className="mt-3 text-xs text-[var(--mu)]">Ketik 450 SAK untuk menguji penolakan otomatis saat melebihi kuota ATP.</p>
        )}
      </div>
    </section>
  );
}
