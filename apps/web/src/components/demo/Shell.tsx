"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { SunIcon, MoonIcon } from "@/components/landing/Icons";
import { useLanguage } from "@/context/LanguageContext";
import { DIcon } from "./icons";
import { getNavGroups } from "./nav";
import { Tour } from "./Tour";
import { TOUR_STEPS } from "./tour-steps";
import { Badge, BTN } from "./ui";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { isDark, toggle } = useTheme();
  const { locale, setLocale } = useLanguage();
  const isEn = locale === "en";
  const [tour, setTour] = useState<number | null>(null);

  const navGroups = getNavGroups(locale);
  const allNavItems = navGroups.flatMap((g) => g.items);
  const page = allNavItems.find((n) => n.href === path) ?? allNavItems[0];

  useEffect(() => {
    if (!localStorage.getItem("dc_tour_done")) setTour(0);
  }, []);

  const close = () => { setTour(null); try { localStorage.setItem("dc_tour_done", "1"); } catch {} };
  const open = () => setTour(Math.max(0, TOUR_STEPS.findIndex((s) => s.href === path && s.target !== "sidebar")));

  return (
    <div className="grid min-h-screen md:grid-cols-[15.5rem_1fr]">
      <nav data-tour="sidebar" aria-label="Menu demo" className="flex gap-1 overflow-x-auto border-b border-[var(--bd)] bg-[var(--card)] p-3 md:sticky md:top-0 md:h-screen md:min-h-screen md:flex-col md:overflow-y-auto md:border-r md:border-b-0 md:p-3.5">
        <Link href="/" className="hidden px-2 pb-3 text-lg font-black font-heading md:block">DistribuCore</Link>
        {navGroups.map((g) => (
          <React.Fragment key={g.group}>
            <small className="hidden px-2.5 pt-3 pb-1 text-xs font-bold text-[var(--mu)] md:block">{g.group}</small>
            {g.items.map((n) => (
              <Link key={n.href} href={n.href} aria-current={n.href === path ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${n.href === path ? "bg-[var(--bl)]/10 text-[var(--bl)]" : "text-[var(--mu)] hover:bg-[var(--soft)]"}`}>
                <DIcon name={n.icon} />{n.label}
              </Link>
            ))}
          </React.Fragment>
        ))}
        <div className="mt-auto hidden pt-4 md:block">
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--bl)] text-[10px] font-black text-[var(--act)] shrink-0">
              SBA
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-bold text-[var(--tx)]">{isEn ? "Demo Mode" : "Mode Demo"}</p>
              <p className="truncate text-[10px] text-[var(--mu)]">{isEn ? "WH-CKR · Central Warehouse" : "WH-CKR · Gudang Pusat"}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 transition-all whitespace-nowrap"
          >
            <DIcon name="exit" className="h-3.5 w-3.5" />
            <span>{isEn ? "Exit Demo" : "Keluar Demo"}</span>
          </Link>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 md:hidden whitespace-nowrap"
        >
          <DIcon name="exit" className="h-3.5 w-3.5" />
          <span>{isEn ? "Exit" : "Keluar"}</span>
        </Link>
      </nav>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-2.5 border-b border-[var(--bd)] bg-[var(--card)] px-5 py-3">
          <span className="text-sm text-[var(--mu)]">PT Sumber Bangunan Abadi (SBA) / <b className="text-[var(--tx)]">{isEn ? "Cikarang Central Warehouse" : "Gudang Pusat Cikarang"}</b></span>
          <span className="flex-1" />
          <Badge tone="a">{isEn ? "Demo mode · sample data" : "Mode demo · data contoh"}</Badge>
          <button className={BTN} onClick={open}><DIcon name="help" />{isEn ? "Tour Guide" : "Panduan"}</button>
          
          {/* Language Selector */}
          <div className="flex items-center rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-0.5 text-xs font-bold" role="group" aria-label="Language selector">
            <button
              onClick={() => setLocale("id")}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                locale === "id" ? "bg-[var(--card)] text-[var(--tx)] shadow-xs" : "text-[var(--mu)] hover:text-[var(--tx)]"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                locale === "en" ? "bg-[var(--card)] text-[var(--tx)] shadow-xs" : "text-[var(--mu)] hover:text-[var(--tx)]"
              }`}
            >
              EN
            </button>
          </div>

          <button aria-label="Ganti tema" onClick={toggle} className={`${BTN} px-2.5!`}>{isDark ? <SunIcon className="h-4 w-4 text-amber-400" /> : <MoonIcon className="h-4 w-4" />}</button>
          <Link href="/" className={BTN}>{isEn ? "Home" : "Beranda"}</Link>
        </header>
        <main className="grid content-start gap-5 p-5 sm:p-6">
          <div>
            <h1 className="text-2xl font-black font-heading sm:text-3xl">{page.title}</h1>
            <p className="mt-1 text-xs text-[var(--mu)]">{page.subtitle}</p>
          </div>
          {children}
        </main>
      </div>
      {tour !== null && <Tour index={tour} onIndex={setTour} onClose={close} />}
    </div>
  );
}
