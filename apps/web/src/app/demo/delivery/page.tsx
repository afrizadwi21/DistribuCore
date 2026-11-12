"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { DO_LABEL } from "@/components/demo/SalesTable";
import { CUSTOMERS, ORDERS } from "@/components/demo/data";
import { Badge, BTN, Card, TD, TH } from "@/components/demo/ui";

export default function DeliveryPage() {
  const { dos, skus, act } = useDemo();
  const sku = (code: string) => skus.find((s) => s.code === code)!;
  const custName = (soId: string) => {
    const o = ORDERS.find((q) => q.id === soId);
    return o ? CUSTOMERS.find((c) => c.code === o.cust)?.name : "-";
  };

  return (
    <div className="grid gap-5">
      <Card data-tour="deliveries" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["No. DO", "Pesanan", "Pelanggan", "Barang", "Status", "Aksi"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {dos.map((d) => {
                const s = sku(d.sku);
                const isTransit = d.status === "transit";
                const isPod = d.status === "pod";
                return (
                  <tr key={d.id}>
                    <td className={`${TD} font-bold`}>{d.id}</td>
                    <td className={TD}>{d.so}</td>
                    <td className={TD}>{custName(d.so)}</td>
                    <td className={TD}>{s.name} × {d.qty} {s.uom}</td>
                    <td className={TD}><Badge tone={DO_LABEL[d.status][1]}>{DO_LABEL[d.status][0]}</Badge></td>
                    <td className={TD}>
                      {isTransit ? (
                        <button className={`${BTN} bg-emerald-600! text-white!`} onClick={() => act({ type: "pod", id: d.id })}>Konfirmasi POD</button>
                      ) : isPod ? (
                        d.invoiced ? <Badge tone="g">Faktur terbit</Badge> : <button className={BTN} onClick={() => act({ type: "invoice", id: d.id })}>Terbitkan faktur</button>
                      ) : (
                        <button className={`${BTN} bg-sky-600! text-white!`} onClick={() => act({ type: "dispatch", id: d.id })}>Kirim truk</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-[var(--mu)]">
        💡 Konfirmasi POD melepas reservasi dan memotong saldo fisik; faktur resmi otomatis dapat diterbitkan dari DO yang telah diverifikasi penerimaannya.
      </p>
    </div>
  );
}
