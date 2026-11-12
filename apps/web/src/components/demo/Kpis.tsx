"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "./DemoContext";
import { Bar } from "./ui";
import { health, nf, overdue, pendingQty, rp } from "./calc";

const Cell = ({ label, children, note }: { label: string; children: React.ReactNode; note: React.ReactNode }) => (
  <div className="bg-[var(--card)] p-5">
    <p className="text-sm text-[var(--mu)]">{label}</p>
    <div className="my-1.5 text-2xl font-black font-heading tabular-nums">{children}</div>
    <div className="text-sm text-[var(--mu)]">{note}</div>
  </div>
);

export function Kpis() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { skus, dos, invoices } = useDemo();
  const onHand = skus.reduce((a, s) => a + s.onHand, 0);
  const locked = skus.reduce((a, s) => a + s.reserved, 0);
  const lockPct = Math.round((locked / onHand) * 100);
  const pend = pendingQty(dos);
  const healthy = skus.filter((s) => health(s) === "HEALTHY").length;

  return (
    <div data-tour="kpis" className="grid gap-px overflow-hidden rounded-xl border border-[var(--bd)] bg-[var(--bd)] sm:grid-cols-2 lg:grid-cols-4">
      <Cell
        label={isEn ? "Month-to-date gross revenue" : "Pendapatan kotor bulan ini"}
        note={<span className="text-emerald-700 dark:text-emerald-400">{isEn ? "+12.4% vs last month" : "+12,4% dibanding bulan lalu"}</span>}
      >
        {rp(4_250_000_000)}
      </Cell>
      <Cell
        label={isEn ? "Active inventory value" : "Nilai stok aktif"}
        note={isEn ? `${healthy} of ${skus.length} SKUs healthy (above reorder)` : `${healthy} dari ${skus.length} SKU sehat (di atas titik pesan)`}
      >
        {rp(12_840_000_000)}
      </Cell>
      <Cell
        label={isEn ? "Locked physical stock" : "Stok fisik yang terkunci"}
        note={isEn ? `${nf(pend)} units awaiting delivery (DO picking/scheduled)` : `${nf(pend)} unit menunggu pengiriman (DO picking/dijadwalkan)`}
      >
        {lockPct}%
        <span className="mt-2 block"><Bar parts={[{ pct: lockPct, color: "var(--am)" }]} /></span>
      </Cell>
      <Cell
        label={isEn ? "Overdue AR >30 days" : "Piutang lewat jatuh tempo >30 hari"}
        note={<Link href="/demo/ar" className="font-semibold text-rose-700 underline underline-offset-2 dark:text-rose-400">{isEn ? "Start dunning" : "Mulai penagihan"}</Link>}
      >
        {rp(overdue(invoices))}
      </Cell>
    </div>
  );
}
