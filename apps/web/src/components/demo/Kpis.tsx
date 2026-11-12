"use client";

import React from "react";
import Link from "next/link";
import { useDemo } from "./DemoContext";
import { Bar } from "./ui";
import { health, nf, overdue, pendingQty, rp } from "./calc";

const Cell = ({ label, children, note }: { label: string; children: React.ReactNode; note: React.ReactNode }) => (
  <div className="bg-[var(--card)] p-5">
    <p className="text-sm text-[var(--mu)]">{label}</p>
    <p className="my-1.5 text-2xl font-black font-heading tabular-nums">{children}</p>
    <p className="text-sm text-[var(--mu)]">{note}</p>
  </div>
);

export function Kpis() {
  const { skus, dos, invoices } = useDemo();
  const onHand = skus.reduce((a, s) => a + s.onHand, 0);
  const locked = skus.reduce((a, s) => a + s.reserved, 0);
  const lockPct = Math.round((locked / onHand) * 100);
  const pend = pendingQty(dos);
  const healthy = skus.filter((s) => health(s) === "HEALTHY").length;

  return (
    <div data-tour="kpis" className="grid gap-px overflow-hidden rounded-xl border border-[var(--bd)] bg-[var(--bd)] sm:grid-cols-2 lg:grid-cols-4">
      <Cell label="Pendapatan kotor bulan ini" note={<span className="text-emerald-700 dark:text-emerald-400">+12,4% dibanding bulan lalu</span>}>{rp(4_250_000_000)}</Cell>
      <Cell label="Nilai stok aktif" note={`${healthy} dari ${skus.length} SKU sehat (di atas titik pesan)`}>{rp(12_840_000_000)}</Cell>
      <Cell label="Stok fisik yang terkunci" note={`${nf(pend)} unit menunggu pengiriman (DO picking/dijadwalkan)`}>
        {lockPct}%
        <span className="mt-2 block"><Bar parts={[{ pct: lockPct, color: "var(--am)" }]} /></span>
      </Cell>
      <Cell label="Piutang lewat jatuh tempo >30 hari" note={<Link href="/demo/ar" className="font-semibold text-rose-700 underline underline-offset-2 dark:text-rose-400">Mulai penagihan</Link>}>
        {rp(overdue(invoices))}
      </Cell>
    </div>
  );
}
