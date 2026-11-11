import React from "react";
import { MODULES } from "./data";
import { ShieldIcon } from "./Icons";

export function ModulesSection() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-xl mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tujuh modul, satu sumber kebenaran
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Setiap modul memakai saldo stok, batasan plafon kredit, dan faktur yang sama secara terintegrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MODULES.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-blue-500/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <ShieldIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
