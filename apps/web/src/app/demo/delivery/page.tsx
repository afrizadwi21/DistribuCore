"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { DO_LABEL } from "@/components/demo/SalesTable";
import { CUSTOMERS, ORDERS } from "@/components/demo/data";
import { Badge, BTN, Card, TD, TH } from "@/components/demo/ui";

export default function DeliveryPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { dos, skus, act } = useDemo();
  const sku = (code: string) => skus.find((s) => s.code === code)!;
  const custName = (soId: string) => {
    const o = ORDERS.find((q) => q.id === soId);
    return o ? CUSTOMERS.find((c) => c.code === o.cust)?.name : "-";
  };

  const headers = isEn
    ? ["DO #", "Order", "Customer", "Item", "Status", "Action"]
    : ["No. DO", "Pesanan", "Pelanggan", "Barang", "Status", "Aksi"];

  return (
    <div className="grid gap-5">
      <Card data-tour="deliveries" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{headers.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
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
                        <button className={`${BTN} bg-emerald-600! text-white!`} onClick={() => act({ type: "pod", id: d.id })}>
                          {isEn ? "Confirm POD" : "Konfirmasi POD"}
                        </button>
                      ) : isPod ? (
                        d.invoiced ? <Badge tone="g">{isEn ? "Invoiced" : "Faktur terbit"}</Badge> : (
                          <button className={BTN} onClick={() => act({ type: "invoice", id: d.id })}>
                            {isEn ? "Issue invoice" : "Terbitkan faktur"}
                          </button>
                        )
                      ) : (
                        <button className={`${BTN} bg-sky-600! text-white!`} onClick={() => act({ type: "dispatch", id: d.id })}>
                          {isEn ? "Dispatch truck" : "Kirim truk"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-[var(--mu)] leading-relaxed">
        <strong>{isEn ? "Delivery Instructions:" : "Instruksi Pengiriman:"}</strong>{" "}
        {isEn
          ? "Click Dispatch truck when vehicle departs. Click Confirm POD when customer signs receipt (deducts warehouse inventory and releases reservation). Once POD is verified, click Issue invoice to route invoice to Accounts Receivable (AR)."
          : "Klik Kirim truk saat armada berangkat. Klik Konfirmasi POD saat barang diterima pelanggan (stok fisik gudang berkurang dan reservasi dilepas). Setelah POD terverifikasi, klik Terbitkan faktur untuk mengirim tagihan ke modul Piutang (AR)."}
      </p>
    </div>
  );
}
