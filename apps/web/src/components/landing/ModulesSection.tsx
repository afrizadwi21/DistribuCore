import React from "react";
import { MODULES } from "./data";
import { ShieldIcon } from "./Icons";

export function ModulesSection() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-20 lg:py-28 border-t border-[var(--bd)]">
      <div className="max-w-2xl mb-12">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-[var(--tx)] leading-[1.08] [text-wrap:balance]">
          Tujuh modul, satu sumber kebenaran
        </h2>
        <p className="mt-3 text-base sm:text-lg lg:text-xl text-[var(--mu)] leading-relaxed [text-wrap:pretty]">
          Setiap modul memakai saldo stok, batasan plafon kredit, dan faktur yang sama secara terintegrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-7 shadow-sm hover:border-[var(--bl)] transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--bd)] bg-[var(--card)] text-[var(--bl)] mb-5">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black font-heading text-[var(--tx)] mb-2.5">
              {item.title}
            </h3>
            <p className="text-sm sm:text-base text-[var(--mu)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
