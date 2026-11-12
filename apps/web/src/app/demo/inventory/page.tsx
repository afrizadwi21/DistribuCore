"use client";

import { AtpWidget } from "@/components/demo/AtpWidget";
import { useDemo } from "@/components/demo/DemoContext";
import { atp, health, nf } from "@/components/demo/calc";
import { BINS } from "@/components/demo/data";
import { DIcon } from "@/components/demo/icons";
import { Card, HealthBadge, Panel, TD, TH } from "@/components/demo/ui";

export default function InventoryPage() {
  const { skus } = useDemo();

  return (
    <div className="grid gap-5">
      <Panel title="Saldo stok · Gudang Pusat Cikarang (WH-CKR)" icon={<DIcon name="box" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["Bin", "Zona", "SKU", "On-Hand", "Reserved", "ATP", "Safety / Titik Pesan", "Kesehatan"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {skus.map((s) => {
                const h = health(s);
                return (
                  <tr key={s.code}>
                    <td className={`${TD} font-mono font-semibold`}>{s.bin}</td>
                    <td className={TD}>{BINS[s.bin] || "-"}</td>
                    <td className={`${TD} font-bold`}>{s.code}</td>
                    <td className={TD}>{nf(s.onHand)} {s.uom}</td>
                    <td className={TD}>{nf(s.reserved)}</td>
                    <td className={`${TD} font-bold text-emerald-700 dark:text-emerald-400`}>{nf(atp(s))}</td>
                    <td className={TD}>{s.safety} / {s.reorder}</td>
                    <td className={TD}><HealthBadge h={h} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold">Formula ATP = Stok Fisik − Reservasi Aktif</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--mu)]">
            Mesin reservasi otomatis menolak pesanan penjualan yang kuantitasnya melebihi ATP. Hal ini menjamin tidak ada alokasi ganda (double-booking) saat pesanan masuk secara bersamaan dari berbagai saluran penjualan atau cabang distributor.
          </p>
        </Card>
        <AtpWidget />
      </div>
    </div>
  );
}
