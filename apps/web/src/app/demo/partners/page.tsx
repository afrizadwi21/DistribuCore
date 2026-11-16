"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/components/demo/DemoContext";
import { outstanding, rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { Badge, Bar, DemoTag, Panel, TD, TH } from "@/components/demo/ui";

export default function PartnersPage() {
  const { locale } = useLanguage();
  const { mode } = useAuth();
  const isEn = locale === "en";
  const { invoices, customers = [] } = useDemo();
  const isReal = mode === "real";

  const custHeaders = isEn
    ? ["Code", "Company", "Credit Limit", "Outstanding", "Utilization", "Terms", "Status"]
    : ["Kode", "Perusahaan", "Limit Kredit", "Terutang", "Pemakaian", "Termin", "Status"];

  const suppHeaders = isEn
    ? ["Supplier Code", "Company Name", "Contact Person", "Payment Terms", "Status"]
    : ["Kode Pemasok", "Nama Perusahaan", "Kontak Person", "Termin Pembayaran", "Status"];

  return (
    <div className="grid gap-5">
      <Panel
        data-tour="credit"
        title={isEn ? "B2B Customers & Credit Limit Profiles" : "Pelanggan B2B & Profil Limit Kredit"}
        icon={<DIcon name="users" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{custHeaders.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const outst = outstanding(invoices, c.code);
                const pct = c.limit > 0 ? Math.round((outst / c.limit) * 100) : 0;
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
                    <td className={TD}>Net {c.terms} {isEn ? "days" : "hari"}</td>
                    <td className={TD}><Badge tone={c.hold ? "r" : "g"}>{c.hold ? "CREDIT HOLD" : (isEn ? "ACTIVE" : "AKTIF")}</Badge></td>
                  </tr>
                );
              })}
              {!customers.length && (
                <tr>
                  <td colSpan={7} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                    {isEn ? "No customer accounts registered for this tenant yet." : "Belum ada pelanggan B2B terdaftar untuk perusahaan ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={isEn ? "Strategic Suppliers" : "Pemasok Utama (Suppliers)"} icon={<DIcon name="inbox" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{suppHeaders.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {isReal ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                    {isEn ? "No strategic suppliers registered yet." : "Belum ada pemasok terdaftar untuk perusahaan ini."}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className={`${TD} font-mono font-bold`}>SUPP-SG</td>
                  <td className={TD}><b>PT Semen Gresik Tbk</b></td>
                  <td className={TD}>Agus Hendrawan (Key Account Manager)</td>
                  <td className={TD}>Net 45 {isEn ? "days" : "hari"}</td>
                  <td className={TD}><Badge tone="g">{isEn ? "STRATEGIC PARTNER" : "MITRA STRATEGIS"}</Badge></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
