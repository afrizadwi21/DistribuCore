"use client";

import React, { useState } from "react";
import { CheckIcon } from "./Icons";

export function DemoLoginSection() {
  const [tab, setTab] = useState<"demo" | "real">("demo");
  const [tenantCode, setTenantCode] = useState("SBA");
  const [email, setEmail] = useState("admin@sba.co.id");
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");

  return (
    <section id="coba" className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Coba langsung, tanpa instalasi
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Jelajahi alur pesanan, stok, pengiriman, dan faktur piutang secara langsung di browser Anda.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
              <div className="text-xs">
                <strong className="block text-slate-900 dark:text-white">Akses Demo Satu Klik</strong>
                <span className="text-slate-500">Jelajahi dasbor operasional dengan data contoh tanpa perlu registrasi akun.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
              <div className="text-xs">
                <strong className="block text-slate-900 dark:text-white">Terhubung ke Server API Go Fiber</strong>
                <span className="text-slate-500">Mendukung koneksi langsung ke backend multi-tenant dan Scalar docs.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-1 mb-6">
            <button onClick={() => setTab("demo")} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${tab === "demo" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow" : "text-slate-500"}`}>
              Login Demo
            </button>
            <button onClick={() => setTab("real")} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${tab === "real" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow" : "text-slate-500"}`}>
              Login Server Asli
            </button>
          </div>

          {tab === "demo" ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Jelajahi semua fitur dengan data sampel seed: PT Sumber Bangunan Abadi (SBA), Gudang Pusat Cikarang, dan transaksi PO/SO.
              </p>
              <a href="http://localhost:8080/docs" target="_blank" rel="noopener noreferrer" className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors">
                Buka Interactive API & Scalar Docs
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Server API</label>
                <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tenant Code</label>
                  <input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs" />
                </div>
              </div>
              <button className="w-full rounded-lg bg-slate-900 dark:bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors mt-2">
                Hubungkan Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
