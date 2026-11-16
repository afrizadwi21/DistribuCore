"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { useAuth } from "@/context/AuthContext";
import { nf } from "@/components/demo/calc";
import { BINS } from "@/components/demo/data";
import { Badge, Bar, BTN, Card, DemoTag, INP } from "@/components/demo/ui";

export default function WarehousesPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { skus, act } = useDemo();
  const { mode, tenant, token, role, can } = useAuth();
  const isReal = mode === "real";
  const canEdit = can("warehouse");

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const loadWarehouses = async () => {
    if (!isReal || !token) return;
    try {
      const res = await fetch("/api/proxy/v1/inventory/warehouses", { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (Array.isArray(j?.data)) setWarehouses(j.data);
    } catch {}
  };

  useEffect(() => { loadWarehouses(); }, [isReal, token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !token) return;
    const addr = address.trim() || null;
    const res = await fetch("/api/proxy/v1/inventory/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: code.trim().toUpperCase(), name: name.trim(), address_line: addr, city: addr }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setCode(""); setName(""); setAddress("");
      await loadWarehouses();
      act({ type: "notify", message: isEn ? "Warehouse registered" : "Fasilitas gudang berhasil ditambahkan" });
    } else {
      act({ type: "notify", message: j?.error?.message || "Gagal menambahkan gudang" });
    }
  };

  const branches = [
    { code: "WH-SBY", name: isEn ? "Surabaya Branch Warehouse" : "Gudang Cabang Surabaya", occ: 64 },
    { code: "WH-MDN", name: isEn ? "Medan Branch Warehouse" : "Gudang Cabang Medan", occ: 51 },
  ];

  if (isReal) {
    return (
      <div className="space-y-5">
        {canEdit && (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{isEn ? "Register Warehouse Facility" : "Tambah Gudang Baru"}</h2>
              <Badge tone="b">{role}</Badge>
            </div>
            <form onSubmit={handleAdd} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input required placeholder="Kode Gudang (mis. WH-JKT)" value={code} onChange={(e) => setCode(e.target.value)} className={INP} />
              <input required placeholder={isEn ? "Warehouse Name" : "Nama Gudang"} value={name} onChange={(e) => setName(e.target.value)} className={INP} />
              <input placeholder={isEn ? "City / Address" : "Kota / Alamat"} value={address} onChange={(e) => setAddress(e.target.value)} className={INP} />
              <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
                {isEn ? "Add Warehouse" : "Tambah Gudang"}
              </button>
            </form>
          </Card>
        )}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{tenant?.name || "Tenant Distribution Hub"}</h2>
              <p className="font-mono text-xs text-[var(--mu)]">
                {tenant?.code || "TENANT"} · {isEn ? "Enterprise Distribution Network" : "Jaringan Distribusi Multi-Gudang"}
              </p>
            </div>
            <Badge tone="g">{isEn ? "REAL SERVER · ACTIVE" : "SERVER ASLI · AKTIF"}</Badge>
          </div>
          {warehouses.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {warehouses.map((w) => (
                <div key={w.id || w.code} className="rounded-lg border border-[var(--bd)] bg-[var(--soft)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--bl)]">{w.code}</span>
                    <Badge tone="g">{isEn ? "ACTIVE" : "AKTIF"}</Badge>
                  </div>
                  <p className="mt-1 font-bold">{w.name}</p>
                  {(w.address_line || w.city || w.address) && <p className="mt-0.5 text-xs text-[var(--mu)]">{w.address_line || w.city || w.address}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--bd)] p-8 text-center">
              <p className="font-semibold text-[var(--tx)]">
                {isEn ? "No warehouse facilities registered yet" : "Belum ada fasilitas gudang terdaftar"}
              </p>
              <p className="mt-1 text-xs text-[var(--mu)]">
                {isEn
                  ? "Use the form above to register your primary distribution center."
                  : "Gunakan formulir di atas untuk mendaftarkan lokasi gudang distribusi perusahaan Anda."}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

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
