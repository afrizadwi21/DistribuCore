"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/components/demo/DemoContext";
import { rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { openWhatsApp } from "@/components/demo/wa";
import { Badge, BTN, Card, INP, Panel, TD, TH } from "@/components/demo/ui";

export default function PurchasingPage() {
  const { locale } = useLanguage();
  const { mode, role, can } = useAuth();
  const isEn = locale === "en";
  const { po, skus, grns, act } = useDemo();
  const isReal = mode === "real";
  const canEdit = can("warehouse");
  const hasPo = po && po.no !== "-";
  const s = skus.find((x) => x.code === po.sku) || { name: po.sku || "-", uom: "UNIT", bin: "WH-MAIN" };
  const st = po.received === 0 ? "ISSUED" : po.received < po.qty ? "PARTIALLY_RECEIVED" : "RECEIVED";
  const remaining = po.qty - po.received;

  const [supp, setSupp] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [qty, setQty] = useState("200");
  const [cost, setCost] = useState("65000");

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSku = skuCode || skus[0]?.code || "SKU-01";
    act({
      type: "set_real_data",
      data: {
        po: {
          no: "PO-2026-001",
          supplier: supp.trim() || "Pemasok Utama",
          code: "SUPP-01",
          contact: "-",
          terms: 30,
          issued: "16 Nov 2026",
          eta: "23 Nov 2026",
          sku: targetSku,
          qty: Number(qty) || 100,
          received: 0,
          cost: Number(cost) || 50000,
        },
      },
    });
    act({ type: "notify", message: isEn ? "Purchase Order PO-2026-001 issued" : "Purchase Order PO-2026-001 berhasil diterbitkan" });
  };

  const poHeaders = isEn
    ? ["PO #", "Supplier", "Issued", "ETA", "Item", "Received", "Total Cost", "Status"]
    : ["No. PO", "Pemasok", "Terbit", "Estimasi Tiba", "Barang", "Diterima", "Total Biaya", "Status"];

  const grnHeaders = isEn
    ? ["GRN #", "PO Ref", "Received Qty", "Entry Date"]
    : ["No. GRN", "Referensi PO", "Kuantitas Diterima", "Tanggal Masuk"];

  return (
    <div className="grid gap-5">
      <Card className="p-4 text-xs leading-relaxed text-[var(--mu)]">
        <p className="max-w-[75ch]">
          <b className="text-[var(--tx)]">{isEn ? "Inbound Procurement Flow (P2P):" : "Alur Kerja Pembelian & Barang Masuk (P2P):"}</b>{" "}
          {isEn
            ? "1. Issue Purchase Order (PO) to supplier → 2. Click Receive GRN when supplier truck arrives → 3. Physical stock (On-Hand) & ATP automatically increase in the Stock & ATP menu!"
            : "1. Terbitkan Purchase Order (PO) ke pemasok → 2. Klik Terima Barang (GRN) saat truk pemasok tiba di gudang → 3. Saldo stok fisik (On-Hand) & ATP produk tersebut otomatis bertambah di menu Stok & ATP!"}
        </p>
      </Card>
      {isReal && canEdit && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{isEn ? "Create Purchase Order (PO)" : "Buat Purchase Order (PO) Baru"}</h2>
            <Badge tone="b">{role}</Badge>
          </div>
          <form onSubmit={handleCreatePo} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input required placeholder={isEn ? "Supplier Name" : "Nama Pemasok"} value={supp} onChange={(e) => setSupp(e.target.value)} className={INP} />
            <select value={skuCode} onChange={(e) => setSkuCode(e.target.value)} className={INP}>
              <option value="">{isEn ? "-- Select SKU --" : "-- Pilih Produk SKU --"}</option>
              {skus.map((k) => <option key={k.code} value={k.code}>{k.name} ({k.code})</option>)}
            </select>
            <input type="number" min={1} placeholder={isEn ? "Order Qty" : "Kuantitas PO"} value={qty} onChange={(e) => setQty(e.target.value)} className={INP} />
            <input type="number" min={0} placeholder={isEn ? "Unit Cost (Rp)" : "Harga Beli (Rp)"} value={cost} onChange={(e) => setCost(e.target.value)} className={INP} />
            <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
              {isEn ? "Issue PO" : "Terbitkan PO"}
            </button>
          </form>
        </Card>
      )}
      <Panel title={isEn ? "Purchase Order (P2P Procurement)" : "Purchase Order (P2P Procurement)"} icon={<DIcon name="inbox" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{poHeaders.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {hasPo ? (
                <tr>
                  <td className={`${TD} font-bold`}>{po.no}</td>
                  <td className={TD}>{po.supplier}</td>
                  <td className={TD}>{po.issued}</td>
                  <td className={TD}>{po.eta}</td>
                  <td className={TD}>{s.name} × {po.qty} {s.uom}</td>
                  <td className={`${TD} font-semibold`}>{po.received} / {po.qty}</td>
                  <td className={TD}>{rp(po.qty * po.cost)}</td>
                  <td className={TD}><Badge tone={st === "RECEIVED" ? "g" : "b"}>{st}</Badge></td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                    {isEn ? "No purchase orders issued for this tenant yet." : "Belum ada pesanan pembelian (PO) untuk perusahaan ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      {hasPo && (
        <Card data-tour="grn-actions" className="flex flex-wrap items-center gap-3 p-4">
          <span className="flex-1 text-sm text-[var(--mu)]">
            <strong>{isEn ? "Receiving Instructions:" : "Instruksi Penerimaan:"}</strong>{" "}
            {isEn
              ? `Click button to issue GRN document. Items are physically placed in Bin ${s.bin} and immediately increase ATP stock.`
              : `Klik tombol untuk menerbitkan dokumen GRN. Kuantitas barang otomatis masuk ke Bin ${s.bin} dan menaikkan saldo ATP.`}
          </span>
          <button
            className={BTN}
            onClick={() => openWhatsApp("", `Halo ${po.supplier}, berikut rincian Purchase Order ${po.no}: ${s.name} sebanyak ${po.qty} ${s.uom} (Total ${rp(po.qty * po.cost)}). Mohon konfirmasi jadwal pengiriman.`)}
          >
            {isEn ? "Send PO via WA" : "Kirim PO via WA"}
          </button>
          <button disabled={remaining <= 0} className={`${BTN} bg-emerald-600! text-white! disabled:opacity-40`} onClick={() => act({ type: "grn", qty: 250 })}>
            {isEn ? "Receive 250 SAK" : "Terima 250 SAK"}
          </button>
          <button disabled={remaining <= 0} className={`${BTN} disabled:opacity-40`} onClick={() => act({ type: "grn", qty: remaining })}>
            {isEn ? `Receive Remaining (${remaining} ${s.uom})` : `Terima Semua Sisa (${remaining} ${s.uom})`}
          </button>
        </Card>
      )}
      <Panel title={isEn ? "Goods Receipt Notes (Physical GRN)" : "Bukti Penerimaan Barang Fisik (GRN)"} icon={<DIcon name="doc" />}>
        {grns.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{grnHeaders.map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {grns.map((g) => (
                  <tr key={g.no}>
                    <td className={`${TD} font-bold`}>{g.no}</td>
                    <td className={TD}>{po.no}</td>
                    <td className={`${TD} font-bold text-emerald-700 dark:text-emerald-400`}>+{g.qty} {s.uom}</td>
                    <td className={TD}>11 Nov 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-4 text-sm text-[var(--mu)]">
            {isEn ? "No GRN issued for this PO yet." : "Belum ada GRN yang diterbitkan untuk PO ini."}
          </p>
        )}
      </Panel>
    </div>
  );
}
