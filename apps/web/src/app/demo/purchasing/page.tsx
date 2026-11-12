"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, Panel, TD, TH } from "@/components/demo/ui";

export default function PurchasingPage() {
  const { po, skus, act } = useDemo();
  const s = skus.find((x) => x.code === po.sku)!;
  const st = po.rec === 0 ? "ISSUED" : po.rec < po.qty ? "PARTIALLY_RECEIVED" : "RECEIVED";
  const remaining = po.qty - po.rec;

  return (
    <div className="grid gap-5">
      <Panel title="Purchase Order (P2P Procurement)" icon={<DIcon name="inbox" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["No. PO", "Pemasok", "Terbit", "Estimasi Tiba", "Barang", "Diterima", "Total Biaya", "Status"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${TD} font-bold`}>{po.no}</td>
                <td className={TD}>{po.sup}</td>
                <td className={TD}>{po.issued}</td>
                <td className={TD}>{po.eta}</td>
                <td className={TD}>{s.name} × {po.qty} {s.uom}</td>
                <td className={`${TD} font-semibold`}>{po.rec} / {po.qty}</td>
                <td className={TD}>{rp(po.qty * po.cost)}</td>
                <td className={TD}><Badge tone={st === "RECEIVED" ? "g" : "b"}>{st}</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex-1 text-sm text-[var(--mu)]">
          Catat penerimaan barang (Goods Receipt Note / GRN). Saldo stok langsung bertambah di Bin <b>{s.bin}</b>.
        </span>
        <button disabled={remaining <= 0} className={`${BTN} bg-emerald-600! text-white! disabled:opacity-40`} onClick={() => act({ type: "grn", qty: 250 })}>
          Terima 250 SAK
        </button>
        <button disabled={remaining <= 0} className={`${BTN} disabled:opacity-40`} onClick={() => act({ type: "grn", qty: remaining })}>
          Terima Semua Sisa ({remaining} {s.uom})
        </button>
      </Card>
      <Panel title="Bukti Penerimaan Barang Fisik (GRN)" icon={<DIcon name="doc" />}>
        {po.grn.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{["No. GRN", "Referensi PO", "Kuantitas Diterima", "Tanggal Masuk"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {po.grn.map(([no, qty]) => (
                  <tr key={no}>
                    <td className={`${TD} font-bold`}>{no}</td>
                    <td className={TD}>{po.no}</td>
                    <td className={`${TD} font-bold text-emerald-700 dark:text-emerald-400`}>+{qty} {s.uom}</td>
                    <td className={TD}>11 Nov 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-4 text-sm text-[var(--mu)]">Belum ada GRN yang diterbitkan untuk PO ini.</p>
        )}
      </Panel>
    </div>
  );
}
