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
    const sObj = skus.find((s) => s.code === (skuCode || skus[0]?.code));
    const unitPrice = sObj?.price || 75000;
    const total = (Number(qty) || 1) * unitPrice;
    const newId = `SO-2026-${String(orders.length + 1).padStart(3, "0")}`;
    act({
      type: "set_real_data",
      data: {
        orders: [{ id: newId, cust: cCode, total, hold: false, demo: false }, ...orders],
      },
    });
    act({ type: "notify", message: isEn ? `Sales Order ${newId} created` : `Pesanan Penjualan ${newId} berhasil dibuat` });
  };

  return (
    <div className="grid gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-[var(--mu)]">
        <span className="flex items-center gap-2">
          <DIcon name="cart" />
          <span>
            <b>Order-to-Cash:</b>{" "}
            {isEn
              ? "Approved orders automatically lock Available-to-Promise (ATP) stock."
              : "Pesanan dengan limit kredit aman langsung mengunci alokasi stok (ATP)."}
          </span>
        </span>
        <span className="text-xs">
          Multi-tenant · {isReal ? (tenant?.name || tenant?.code || "Sesi Nyata") : "SBA Cabang Cikarang"}
        </span>
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
