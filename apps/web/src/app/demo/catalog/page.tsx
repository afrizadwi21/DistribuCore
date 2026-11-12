"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { DemoTag, Panel, TD, TH } from "@/components/demo/ui";

const UOM_NAMES: Record<string, string> = {
  SAK: "Sak 50 Kilogram",
  BTG: "Batang 12 Meter",
  PAIL: "Pail 20 Liter",
  DUS: "Dus Karton",
};

export default function CatalogPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { skus } = useDemo();

  const headers = isEn
    ? ["SKU Code", "Product Name", "Base UoM", "Safety Stock", "Reorder Point", "Selling Price"]
    : ["Kode SKU", "Nama Produk", "Satuan Dasar", "Safety Stock", "Titik Pesan Ulang", "Harga Jual"];

  return (
    <div className="grid gap-5">
      <Panel data-tour="catalog" title={isEn ? "Product Catalog & Master SKUs" : "Katalog Produk & Master SKU"} icon={<DIcon name="tag" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{headers.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {skus.map((s) => (
                <tr key={s.code}>
                  <td className={`${TD} font-mono font-bold`}>{s.code}</td>
                  <td className={TD}>{s.name} <DemoTag show={s.demo} /></td>
                  <td className={TD}>{s.uom} <span className="text-xs text-[var(--mu)]">({UOM_NAMES[s.uom] || s.uom})</span></td>
                  <td className={TD}>{s.safety}</td>
                  <td className={TD}>{s.reorder}</td>
                  <td className={`${TD} font-semibold`}>{rp(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="text-xs leading-relaxed text-[var(--mu)]">
        {isEn
          ? "Note: Master SKU records integrate with tiered pricing matrices and automated safety buffers. Standard UoMs and base prices correspond with the Go Fiber backend seed dataset (000002_seed_demo_data.sql)."
          : "Catatan: Data master SKU diintegrasikan dengan modul penetapan harga bertingkat (tier pricing) dan buffer keselamatan otomatis. Nilai satuan dan harga di atas sesuai dengan dataset migrasi backend Go Fiber (000002_seed_demo_data.sql)."}
      </p>
    </div>
  );
}
