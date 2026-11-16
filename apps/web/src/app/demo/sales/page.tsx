"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { SalesTable } from "@/components/demo/SalesTable";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, INP } from "@/components/demo/ui";

export default function SalesPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { mode, tenant, role, can } = useAuth();
  const { customers = [], skus = [], orders = [], act } = useDemo();
  const isReal = mode === "real";
  const canCreate = can("sales");

  const [cust, setCust] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [qty, setQty] = useState("10");

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cCode = cust || customers[0]?.code || "CUST-01";
    const sCode = skuCode || skus[0]?.code || "";
    act({ type: "create_so", cust: cCode, sku: sCode, qty: Number(qty) || 1 });
  };

  return (
    <div className="grid gap-5">
      <Card className="p-4 text-xs leading-relaxed text-[var(--mu)]">
        <p className="max-w-[75ch]">
          <b className="text-[var(--tx)]">{isEn ? "End-to-End Order-to-Cash Flow:" : "Alur Kerja Penjualan (Order-to-Cash):"}</b>{" "}
          {isEn
            ? "1. Create Sales Order (SO) here → 2. System locks ATP stock & automatically generates a Delivery Order (DO) in Delivery & POD menu → 3. Dispatch truck & confirm POD → 4. Issue Invoice & record payment."
            : "1. Buat Pesanan Penjualan (SO) di halaman ini → 2. Sistem otomatis mengunci stok ATP & menerbitkan Surat Jalan (DO) ke menu Pengiriman & POD → 3. Kirim truk & konfirmasi POD → 4. Terbitkan Faktur & catat pelunasan."}
        </p>
      </Card>

      {isReal && canCreate && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{isEn ? "Create New Sales Order (SO)" : "Buat Pesanan Penjualan Baru (SO)"}</h2>
            <Badge tone="b">{role}</Badge>
          </div>
          <form onSubmit={handleCreateOrder} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={cust} onChange={(e) => setCust(e.target.value)} className={INP}>
              <option value="">{isEn ? "-- Select Customer --" : "-- Pilih Pelanggan --"}</option>
              {customers.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
            </select>
            <select value={skuCode} onChange={(e) => setSkuCode(e.target.value)} className={INP}>
              <option value="">{isEn ? "-- Select Product SKU --" : "-- Pilih Produk SKU --"}</option>
              {skus.map((s) => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
            </select>
            <input type="number" min={1} placeholder={isEn ? "Quantity" : "Kuantitas"} value={qty} onChange={(e) => setQty(e.target.value)} className={INP} />
            <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
              {isEn ? "Create Order" : "Buat Pesanan"}
            </button>
          </form>
        </Card>
      )}

      <SalesTable />
    </div>
  );
}
