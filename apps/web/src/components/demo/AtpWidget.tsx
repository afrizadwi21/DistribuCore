"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "./DemoContext";
import { DIcon } from "./icons";
import { Bar, BTN, BTN_PRIMARY, Panel } from "./ui";
import { atp, nf } from "./calc";
import type { Sku } from "./data";

const INPUT = "w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3 py-2 text-sm text-[var(--tx)]";

function SkuMeter({ s }: { s: Sku }) {
  const cell = (label: string, v: number, color?: string) => (
    <div><span className="text-xs" style={{ color: color ?? "var(--mu)" }}>{label}</span><br /><b className="text-sm">{nf(v)} {s.uom}</b></div>
  );
  return (
    <div className="mx-4 my-3 rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-3.5">
      <p className="text-sm"><b>{s.name}</b> <span className="font-mono text-xs text-[var(--mu)]">{s.code}</span></p>
      <div className="my-2.5"><Bar parts={[{ pct: (s.reserved / s.onHand) * 100, color: "var(--am)" }, { pct: (atp(s) / s.onHand) * 100, color: "var(--gr)" }]} /></div>
      <div className="grid grid-cols-3 gap-2">{cell("On-Hand", s.onHand)}{cell("Reserved", s.reserved, "var(--am)")}{cell("ATP", atp(s), "var(--gr)")}</div>
    </div>
  );
}

export function AtpWidget({ all = false }: { all?: boolean }) {
  const { skus, act } = useDemo();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(skus[0].code);
  const [count, setCount] = useState("");
  const sku = skus.find((s) => s.code === code)!;
  const diff = count === "" ? null : Number(count) - sku.onHand;

  const save = () => {
    if (count === "" || Number(count) < 0) return;
    act({ type: "adjust", code, count: Number(count) });
    setCount("");
  };

  return (
    <div data-tour="atp">
      <Panel title="Available-to-Promise" icon={<DIcon name="box" />}>
        {(all ? skus : skus.slice(0, 2)).map((s) => <SkuMeter key={s.code} s={s} />)}
        <div className="space-y-3 border-t border-[var(--bd)] p-4">
          {open ? (
            <>
              <label className="block text-sm font-semibold">SKU
                <select className={`${INPUT} mt-1`} value={code} onChange={(e) => setCode(e.target.value)}>
                  {skus.map((s) => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
              </label>
              <p className="text-sm text-[var(--mu)]">Bin {sku.bin} · stok sistem <b className="text-[var(--tx)]">{nf(sku.onHand)} {sku.uom}</b>, reservasi {nf(sku.reserved)}</p>
              <label className="block text-sm font-semibold">Jumlah hitung fisik
                <input className={`${INPUT} mt-1`} type="number" min={0} placeholder="mis. 492" value={count} onChange={(e) => setCount(e.target.value)} />
              </label>
              <p className="min-h-5 text-sm text-[var(--mu)]">{diff !== null && `Selisih: ${diff > 0 ? "+" : ""}${diff} ${sku.uom}`}</p>
              <div className="flex gap-2"><button className={`${BTN_PRIMARY} flex-1`} onClick={save}>Simpan penyesuaian</button><button className={BTN} onClick={() => setOpen(false)}>Batal</button></div>
              <p className="font-mono text-xs text-[var(--mu)]">POST /api/v1/inventory/adjustments</p>
            </>
          ) : (
            <button className={`${BTN_PRIMARY} w-full`} onClick={() => setOpen(true)}>Cycle count / sesuaikan stok</button>
          )}
          {!all && <Link href="/demo/inventory" className="block text-center text-sm text-[var(--mu)] underline underline-offset-2">Lihat semua SKU</Link>}
        </div>
      </Panel>
    </div>
  );
}
