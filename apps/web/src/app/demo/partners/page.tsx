"use client";

import { useDemo } from "@/components/demo/DemoContext";
import { outstanding, rp } from "@/components/demo/calc";
import { CUSTOMERS } from "@/components/demo/data";
import { DIcon } from "@/components/demo/icons";
import { Badge, Bar, DemoTag, Panel, TD, TH } from "@/components/demo/ui";

export default function PartnersPage() {
  const { invoices } = useDemo();

  return (
    <div className="grid gap-5">
      <Panel data-tour="credit" title="Pelanggan B2B & Profil Limit Kredit" icon={<DIcon name="users" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["Kode", "Perusahaan", "Limit Kredit", "Terutang", "Pemakaian", "Termin", "Status"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c) => {
                const outst = outstanding(invoices, c.code);
                const pct = Math.round((outst / c.limit) * 100);
                const barColor = pct > 90 ? "var(--rd)" : pct > 60 ? "var(--am)" : "var(--gr)";
                return (
                  <tr key={c.code}>
                    <td className={`${TD} font-mono font-bold`}>{c.code}</td>
                    <td className={TD}><b>{c.name}</b> <DemoTag show={c.demo} /></td>
                    <td className={TD}>{rp(c.limit)}</td>
                    <td className={`${TD} font-semibold`}>{rp(outst)}</td>
                    <td className={`${TD} w-32`}>
                      <Bar parts={[{ pct: Math.min(100, pct), color: barColor }]} />
                      <span className="text-[11px] text-[var(--mu)]">{pct}%</span>
                    </td>
                    <td className={TD}>Net {c.terms} hari</td>
                    <td className={TD}><Badge tone={c.hold ? "r" : "g"}>{c.hold ? "CREDIT HOLD" : "AKTIF"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Pemasok Utama (Suppliers)" icon={<DIcon name="inbox" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{["Kode Pemasok", "Nama Perusahaan", "Kontak Person", "Termin Pembayaran", "Status"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${TD} font-mono font-bold`}>SUPP-SG</td>
                <td className={TD}><b>PT Semen Gresik Tbk</b></td>
                <td className={TD}>Agus Hendrawan (Key Account Manager)</td>
                <td className={TD}>Net 45 hari</td>
                <td className={TD}><Badge tone="g">MITRA STRATEGIS</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
