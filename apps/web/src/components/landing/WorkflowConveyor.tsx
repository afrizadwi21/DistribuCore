"use client";

import React, { useEffect, useRef, useState } from "react";

const P2P = ["Stok di bawah titik pesan", "Penerbitan PO", "Approval Pimpinan", "Barang Tiba di Gudang", "GRN & Hitung Fisik", "Stok Bertambah Otomatis", "Tagihan Pemasok"];
const O2C = ["Sales Order Dibuat", "Validasi Limit Kredit", "Kunci Stok (Reservasi)", "Pick & Pack", "Pengiriman Parsial (DO)", "Bukti Terima (POD)", "Terbitkan Faktur", "Pembayaran & AR Aging"];
const STEPS = [...P2P.map((t, n) => ({ t, n, lane: 0 })), ...O2C.map((t, n) => ({ t, n, lane: 1 }))];
const LANES = ["Procure-to-Pay (P2P)", "Order-to-Cash (O2C)"];
const TILT = 58;
const pad = (n: number) => String(n).padStart(2, "0");

export function WorkflowConveyor() {
  const total = STEPS.length;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [gap, setGap] = useState(420);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current, track = trackRef.current;
      if (!el || !track) return;
      const g = window.innerWidth < 640 ? 280 : 420;
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span)) : 0;
      const pos = p * (total - 1);
      track.style.transform = `translateX(${-pos * g}px)`;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(i - pos), near = Math.max(0, 1 - d);
        c.style.transform = `rotateX(${-TILT}deg) translateY(${-near * 48}px) scale(${0.88 + near * 0.12})`;
        c.style.opacity = String(Math.max(0, 1 - d * 0.22));
      });
      setGap(g);
      setActive(Math.round(pos));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [total]);

  const lane = STEPS[active].lane, w = gap * 0.88;

  return (
    <section ref={sectionRef} id="alur" className="relative border-t border-[var(--bd)]" style={{ height: `${100 + (total - 1) * 36}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[var(--bg)] select-none">
        <div className="absolute inset-x-0 top-[7vh] z-10 px-6 text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--tx)] font-heading leading-tight">Alur Kerja Distribusi Terpadu</h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--mu)] max-w-xl mx-auto">Dari pengadaan barang pabrik hingga penagihan dan pembayaran pelanggan.</p>
          <div className="mt-4 inline-flex gap-2 text-xs font-semibold">
            {LANES.map((l, i) => (
              <span key={l} className={`rounded-full border px-4 py-1.5 transition-colors ${i === lane ? (i ? "border-emerald-600 bg-emerald-600 text-white" : "border-[var(--bl)] bg-[var(--bl)] text-[var(--act)]") : "border-[var(--bd)] text-[var(--mu)]"}`}>{l}</span>
            ))}
          </div>
        </div>

        <div className="absolute inset-0" style={{ perspective: "1100px", perspectiveOrigin: "50% 35%" }}>
          <div className="absolute left-1/2 top-[68%] h-0 w-0" style={{ transform: `rotateX(${TILT}deg)`, transformStyle: "preserve-3d" }}>
            <div ref={trackRef} className="absolute left-0 top-0" style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
              <div className="absolute border-y border-[var(--bd)] bg-[var(--soft)]" style={{ left: -gap, top: -90, width: (total + 1) * gap, height: 180, backgroundImage: "repeating-linear-gradient(90deg, var(--bd) 0 2px, transparent 2px 48px)" }} />
              <div className="absolute w-[3px] bg-emerald-500" style={{ left: (P2P.length - 0.5) * gap, top: -110, height: 220 }} />
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  ref={(n) => { cardRefs.current[i] = n; }}
                  className={`absolute rounded-2xl border p-6 shadow-sm transition-colors duration-200 flex flex-col justify-between ${i === active ? (s.lane ? "border-emerald-600 bg-emerald-600 text-white" : "border-[var(--bl)] bg-[var(--bl)] text-[var(--act)]") : "border-[var(--bd)] bg-[var(--card)] text-[var(--tx)]"}`}
                  style={{ left: i * gap - w / 2, top: -210, width: w, height: 210, transformOrigin: "50% 100%" }}
                >
                  <div className="font-mono text-xs font-bold uppercase tracking-wider opacity-75">{s.lane ? "O2C" : "P2P"} · {pad(s.n + 1)}</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-balance" style={{ fontFamily: "var(--font-heading)" }}>{s.t}</div>
                  <div className="text-xs font-mono opacity-70">Langkah {pad(i + 1)} / {pad(total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[6vh] z-10 mx-auto flex max-w-3xl items-center gap-4 px-6">
          <span className="font-mono text-sm font-bold tabular-nums text-[var(--tx)]">{pad(active + 1)} <span className="text-[var(--mu)]">/ {pad(total)}</span></span>
          <div className="flex flex-1 gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s.t} className={`h-1.5 flex-1 rounded-full transition-colors ${i > active ? "bg-[var(--bd)]" : s.lane ? "bg-emerald-500" : "bg-[var(--tx)]"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
