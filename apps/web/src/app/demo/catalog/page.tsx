"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, DemoTag, INP, Panel, TD, TH } from "@/components/demo/ui";

const UOM_NAMES: Record<string, string> = {
  SAK: "Sak 50 Kilogram",
  BTG: "Batang 12 Meter",
  PAIL: "Pail 20 Liter",
  DUS: "Dus Karton",
  UNIT: "Unit Barang",
};

export default function CatalogPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { skus, refresh, act } = useDemo();
  const { mode, token, role, can } = useAuth();
  const isReal = mode === "real";
  const canEdit = can("catalog");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [uom, setUom] = useState("SAK");
  const [safety, setSafety] = useState("50");
  const [reorder, setReorder] = useState("100");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !token) return;
    const res = await fetch("/api/proxy/v1/catalog/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        uom_code: uom.trim().toUpperCase(),
        safety_stock_quantity: Number(safety) || 0,
        reorder_point_quantity: Number(reorder) || 0,
      }),
    });
    if (res.ok) {
      setSku(""); setName("");
      refresh();
      act({ type: "notify", message: isEn ? "Product added to catalog" : "Produk berhasil ditambahkan ke katalog" });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !token) return;
    await fetch(`/api/proxy/v1/catalog/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    refresh();
    act({ type: "notify", message: isEn ? "Product removed" : "Produk dihapus dari katalog" });
  };

  const headers = isEn
    ? ["SKU Code", "Product Name", "Base UoM", "Safety Stock", "Reorder Point", "Selling Price", ...(isReal && canEdit ? ["Action"] : [])]
    : ["Kode SKU", "Nama Produk", "Satuan Dasar", "Safety Stock", "Titik Pesan Ulang", "Harga Jual", ...(isReal && canEdit ? ["Aksi"] : [])];

  return (
    <div className="grid gap-5">
      {isReal && canEdit && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">{isEn ? "Add Master Product SKU" : "Tambah Produk Baru (Master SKU)"}</h4>
            <Badge tone="b">{role}</Badge>
          </div>
          <form onSubmit={handleCreate} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input required placeholder="Kode SKU (mis. SMN-01)" value={sku} onChange={(e) => setSku(e.target.value)} className={INP} />
            <input required placeholder={isEn ? "Product Name" : "Nama Produk"} value={name} onChange={(e) => setName(e.target.value)} className={`${INP} lg:col-span-2`} />
            <select value={uom} onChange={(e) => setUom(e.target.value)} className={INP}>
              {Object.keys(UOM_NAMES).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" placeholder="Safety Stock" value={safety} onChange={(e) => setSafety(e.target.value)} className={INP} />
            <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
              {isEn ? "Add SKU" : "Tambah SKU"}
            </button>
          </form>
        </Card>
      )}
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
                  {isReal && canEdit && (
                    <td className={TD}>
                      <button onClick={() => handleDelete(s.id)} className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/20">
                        {isEn ? "Delete" : "Hapus"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!skus.length && (
                <tr>
                  <td colSpan={headers.length} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                    {isEn ? "No products found in catalog for this tenant." : "Belum ada produk terdaftar di katalog perusahaan ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
