"use client";

import React, { useState } from "react";
import { CheckIcon } from "./Icons";

export function DemoLoginSection() {
  const [tab, setTab] = useState<"demo" | "real">("demo");
  const [tenantCode, setTenantCode] = useState("SBA");
  const [email, setEmail] = useState("admin@sba.co.id");
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");

  return (
    <section id="coba" className="mx-auto max-w-6xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">
            Coba langsung, tanpa instalasi
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">
            Jelajahi alur pesanan, stok, pengiriman, dan faktur piutang secara langsung di browser Anda.
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">Akses Demo Satu Klik</strong>
                <span className="text-[var(--mu)]">Jelajahi dasbor operasional dengan data contoh tanpa perlu registrasi akun.</span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">Terhubung ke Server API Go Fiber</strong>
                <span className="text-[var(--mu)]">Mendukung koneksi langsung ke backend multi-tenant dan Scalar docs.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-7 shadow-xl">
          <div className="flex rounded-xl border border-[var(--bd)] bg-[var(--soft)] p-1.5 mb-6">
            <button onClick={() => setTab("demo")} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${tab === "demo" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>
              Login Demo
            </button>
            <button onClick={() => setTab("real")} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${tab === "real" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>
              Login Server Asli
            </button>
          </div>

          {tab === "demo" ? (
            <div className="space-y-5">
              <p className="text-sm sm:text-base text-[var(--mu)] leading-relaxed">
                Jelajahi semua fitur dengan data sampel seed: PT Sumber Bangunan Abadi (SBA), Gudang Pusat Cikarang, dan transaksi PO/SO.
              </p>
              <a href="http://localhost:8080/docs" target="_blank" rel="noopener noreferrer" className="block w-full rounded-xl bg-[var(--bl)] py-3.5 text-center text-sm sm:text-base font-bold text-[var(--act)] shadow-md hover:opacity-90 transition-opacity">
                Buka Interactive API & Scalar Docs
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">Server API</label>
                <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">Tenant Code</label>
                  <input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
                </div>
              </div>
              <button className="w-full rounded-xl bg-[var(--bl)] py-3 text-sm sm:text-base font-bold text-[var(--act)] hover:opacity-90 transition-opacity mt-2">
                Hubungkan Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
