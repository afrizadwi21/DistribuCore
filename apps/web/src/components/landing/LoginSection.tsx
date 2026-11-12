"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { CheckIcon } from "./Icons";

export function LoginSection() {
  const { t } = useLanguage();
  const [tenantCode, setTenantCode] = useState("SBA");
  const [email, setEmail] = useState("admin@sba.co.id");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Menghubungkan ke server autentikasi…");
    setTimeout(() => {
      setMsg("Sesi terverifikasi. Mengarahkan ke dasbor…");
    }, 1000);
  };

  return (
    <section id="login" className="mx-auto max-w-6xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">
            {t("login_title")}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">
            {t("login_desc")}
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">{t("login_f1_t")}</strong>
                <span className="text-[var(--mu)]">{t("login_f1_d")}</span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">{t("login_f2_t")}</strong>
                <span className="text-[var(--mu)]">{t("login_f2_d")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-7 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("login_lbl_tenant")}</label>
              <input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("login_lbl_email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("login_lbl_password")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-[var(--bl)] py-3 text-sm sm:text-base font-bold text-[var(--act)] hover:opacity-90 transition-opacity mt-2">
              {t("login_btn_submit")}
            </button>
            {msg && <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">{msg}</p>}
          </form>
          <div className="mt-6 pt-5 border-t border-[var(--bd)] text-center text-xs sm:text-sm text-[var(--mu)]">
            Ingin mencoba tanpa akun?{" "}
            <Link href="/demo" className="font-bold text-[var(--bl)] hover:underline">
              Buka Demo Interaktif
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
