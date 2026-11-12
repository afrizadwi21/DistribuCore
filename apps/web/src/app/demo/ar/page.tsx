"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { nf, outstanding, overdue, rp } from "@/components/demo/calc";
import { CUSTOMERS } from "@/components/demo/data";
import { DIcon } from "@/components/demo/icons";
import { BTN, Card, Panel, TD, TH } from "@/components/demo/ui";

const BUCKETS = ["Current", "1-30", "31-60", "61-90", ">90"] as const;
const BUCKET_COLORS: Record<string, string> = {
  Current: "var(--gr)",
  "1-30": "var(--am)",
  "31-60": "var(--rd)",
  "61-90": "var(--rd)",
  ">90": "var(--rd)",
};

export default function ArAgingPage() {
  const { invoices, act } = useDemo();
  const od = overdue(invoices);
  const totalAr = invoices.reduce((acc, i) => acc + i.open, 0);
  const openCount = invoices.filter((i) => i.open > 0).length;

  const bucketSums = BUCKETS.map((b) => invoices.filter((i) => i.bucket === b).reduce((acc, i) => acc + i.open, 0));
  const maxBucket = Math.max(...bucketSums, 1);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-rose-500/30 p-5">
          <span className="text-xs uppercase tracking-wider text-[var(--mu)]">Lewat Jatuh Tempo &gt; 30 Hari</span>
          <div className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-400">{rp(od)}</div>
          <span className="text-xs text-[var(--mu)]">Mencakup bucket 31–60, 61–90, dan &gt;90 hari</span>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase tracking-wider text-[var(--mu)]">Total Piutang Berjalan</span>
          <div className="mt-1 text-2xl font-black">{rp(totalAr)}</div>
          <span className="text-xs text-[var(--mu)]">{openCount} faktur belum lunas</span>
        </Card>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel data-tour="aging" title="Distribusi Umur Piutang (Rp Juta)" icon={<DIcon name="cash" />}>
          <div className="grid h-48 grid-cols-5 items-end gap-3 p-4">
            {BUCKETS.map((b, i) => {
              const val = bucketSums[i];
              const heightPct = Math.max(4, Math.round((val / maxBucket) * 100));
              return (
                <div key={b} className="flex h-full flex-col items-center justify-end gap-2 text-center">
                  <span className="font-mono text-xs font-semibold">{nf(Math.round(val / 1e6))}</span>
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${heightPct}%`, backgroundColor: BUCKET_COLORS[b] }} />
                  <span className="text-[11px] font-medium text-[var(--mu)]">{b}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Eksposur per Pelanggan" icon={<DIcon name="users" />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{["Pelanggan", "Terutang", "Aksi"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {CUSTOMERS.filter((c) => outstanding(invoices, c.code) > 0).map((c) => {
                  const outst = outstanding(invoices, c.code);
                  return (
                    <tr key={c.code}>
                      <td className={`${TD} font-semibold`}>{c.name}</td>
                      <td className={`${TD} font-bold text-rose-700 dark:text-rose-400`}>{rp(outst)}</td>
                      <td className={TD}>
                        <button className={BTN} onClick={() => act({ type: "notify", message: `Pengingat tagihan resmi berhasil dikirim ke ${c.name}` })}>
                          Kirim Pengingat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <p className="text-xs text-[var(--mu)] leading-relaxed">
        <strong>Instruksi Piutang:</strong> Pantau grafik umur piutang per kelompok hari. Klik <b>Kirim Pengingat</b> pada pelanggan yang memiliki tunggakan terbesar untuk mengirimkan pemberitahuan tagihan resmi.
      </p>
    </div>
  );
}
