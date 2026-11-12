"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "./DemoContext";
import { DIcon } from "./icons";
import { Badge, Bar, BTN, Card, DemoTag, TD, TH } from "./ui";
import type { Tone } from "./ui";
import { nf, orderTab, progress, rp } from "./calc";
import type { OrderTab } from "./calc";
import { CUSTOMERS, ORDERS } from "./data";
import type { DoStatus } from "./data";

const TABS: [OrderTab, string][] = [["all", "Semua Pesanan"], ["credit", "Menunggu Cek Kredit"], ["ready", "Siap Kirim"], ["partial", "Kirim Sebagian"], ["delivered", "Terkirim & Ditagih"]];
export const DO_LABEL: Record<DoStatus, [string, Tone]> = { picking: ["Picking", "a"], planned: ["Dijadwalkan", "b"], transit: ["Dalam perjalanan", "b"], pod: ["Terkirim · POD", "g"] };

export function SalesTable({ limit }: { limit?: number }) {
  const { dos, skus, act } = useDemo();
  const [tab, setTab] = useState<OrderTab>("all");
  const [open, setOpen] = useState<string | null>(null);
  const count = (t: OrderTab) => ORDERS.filter((o) => t === "all" || orderTab(o, dos) === t).length;
  const rows = ORDERS.filter((o) => tab === "all" || orderTab(o, dos) === tab).slice(0, limit);
  const sku = (code: string) => skus.find((s) => s.code === code)!;

  return (
    <Card data-tour="orders" className="overflow-hidden">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-[var(--bd)] p-2">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setOpen(null); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${tab === k ? "bg-[var(--bl)] text-[var(--act)]" : "text-[var(--mu)] hover:bg-[var(--soft)]"}`}>
            {label} ({count(k)})
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr>{["ID Pesanan", "Pelanggan", "Total", "Status Kredit", "Reservasi Stok", "Pengiriman", "Aksi"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((o) => {
              const p = progress(o, dos), mine = dos.filter((d) => d.so === o.id), pod = mine.find((d) => d.status === "pod");
              const name = CUSTOMERS.find((c) => c.code === o.cust)!.name, isOpen = open === o.id;
              return (
                <React.Fragment key={o.id}>
                  <tr>
                    <td className={TD}><button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : o.id)} className="font-bold">{isOpen ? "▾" : "▸"} {o.id}</button> <DemoTag show={o.demo} /></td>
                    <td className={TD}>{name}</td>
                    <td className={TD}>{rp(o.total)}</td>
                    <td className={TD}><Badge tone={o.hold ? "r" : "g"}>{o.hold ? "CREDIT HOLD" : "APPROVED"}</Badge></td>
                    <td className={TD}><Badge tone="a"><DIcon name="lock" className="h-3 w-3" />{o.hold ? "MENUNGGU KREDIT" : "LOCKED / ATP OK"}</Badge></td>
                    <td className={`${TD} w-36`}><Bar parts={[{ pct: p, color: p === 100 ? "var(--gr)" : "var(--bl)" }]} /><span className="text-xs text-[var(--mu)]">{p}%</span></td>
                    <td className={TD}>{o.hold
                      ? <button className={`${BTN} bg-rose-700! text-white!`} onClick={() => act({ type: "notify", message: `Permintaan override kredit ${o.id} dikirim ke Manajer Keuangan` })}>Review kredit</button>
                      : <Link className={BTN} href="/demo/delivery">{p === 100 ? "Lihat DO" : "Kelola DO"}</Link>}</td>
                  </tr>
                  {isOpen && (
                    <tr><td colSpan={7} className="grid gap-6 border-b border-[var(--bd)] bg-[var(--soft)] p-4 text-sm md:grid-cols-2">
                      <div><b className="flex items-center gap-2"><DIcon name="truck" />Rincian pengiriman terpisah</b>
                        {mine.length ? <ul className="mt-2 divide-y divide-[var(--bd)]">{mine.map((d) => <li key={d.id} className="py-2"><b>#{d.id}</b> <Badge tone={DO_LABEL[d.status][1]}>{DO_LABEL[d.status][0]}</Badge><p className="text-[var(--mu)]">{sku(d.sku).name} × {nf(d.qty)} {sku(d.sku).uom}</p></li>)}</ul>
                          : <p className="mt-2 text-[var(--mu)]">Belum ada surat jalan. Pesanan menunggu persetujuan kredit sebelum stok dikunci.</p>}</div>
                      <div><b className="flex items-center gap-2"><DIcon name="doc" />Bukti terima (POD)</b>
                        {pod ? <p className="mt-2 text-[var(--mu)]"><span className="font-semibold text-emerald-700 dark:text-emerald-400">Terverifikasi · #{pod.id}</span><br />Diterima oleh Pak Hendra (Pengawas Proyek). Reservasi dilepas dan stok fisik berkurang saat POD.</p>
                          : <p className="mt-2 text-[var(--mu)]">POD muncul setelah surat jalan pertama dikonfirmasi diterima.</p>}</div>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
            {!rows.length && <tr><td colSpan={7} className={`${TD} text-[var(--mu)]`}>Tidak ada pesanan di tampilan ini.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
