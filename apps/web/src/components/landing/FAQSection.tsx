"use client";

import React, { useState } from "react";
import { FAQS } from "./data";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-16 border-t border-[var(--bd)]">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-2 text-sm text-[var(--mu)]">
          Semua yang perlu Anda ketahui tentang implementasi DistribuCore di bisnis Anda.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[var(--bd)] bg-[var(--card)] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-[var(--tx)] hover:opacity-80"
              >
                <span>{faq.q}</span>
                <span className="text-lg font-bold text-[var(--bl)] ml-4">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs text-[var(--mu)] leading-relaxed border-t border-[var(--bd)] pt-3">
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
