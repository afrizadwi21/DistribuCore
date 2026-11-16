"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/components/demo/DemoContext";
import { outstanding, rp } from "@/components/demo/calc";
import { DIcon } from "@/components/demo/icons";
import { openWhatsApp } from "@/components/demo/wa";
import { Badge, Bar, BTN, Card, DemoTag, INP, Panel, TD, TH } from "@/components/demo/ui";

export default function PartnersPage() {
  const { locale } = useLanguage();
  const { mode, token, tenant, role, can } = useAuth();
  const isEn = locale === "en";
  const { invoices, customers = [], refresh, act } = useDemo();
  const isReal = mode === "real";
  const canEdit = can("sales") || can("finance");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("100000000");
  const [terms, setTerms] = useState("30");

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [sCode, setSCode] = useState("");
  const [sName, setSName] = useState("");
  const [sContact, setSContact] = useState("");
  const [sPhone, setSPhone] = useState("");

  const loadSuppliers = async () => {
    if (!isReal || !token) return;
    try {
      const res = await fetch("/api/proxy/v1/partners/suppliers", { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (Array.isArray(j?.data)) setSuppliers(j.data);
    } catch {}
  };

  useEffect(() => { loadSuppliers(); }, [isReal, token]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !token) return;
    const res = await fetch("/api/proxy/v1/partners/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        company_name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        credit_limit_cents: Math.round((Number(limit) || 0) * 100),
        payment_terms_days: Number(terms) || 30,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setCode(""); setName(""); setPhone(""); setEmail("");
      refresh();
      act({ type: "notify", message: isEn ? "Customer registered" : "Pelanggan B2B berhasil ditambahkan" });
    } else {
      act({ type: "notify", message: j?.error?.message || "Gagal menambahkan pelanggan" });
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sCode.trim() || !sName.trim() || !token) return;
    const res = await fetch("/api/proxy/v1/partners/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: sCode.trim().toUpperCase(),
        company_name: sName.trim(),
        contact_person: sContact.trim() || "-",
        phone: sPhone.trim() || null,
      }),
    });
    if (res.ok) {
      setSCode(""); setSName(""); setSContact(""); setSPhone("");
      await loadSuppliers();
      act({ type: "notify", message: isEn ? "Supplier registered" : "Pemasok berhasil ditambahkan" });
    }
  };

  const handleDeleteCustomer = async (id?: string) => {
    if (!id || !token) return;
    await fetch(`/api/proxy/v1/partners/customers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    refresh();
    act({ type: "notify", message: isEn ? "Customer removed" : "Data pelanggan berhasil dihapus" });
  };

  const custHeaders = isEn
    ? ["Code", "Company", "WhatsApp / Email", "Credit Limit", "Outstanding", "Utilization", "Terms", "Status", "Action"]
    : ["Kode", "Perusahaan", "WhatsApp / Email", "Limit Kredit", "Terutang", "Pemakaian", "Termin", "Status", "Aksi"];

  const suppHeaders = isEn
    ? ["Supplier Code", "Company Name", "Contact / WhatsApp", "Payment Terms", "Action"]
    : ["Kode Pemasok", "Nama Perusahaan", "Kontak / WhatsApp", "Termin Pembayaran", "Aksi"];

  return (
    <div className="grid gap-5">
      {isReal && canEdit && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{isEn ? "Register B2B Customer" : "Tambah Pelanggan B2B Baru"}</h2>
            <Badge tone="b">{role}</Badge>
          </div>
          <form onSubmit={handleAddCustomer} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input required placeholder="Kode (mis. CUST-01)" value={code} onChange={(e) => setCode(e.target.value)} className={INP} />
            <input required placeholder={isEn ? "Company Name" : "Nama Perusahaan"} value={name} onChange={(e) => setName(e.target.value)} className={INP} />
            <input placeholder="No. WhatsApp (mis. 08123456789)" value={phone} onChange={(e) => setPhone(e.target.value)} className={INP} />
            <input type="email" placeholder="Email Pelanggan (opsional)" value={email} onChange={(e) => setEmail(e.target.value)} className={INP} />
            <input type="number" placeholder="Limit Kredit (Rp)" value={limit} onChange={(e) => setLimit(e.target.value)} className={INP} />
            <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
              {isEn ? "Add Customer" : "Tambah Pelanggan"}
            </button>
          </form>
        </Card>
      )}
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
                    <td className={`${TD} text-xs text-[var(--mu)]`}>{c.phone || c.email || "-"}</td>
                    <td className={TD}>{rp(c.limit)}</td>
                    <td className={`${TD} font-semibold`}>{rp(outst)}</td>
                    <td className={`${TD} w-32`}>
                      <Bar parts={[{ pct: Math.min(100, pct), color: barColor }]} />
                      <span className="text-[11px] text-[var(--mu)]">{pct}%</span>
                    </td>
                    <td className={TD}>Net {c.terms} {isEn ? "days" : "hari"}</td>
                    <td className={TD}><Badge tone={c.hold ? "r" : "g"}>{c.hold ? "CREDIT HOLD" : (isEn ? "ACTIVE" : "AKTIF")}</Badge></td>
                    <td className={TD}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openWhatsApp(c.phone, `Halo ${c.name}, kami dari ${tenant?.name || "DistribuCore"} ingin mengonfirmasi pesanan dan status akun B2B Anda.`)}
                          className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-500/25 dark:text-emerald-300"
                        >
                          Chat WA
                        </button>
                        {isReal && canEdit && (
                          <button onClick={() => handleDeleteCustomer(c.id)} className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-500/20 dark:text-rose-300">
                            {isEn ? "Delete" : "Hapus"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!customers.length && (
                <tr>
                  <td colSpan={custHeaders.length} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                    {isEn ? "No customer accounts registered for this tenant yet." : "Belum ada pelanggan B2B terdaftar untuk perusahaan ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {isReal && canEdit && (
        <Card className="p-5">
          <h2 className="text-base font-bold">{isEn ? "Register Supplier" : "Tambah Pemasok Baru (Supplier)"}</h2>
          <form onSubmit={handleAddSupplier} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input required placeholder="Kode (mis. SUPP-01)" value={sCode} onChange={(e) => setSCode(e.target.value)} className={INP} />
            <input required placeholder={isEn ? "Supplier Company" : "Nama Perusahaan Pemasok"} value={sName} onChange={(e) => setSName(e.target.value)} className={INP} />
            <input placeholder={isEn ? "Contact Person" : "Kontak Person"} value={sContact} onChange={(e) => setSContact(e.target.value)} className={INP} />
            <input placeholder="No. WhatsApp Pemasok" value={sPhone} onChange={(e) => setSPhone(e.target.value)} className={INP} />
            <button type="submit" className={`${BTN} justify-center bg-[var(--bl)]! text-white!`}>
              {isEn ? "Add Supplier" : "Tambah Pemasok"}
            </button>
          </form>
        </Card>
      )}

      <Panel title={isEn ? "Strategic Suppliers" : "Pemasok Utama (Suppliers)"} icon={<DIcon name="inbox" />}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{suppHeaders.map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {isReal ? (
                suppliers.length ? suppliers.map((s) => (
                  <tr key={s.id || s.code}>
                    <td className={`${TD} font-mono font-bold`}>{s.code}</td>
                    <td className={TD}><b>{s.company_name || s.name}</b></td>
                    <td className={TD}>{s.contact_person || "-"} {s.phone ? `· ${s.phone}` : ""}</td>
                    <td className={TD}>Net {s.payment_terms_days || 30} {isEn ? "days" : "hari"}</td>
                    <td className={TD}>
                      <button
                        onClick={() => openWhatsApp(s.phone, `Halo ${s.company_name || s.name}, kami dari ${tenant?.name || "DistribuCore"} ingin menindaklanjuti pengadaan Purchase Order (PO).`)}
                        className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-500/25 dark:text-emerald-300"
                      >
                        Chat WA
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className={`${TD} py-8 text-center text-[var(--mu)]`}>
                      {isEn ? "No strategic suppliers registered yet." : "Belum ada pemasok terdaftar untuk perusahaan ini."}
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td className={`${TD} font-mono font-bold`}>SUPP-SG</td>
                  <td className={TD}><b>PT Semen Gresik Tbk</b></td>
                  <td className={TD}>Agus Hendrawan · 08123000999</td>
                  <td className={TD}>Net 45 {isEn ? "days" : "hari"}</td>
                  <td className={TD}>
                    <button
                      onClick={() => openWhatsApp("08123000999", "Halo PT Semen Gresik Tbk, kami ingin mengonfirmasi jadwal pengiriman PO-2026-001.")}
                      className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-500/25 dark:text-emerald-300"
                    >
                      Chat WA
                    </button>
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
