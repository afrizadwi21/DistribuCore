"use client";

import React, { useState } from "react";
import { FAQS } from "./data";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-16 border-t border-slate-200 dark:border-slate-800">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Semua yang perlu Anda ketahui tentang implementasi DistribuCore di bisnis Anda.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>{faq.q}</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-4">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
