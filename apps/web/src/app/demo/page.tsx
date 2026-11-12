"use client";

import { AtpWidget } from "@/components/demo/AtpWidget";
import { useDemo } from "@/components/demo/DemoContext";
import { Kpis } from "@/components/demo/Kpis";
import { SalesTable } from "@/components/demo/SalesTable";
import { DIcon } from "@/components/demo/icons";
import { HealthBadge, Panel, TD, TH } from "@/components/demo/ui";
import { health, nf } from "@/components/demo/calc";

export default function DashboardPage() {
  const { skus } = useDemo();
  return (
    <>
      <Kpis />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid min-w-0 gap-5">
          <SalesTable limit={4} />
          <Panel title="Kesehatan stok (inventory-health)" icon={<DIcon name="box" />}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr>{["SKU", "On-Hand", "Safety", "Titik pesan", "Status"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
                <tbody>{skus.map((s) => (
                  <tr key={s.code}>
                    <td className={`${TD} font-bold`}>{s.code}</td><td className={TD}>{nf(s.onHand)} {s.uom}</td>
                    <td className={TD}>{s.safety}</td><td className={TD}>{s.reorder}</td><td className={TD}><HealthBadge h={health(s)} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
        </div>
        <AtpWidget />
      </div>
    </>
  );
}
