"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CheckIcon } from "./Icons";

export function DemoLoginSection() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"demo" | "real">("demo");
  const [tenantCode, setTenantCode] = useState("SBA");
  const [email, setEmail] = useState("admin@sba.co.id");
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");

  return (
    <section id="coba" className="mx-auto max-w-6xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">
            {t("demo_title")}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">
            {t("demo_desc")}
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">{t("demo_f1_t")}</strong>
                <span className="text-[var(--mu)]">{t("demo_f1_d")}</span>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] shrink-0">
                <CheckIcon className="w-4 h-4" />
              </span>
              <div className="text-sm sm:text-base">
                <strong className="block text-[var(--tx)] font-bold">{t("demo_f2_t")}</strong>
                <span className="text-[var(--mu)]">{t("demo_f2_d")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-7 shadow-xl">
          <div className="flex rounded-xl border border-[var(--bd)] bg-[var(--soft)] p-1.5 mb-6">
            <button onClick={() => setTab("demo")} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${tab === "demo" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>
              {t("demo_tab_demo")}
            </button>
            <button onClick={() => setTab("real")} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${tab === "real" ? "bg-[var(--bl)] text-[var(--act)] shadow" : "text-[var(--mu)] hover:text-[var(--tx)]"}`}>
              {t("demo_tab_real")}
            </button>
          </div>

          {tab === "demo" ? (
            <div className="space-y-5">
              <p className="text-sm sm:text-base text-[var(--mu)] leading-relaxed">
                {t("demo_sample_desc")}
              </p>
              <a href="http://localhost:8080/docs" target="_blank" rel="noopener noreferrer" className="block w-full rounded-xl bg-[var(--bl)] py-3.5 text-center text-sm sm:text-base font-bold text-[var(--act)] shadow-md hover:opacity-90 transition-opacity">
                {t("demo_btn_scalar")}
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("demo_lbl_server")}</label>
                <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("demo_lbl_tenant")}</label>
                  <input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--tx)] mb-1.5">{t("demo_lbl_email")}</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--bd)] bg-[var(--soft)] px-3.5 py-2 text-sm text-[var(--tx)] font-medium" />
                </div>
              </div>
              <button className="w-full rounded-xl bg-[var(--bl)] py-3 text-sm sm:text-base font-bold text-[var(--act)] hover:opacity-90 transition-opacity mt-2">
                {t("demo_btn_connect")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
