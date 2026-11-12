"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { CUSTOMERS } from "@/components/demo/data";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, DemoTag, Panel, TD, TH } from "@/components/demo/ui";

export default function InvoicesPage() {
  const { invoices, act } = useDemo();
  const custName = (code: string) => CUSTOMERS.find((c) => c.code === code)?.name || code;

  return (
    <div className="grid gap-5">
      <Panel title="Daftar Faktur Penjualan (Accounts Receivable)" icon={<DIcon name="doc" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["No. Faktur", "Pelanggan", "Pesanan", "Terbit", "Jatuh Tempo", "Total", "Sisa Tagihan", "Aging"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map((v) => {
                const tone = v.bucket === "Current" || v.bucket === "Lunas" ? "g" : v.bucket === "1-30" ? "a" : "r";
                return (
                  <tr key={v.no}>
                    <td className={`${TD} font-bold`}>{v.no} <DemoTag show={v.demo} /></td>
                    <td className={TD}>{custName(v.cust)}</td>
                    <td className={TD}>{v.so}</td>
                    <td className={TD}>{v.issued}</td>
                    <td className={TD}>{v.due}</td>
                    <td className={TD}>{rp(v.total)}</td>
                    <td className={`${TD} font-semibold ${v.rem === 0 ? "text-emerald-700 dark:text-emerald-400" : ""}`}>{rp(v.rem)}</td>
                    <td className={TD}><Badge tone={tone}>{v.bucket}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex-1 text-sm text-[var(--mu)]">
          Catat penerimaan kas / transfer bank dan alokasikan secara otomatis ke faktur tertua pelanggan (FIFO).
        </span>
        <button className={`${BTN} bg-emerald-600! text-white!`} onClick={() => act({ type: "pay" })}>
          Catat Pembayaran Masuk Rp 7.500.000
        </button>
      </Card>
    </div>
  );
}
