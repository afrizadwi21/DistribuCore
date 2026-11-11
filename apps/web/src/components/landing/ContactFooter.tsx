import React from "react";
import { ShieldIcon } from "./Icons";

export function ContactFooter() {
  const waUrl = "https://wa.me/6281339529934?text=" + encodeURIComponent("Halo Afriza, saya ingin tahu lebih lanjut tentang DistribuCore.");

  return (
    <>
      <section id="kontak" className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--bd)]">
        <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--tx)]">
              Tertarik? Hubungi Afriza
            </h2>
            <p className="mt-2 text-sm text-[var(--mu)]">
              Minta demo langsung, penawaran harga, atau diskusi kebutuhan distribusi Anda.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[var(--bl)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--act)] shadow hover:opacity-90 transition-opacity">
              WhatsApp 081339529934
            </a>
            <a href="mailto:afriza.dwi21@gmail.com" className="rounded-lg border border-[var(--bd)] bg-[var(--card)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--tx)] hover:bg-[var(--soft)] transition-colors">
              afriza.dwi21@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--bd)] bg-[var(--card)] py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-bold text-base text-[var(--tx)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bl)] text-[var(--act)]">
              <ShieldIcon className="w-3.5 h-3.5" />
            </span>
            DistribuCore
            <span className="text-xs font-normal text-[var(--mu)]">· Sistem Manajemen Distribusi B2B</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--mu)]">
            <a href="#fitur" className="hover:text-[var(--tx)]">Modul</a>
            <a href="#alur" className="hover:text-[var(--tx)]">Alur Kerja</a>
            <a href="#harga" className="hover:text-[var(--tx)]">Harga</a>
            <a href="#faq" className="hover:text-[var(--tx)]">FAQ</a>
            <a href="#kontak" className="hover:text-[var(--tx)]">Kontak</a>
          </div>

          <p className="text-xs text-[var(--mu)]">
            © {new Date().getFullYear()} Afriza. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </>
  );
}
