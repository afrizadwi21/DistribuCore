import React from "react";
import { ShieldIcon } from "./Icons";

export function ContactFooter() {
  const wa = (t: string) => `https://wa.me/6281339529934?text=${encodeURIComponent(t)}`;

  return (
    <>
      <section id="kontak" className="max-w-[1200px] mx-auto py-9 px-[5vw]">
        <div className="rounded-[10px] border border-[var(--bd)] bg-[var(--card)] p-6 flex flex-col md:flex-row items-center gap-5 justify-between transition-colors">
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--tx)]">Tertarik? Hubungi Afriza</h2>
            <p className="text-sm text-[var(--mu)] mt-1.5">Minta demo langsung, penawaran harga, atau diskusi kebutuhan distribusi Anda.</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <a target="_blank" rel="noopener noreferrer" href={wa("Halo Afriza, saya ingin tahu lebih lanjut tentang DistribuCore.")} className="inline-flex items-center justify-center border border-[var(--bl)] bg-[var(--bl)] text-[var(--act)] rounded-lg px-3.5 py-2 font-semibold text-xs hover:opacity-90 transition-opacity">
              WhatsApp 081339529934
            </a>
            <a href="mailto:afriza.dwi21@gmail.com" className="inline-flex items-center justify-center border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] rounded-lg px-3.5 py-2 font-semibold text-xs hover:bg-[var(--soft)] transition-colors">
              afriza.dwi21@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--bd)] bg-[var(--card)] pt-10 pb-5 px-[5vw] transition-colors">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 font-bold text-base text-[var(--tx)]">
              <span className="w-6.5 h-6.5 rounded-[7px] bg-[var(--bl)] text-[var(--act)] grid place-items-center"><ShieldIcon className="w-4 h-4" /></span>
              DistribuCore
            </a>
            <p className="text-[var(--mu)] text-xs mt-3 max-w-[300px] leading-relaxed">Sistem manajemen distribusi B2B untuk distributor, grosir, dan pemasok bahan bangunan.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--tx)] mb-2.5">Keunggulan</h4>
            <ul className="space-y-1 text-xs text-[var(--mu)] list-none p-0 m-0">
              <li>Stok terkunci, tanpa jual ganda</li><li>Pengiriman parsial &amp; POD digital</li><li>Limit kredit otomatis</li><li>Faktur dari surat jalan</li><li>Banyak gudang &amp; perusahaan</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--tx)] mb-2.5">Menu</h4>
            <div className="space-y-1 text-xs text-[var(--mu)] flex flex-col">
              <a href="#fitur" className="hover:text-[var(--tx)]">Modul</a><a href="#alur" className="hover:text-[var(--tx)]">Alur kerja</a><a href="#peran" className="hover:text-[var(--tx)]">Untuk siapa</a><a href="#harga" className="hover:text-[var(--tx)]">Harga</a><a href="#faq" className="hover:text-[var(--tx)]">FAQ</a><a href="#coba" className="hover:text-[var(--tx)]">Masuk</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--tx)] mb-2.5">Hubungi kami</h4>
            <div className="space-y-1 text-xs text-[var(--mu)] flex flex-col">
              <a target="_blank" rel="noopener noreferrer" href={wa("Halo Afriza, saya ingin tahu lebih lanjut tentang DistribuCore.")} className="hover:text-[var(--tx)]">WhatsApp 081339529934</a>
              <a href="mailto:afriza.dwi21@gmail.com" className="hover:text-[var(--tx)]">afriza.dwi21@gmail.com</a>
              <span>Minta demo langsung lewat WhatsApp</span>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-7 pt-4 border-t border-[var(--bd)] flex flex-wrap justify-between gap-3 text-xs text-[var(--mu)]">
          <span>© 2026 Afriza. Hak cipta dilindungi undang-undang.</span>
          <span>DistribuCore · Sistem Manajemen Distribusi B2B</span>
        </div>
      </footer>
    </>
  );
}
