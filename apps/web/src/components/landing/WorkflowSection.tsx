import React from "react";

const P2P_STEPS = [
  "Stok di bawah titik pesan", "Penerbitan PO", "Approval Pimpinan", "Barang Tiba di Gudang", "GRN & Hitung Fisik", "Stok Bertambah Otomatis", "Tagihan Pemasok",
];

const O2C_STEPS = [
  "Sales Order Dibuat", "Validasi Limit Kredit", "Kunci Stok (Reservasi)", "Pick & Pack", "Pengiriman Parsial (DO)", "Bukti Terima (POD)", "Terbitkan Faktur", "Pembayaran & AR Aging",
];

export function WorkflowSection() {
  return (
    <section id="alur" className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--bd)]">
      <div className="max-w-xl mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">
          Alur Kerja Distribusi Terpadu
        </h2>
        <p className="mt-2 text-sm text-[var(--mu)]">
          Dari pengadaan barang pabrik hingga penagihan dan pembayaran pelanggan.
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--tx)]">
            1. Procure-to-Pay (P2P)
          </span>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {P2P_STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--mu)] text-xs">›</span>}
                <span className="rounded-full border border-[var(--bd)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--tx)]">
                  {step}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            2. Order-to-Cash (O2C)
          </span>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {O2C_STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--mu)] text-xs">›</span>}
                <span className="rounded-full border border-[var(--bd)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--tx)]">
                  {step}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
