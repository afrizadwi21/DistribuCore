import React from "react";
import { ShieldIcon } from "./Icons";

export function ContactFooter() {
  const waUrl = "https://wa.me/6281339529934?text=" + encodeURIComponent("Halo Afriza, saya ingin tahu lebih lanjut tentang DistribuCore.");

  return (
    <>
      <section id="kontak" className="mx-auto max-w-6xl px-6 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-900/60 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Siap Mengoptimalkan Distribusi Anda?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Jadwalkan sesi demo interaktif, konsultasi alur operasional, atau penawaran sistem kustom bersama kami.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors">
              WhatsApp 081339529934
            </a>
            <a href="mailto:afriza.dwi21@gmail.com" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              afriza.dwi21@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-bold text-base text-slate-900 dark:text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <ShieldIcon className="w-3.5 h-3.5" />
            </span>
            DistribuCore
            <span className="text-xs font-normal text-slate-500">· Cloud-Native DMS</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#fitur" className="hover:text-blue-600">Modul</a>
            <a href="#alur" className="hover:text-blue-600">Alur Kerja</a>
            <a href="#harga" className="hover:text-blue-600">Harga</a>
            <a href="#faq" className="hover:text-blue-600">FAQ</a>
            <a href="#kontak" className="hover:text-blue-600">Kontak</a>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DistribuCore by Afriza. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
