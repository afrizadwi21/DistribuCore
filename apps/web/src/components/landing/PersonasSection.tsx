import React from "react";
import { PERSONAS } from "./data";
import { TruckIcon } from "./Icons";

export function PersonasSection() {
  return (
    <section id="peran" className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--bd)]">
      <div className="max-w-xl mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">
          Satu sistem untuk setiap peran operasional
        </h2>
        <p className="mt-2 text-sm text-[var(--mu)]">
          Pemilik, staf gudang, sales, hingga keuangan melihat data akurat yang sama dari sudut pandang masing-masing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PERSONAS.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm hover:border-[var(--bl)] transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] mb-4">
              <TruckIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--tx)] mb-2">
              {item.role}
            </h3>
            <p className="text-xs text-[var(--mu)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
