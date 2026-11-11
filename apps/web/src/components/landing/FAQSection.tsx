"use client";

import React, { useState } from "react";
import { FAQS } from "./data";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-3 text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">
          Semua yang perlu Anda ketahui tentang implementasi DistribuCore di bisnis Anda.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-6 text-left text-base sm:text-lg font-black font-heading text-[var(--tx)] hover:opacity-85 transition-opacity"
              >
                <span>{faq.q}</span>
                <span className="text-xl font-black text-[var(--bl)] ml-4">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-0 text-sm sm:text-base text-[var(--mu)] leading-relaxed border-t border-[var(--bd)] pt-4 font-normal font-sans">
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
