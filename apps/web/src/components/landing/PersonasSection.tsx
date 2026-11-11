"use client";

import React, { useState } from "react";
import { PERSONAS } from "./data";

export function PersonasSection() {
  const [active, setActive] = useState(1);
  const total = PERSONAS.length;

  const prev = () => setActive((c) => (c > 0 ? c - 1 : total - 1));
  const next = () => setActive((c) => (c < total - 1 ? c + 1 : 0));
  const at = (offset: number) => {
    const i = (active + offset + total) % total;
    return { ...PERSONAS[i], i };
  };

  const p1 = at(-1), curr = PERSONAS[active], n1 = at(1), n2 = at(2), n3 = at(3);

  return (
    <section id="peran" className="mx-auto max-w-6xl px-6 py-20 border-t border-[var(--bd)] select-none">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">
          Satu sistem untuk setiap peran operasional
        </h2>
        <p className="mt-2 text-sm text-[var(--mu)]">
          Setiap divisi bekerja dengan satu sumber data terpadu dari sudut pandang masing-masing.
        </p>
      </div>

      <div className="relative py-6 flex flex-col items-center">
        <button onClick={prev} aria-label="Sebelumnya" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-orange-600 dark:text-orange-500 hover:scale-125 transition-transform p-2 text-base font-bold">◀</button>
        <button onClick={next} aria-label="Berikutnya" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-orange-600 dark:text-orange-500 hover:scale-125 transition-transform p-2 text-base font-bold">▶</button>

        <button onClick={() => setActive(p1.i)} className="pb-5 text-xl sm:text-3xl font-bold font-heading italic text-[var(--mu)] opacity-40 hover:opacity-75 transition-all cursor-pointer">
          {p1.role}
        </button>

        <div className="w-full border-y border-[var(--bd)] py-5 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--soft)]/30 rounded-sm">
          <div className="w-full sm:w-28 text-left text-xs font-mono font-medium text-[var(--mu)]">
            {active + 1} of {total}
          </div>
          <div className="flex-1 text-center">
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-orange-600 dark:text-orange-500 font-heading">
              {curr.role}
            </h3>
          </div>
          <div className="w-full sm:w-64 text-center sm:text-right text-xs sm:text-sm font-medium text-[var(--tx)] leading-relaxed">
            {curr.desc}
          </div>
        </div>

        <div className="pt-5 flex flex-col items-center gap-2.5">
          <button onClick={() => setActive(n1.i)} className="text-xl sm:text-3xl font-bold font-heading italic text-[var(--mu)] opacity-50 hover:opacity-85 transition-all cursor-pointer">{n1.role}</button>
          <button onClick={() => setActive(n2.i)} className="text-lg sm:text-2xl font-bold font-heading italic text-[var(--mu)] opacity-30 hover:opacity-60 transition-all cursor-pointer">{n2.role}</button>
          <button onClick={() => setActive(n3.i)} className="text-base sm:text-xl font-bold font-heading italic text-[var(--mu)] opacity-15 hover:opacity-40 transition-all cursor-pointer">{n3.role}</button>
        </div>
      </div>
    </section>
  );
}
