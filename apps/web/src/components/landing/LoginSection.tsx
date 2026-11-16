"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { CheckIcon } from "./Icons";

export function LoginSection() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const router = useRouter();
  const { login, serverUrl, setServerUrl } = useAuth();

  const [tenantCode, setTenantCode] = useState("SBA");
  const [email, setEmail] = useState("admin@sba.co.id");
  const [password, setPassword] = useState("");
  const [targetApi, setTargetApi] = useState(serverUrl);
  const [showApi, setShowApi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg(isEn ? "Connecting to authentication server..." : "Menghubungkan ke server autentikasi...");

    const res = await login(tenantCode, email, password, targetApi);
    setBusy(false);

    if (res.success) {
      setSuccessMsg(isEn ? "Session verified. Redirecting..." : "Sesi terverifikasi. Mengarahkan ke dasbor...");
      setTimeout(() => router.push("/demo"), 600);
    } else {
      setSuccessMsg("");
      setErrorMsg(res.error || (isEn ? "Authentication failed" : "Autentikasi gagal"));
    }
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-[var(--tx)]">{t("login_lbl_tenant")}</label>
                <button type="button" onClick={() => setShowApi(!showApi)} className="text-[11px] font-semibold text-[var(--mu)] hover:text-[var(--tx)] underline">
                  {showApi ? (isEn ? "Hide API URL" : "Sembunyikan API") : "API Server URL"}
                </button>
              </div>
              <input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            {showApi && (
              <div>
                <label className="block text-xs font-bold text-[var(--tx)] mb-1">Server API Endpoint</label>
                <input value={targetApi} onChange={(e) => setTargetApi(e.target.value)} required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 font-mono text-xs text-[var(--tx)]" />
              </div>
            )}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("login_lbl_email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("login_lbl_password")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[var(--bl)] py-3 text-sm sm:text-base font-bold text-[var(--act)] hover:opacity-90 transition-opacity mt-2 disabled:opacity-50">
              {busy ? (isEn ? "Authenticating..." : "Memverifikasi...") : t("login_btn_submit")}
            </button>
            {successMsg && <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">{successMsg}</p>}
            {errorMsg && <p className="text-center text-xs font-semibold text-rose-600 dark:text-rose-400 leading-relaxed">{errorMsg}</p>}
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
