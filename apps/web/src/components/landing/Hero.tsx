"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LockIcon, CheckIcon, ArrowRightIcon } from "./Icons";

export function Hero() {
  const { t, locale } = useLanguage();
  const [extraLock, setExtraLock] = useState(0);
  const [inputVal, setInputVal] = useState("150");
  const [errorMsg, setErrorMsg] = useState("");

  const unit = locale === "en" ? "BAGS" : "SAK";
  const totalOnHand = 500;
  const currentLocked = 100 + extraLock;
  const atp = totalOnHand - currentLocked;

  const handleLock = () => {
    const qty = parseInt(inputVal, 10);
    if (isNaN(qty) || qty <= 0) return;
    if (qty > atp) {
      setErrorMsg(locale === "en" ? `insufficient stock for SMN-TR-50KG: ATP ${atp}, required ${qty}` : `stok tidak cukup untuk SMN-TR-50KG: ATP ${atp}, dibutuhkan ${qty}`);
    } else {
      setExtraLock((prev) => prev + qty);
      setErrorMsg("");
    }
  };

  const handleReset = () => { setExtraLock(0); setErrorMsg(""); };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7 space-y-6">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.06] [text-wrap:balance]">
          {t("hero_title")}
        </h1>
        <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t("hero_kicker")}</span>
        </div>
        <p className="text-base sm:text-lg lg:text-xl text-[var(--mu)] max-w-xl leading-relaxed [text-wrap:pretty]">
          {t("hero_desc")}
        </p>
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <a href="#coba" className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--bl)] px-6 py-3.5 text-sm sm:text-base font-bold text-[var(--act)] shadow-md hover:opacity-90 transition-opacity">
            {t("hero_cta_demo")} <ArrowRightIcon className="w-4 h-4" />
          </a>
          <a href="#fitur" className="rounded-xl border border-[var(--bd)] bg-[var(--card)] px-5 py-3.5 text-sm sm:text-base font-bold text-[var(--tx)] hover:bg-[var(--soft)] transition-colors">
            {t("hero_cta_modules")}
          </a>
        </div>
      </div>

      <div className="lg:col-span-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--bd)]">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold font-heading text-[var(--tx)]">
            <LockIcon className="w-5 h-5 text-amber-500" /> {t("hero_sim_title")}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Redis Lock
          </span>
        </div>

        <div className="py-5 space-y-4">
          <div className="flex justify-between text-sm text-[var(--mu)] font-mono">
            <span>{t("hero_sim_physical")}: {totalOnHand} {unit}</span>
            <span className="text-amber-500 font-bold">{t("hero_sim_locked")}: {currentLocked} {unit}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[var(--soft)] overflow-hidden flex">
            <div style={{ width: `${(currentLocked / totalOnHand) * 100}%` }} className="bg-amber-500 transition-all duration-300" />
            <div style={{ width: `${(atp / totalOnHand) * 100}%` }} className="bg-emerald-500 transition-all duration-300" />
          </div>
          <div className="text-sm sm:text-base text-[var(--mu)] font-medium">
            {t("hero_sim_atp")} <strong className={atp > 0 ? "text-emerald-500 text-lg sm:text-xl font-bold font-mono" : "text-rose-500 text-lg sm:text-xl font-bold font-mono"}>{atp} {unit}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-28 rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3 py-2 text-sm font-semibold text-[var(--tx)]"
          />
          <button onClick={handleLock} className="rounded-lg bg-[var(--bl)] px-4 py-2 text-sm font-bold text-[var(--act)] hover:opacity-90 transition-opacity">
            {t("hero_sim_lock")}
          </button>
          <button onClick={handleReset} className="rounded-lg border border-[var(--bd)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--tx)] hover:bg-[var(--soft)] transition-colors">
            {t("hero_sim_reset")}
          </button>
        </div>
        {errorMsg ? (
          <p className="mt-3.5 text-xs sm:text-sm font-mono text-rose-500 font-semibold">{errorMsg}</p>
        ) : (
          <p className="mt-3.5 text-xs sm:text-sm text-[var(--mu)] leading-relaxed">{t("hero_sim_hint")}</p>
        )}
      </div>
    </section>
  );
}
