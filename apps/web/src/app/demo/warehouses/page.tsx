"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { nf } from "@/components/demo/calc";
import { BINS } from "@/components/demo/data";
import { Badge, Bar, BTN, Card, DemoTag } from "@/components/demo/ui";

export default function WarehousesPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { skus } = useDemo();

  const branches = [
    { code: "WH-SBY", name: isEn ? "Surabaya Branch Warehouse" : "Gudang Cabang Surabaya", occ: 64 },
    { code: "WH-MDN", name: isEn ? "Medan Branch Warehouse" : "Gudang Cabang Medan", occ: 51 },
  ];

  return (
    <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
      <Card data-tour="bins" className="p-5 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">{isEn ? "Cikarang Central Warehouse" : "Gudang Pusat Cikarang"}</h3>
            <span className="font-mono text-xs text-[var(--mu)]">
              {isEn ? "WH-CKR · Primary Distribution Hub" : "WH-CKR · Hub Distribusi Utama"}
            </span>
          </div>
          <Badge tone="g">{isEn ? "ACTIVE · PRIMARY" : "AKTIF · INDUK"}</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(BINS).map(([bin, zone]) => {
            const items = skus.filter((s) => s.bin === bin);
            return (
              <div key={bin} className="rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{bin}</span>
                  <span className="text-xs text-[var(--mu)]">{zone}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-[var(--tx)]">
                  {items.map((s) => `${s.code}: ${nf(s.onHand)} ${s.uom}`).join(" · ")}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Link href="/demo/inventory" className={BTN}>
            {isEn ? "Open Warehouse Stock Balances & ATP →" : "Buka Saldo Stok Gudang & ATP →"}
          </Link>
        </div>
      </Card>

      {branches.map((b) => (
        <Card key={b.code} className="p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">{b.name}</h4>
            <DemoTag show={true} />
          </div>
          <div className="font-mono text-xs text-[var(--mu)]">{b.code} · {isEn ? "Regional Hub" : "Hub Regional"}</div>
          <div className="mt-4">
            <Bar parts={[{ pct: b.occ, color: "var(--bl)" }]} />
            <div className="mt-2 text-xs text-[var(--mu)]">{isEn ? "Space Occupancy:" : "Tingkat Okupansi Ruang:"} <b>{b.occ}%</b></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
