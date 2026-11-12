"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, Panel, TD, TH } from "@/components/demo/ui";

export default function PurchasingPage() {
  const { po, skus, grns, act } = useDemo();
  const s = skus.find((x) => x.code === po.sku)!;
  const st = po.received === 0 ? "ISSUED" : po.received < po.qty ? "PARTIALLY_RECEIVED" : "RECEIVED";
  const remaining = po.qty - po.received;

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
                <td className={TD}>{po.supplier}</td>
                <td className={TD}>{po.issued}</td>
                <td className={TD}>{po.eta}</td>
                <td className={TD}>{s.name} × {po.qty} {s.uom}</td>
                <td className={`${TD} font-semibold`}>{po.received} / {po.qty}</td>
                <td className={TD}>{rp(po.qty * po.cost)}</td>
                <td className={TD}><Badge tone={st === "RECEIVED" ? "g" : "b"}>{st}</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Card data-tour="grn-actions" className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex-1 text-sm text-[var(--mu)]">
          <strong>Instruksi Penerimaan:</strong> Klik tombol untuk menerbitkan dokumen GRN. Kuantitas barang otomatis masuk ke Bin <b>{s.bin}</b> dan menaikkan saldo ATP.
        </span>
        <button disabled={remaining <= 0} className={`${BTN} bg-emerald-600! text-white! disabled:opacity-40`} onClick={() => act({ type: "grn", qty: 250 })}>
          Terima 250 SAK
        </button>
        <button disabled={remaining <= 0} className={`${BTN} disabled:opacity-40`} onClick={() => act({ type: "grn", qty: remaining })}>
          Terima Semua Sisa ({remaining} {s.uom})
        </button>
      </Card>
      <Panel title="Bukti Penerimaan Barang Fisik (GRN)" icon={<DIcon name="doc" />}>
        {grns.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{["No. GRN", "Referensi PO", "Kuantitas Diterima", "Tanggal Masuk"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {grns.map((g) => (
                  <tr key={g.no}>
                    <td className={`${TD} font-bold`}>{g.no}</td>
                    <td className={TD}>{po.no}</td>
                    <td className={`${TD} font-bold text-emerald-700 dark:text-emerald-400`}>+{g.qty} {s.uom}</td>
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
