"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { CUSTOMERS } from "@/components/demo/data";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, DemoTag, Panel, TD, TH } from "@/components/demo/ui";

export default function InvoicesPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { invoices, act } = useDemo();
  const custName = (code: string) => CUSTOMERS.find((c) => c.code === code)?.name || code;

  const headers = isEn
    ? ["Invoice #", "Customer", "Order", "Issued", "Due Date", "Total", "Balance Due", "Aging"]
    : ["No. Faktur", "Pelanggan", "Pesanan", "Terbit", "Jatuh Tempo", "Total", "Sisa Tagihan", "Aging"];

  return (
    <div className="grid gap-5">
      <Panel title={isEn ? "Sales Invoices (Accounts Receivable)" : "Daftar Faktur Penjualan (Accounts Receivable)"} icon={<DIcon name="doc" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{headers.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
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
                    <td className={TD}>{v.total ? rp(v.total) : "-"}</td>
                    <td className={`${TD} font-semibold ${v.open === 0 ? "text-emerald-700 dark:text-emerald-400" : ""}`}>{rp(v.open)}</td>
                    <td className={TD}><Badge tone={tone}>{v.bucket}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Card data-tour="pay" className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex-1 text-sm text-[var(--mu)]">
          <strong>{isEn ? "Payment Instructions:" : "Instruksi Pembayaran:"}</strong>{" "}
          {isEn
            ? "Click button to record cash or wire transfer receipt. System automatically settles customer's oldest invoice (FIFO method) and reduces active credit exposure."
            : "Klik tombol untuk mencatat penerimaan kas atau transfer. Sistem otomatis mengalokasikan dana lunas ke faktur tertua pelanggan (metode FIFO) dan mengurangi total eksposur piutang."}
        </span>
        <button className={`${BTN} bg-emerald-600! text-white!`} onClick={() => act({ type: "pay" })}>
          {isEn ? "Record Payment Rp 7,500,000" : "Catat Pembayaran Masuk Rp 7.500.000"}
        </button>
      </Card>
    </div>
  );
}
