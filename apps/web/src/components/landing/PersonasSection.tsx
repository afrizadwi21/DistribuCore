"use client";

import React, { useState, useRef } from "react";
import { PERSONAS } from "./data";

const ROLE_COLORS = [
  "#ea580c", // 0: Pemilik & Eksekutif (Tangerine)
  "#059669", // 1: Manajer Gudang & Logistik (Emerald)
  "#0284c7", // 2: Staf Pembelian (Sky Blue)
  "#2563eb", // 3: Sales Representative (Cobalt Blue)
  "#d97706", // 4: Koordinator Pengiriman (Amber Ochre)
  "#7c3aed", // 5: Keuangan & Piutang (Royal Violet)
];

export function PersonasSection() {
  const [active, setActive] = useState(0);
  const total = PERSONAS.length;
  const lastScroll = useRef(0);
  const touchStartY = useRef(0);

  const prev = () => setActive((c) => (c > 0 ? c - 1 : total - 1));
  const next = () => setActive((c) => (c < total - 1 ? c + 1 : 0));
  const at = (offset: number) => {
    const i = (active + offset + total) % total;
    return { ...PERSONAS[i], i };
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 20) {
      const now = Date.now();
      if (now - lastScroll.current > 180) {
        lastScroll.current = now;
        e.deltaY > 0 ? next() : prev();
      }
    }
  };

  const p1 = at(-1), curr = PERSONAS[active], n1 = at(1), n2 = at(2), n3 = at(3);
  const activeColor = ROLE_COLORS[active % ROLE_COLORS.length];

  return (
    <section id="peran" onWheel={handleWheel} className="relative mx-auto max-w-6xl px-6 py-24 border-t border-[var(--bd)] select-none">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--tx)]">
          Satu sistem untuk setiap peran operasional
        </h2>
        <p className="mt-2 text-sm text-[var(--mu)]">
          Scroll dengan mouse atau touchpad untuk menjelajahi peran operasional.
        </p>
      </div>

      <div
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const delta = touchStartY.current - e.changedTouches[0].clientY;
          if (Math.abs(delta) > 35) delta > 0 ? next() : prev();
        }}
        className="relative py-10 flex flex-col items-center justify-center min-h-[440px] overflow-hidden"
      >
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 opacity-25"
          style={{ background: `radial-gradient(ellipse at center, ${activeColor} 0%, transparent 65%)` }}
        />

        {/* Navigation arrows */}
        <button onClick={prev} aria-label="Sebelumnya" style={{ color: activeColor }} className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform p-3 text-lg font-bold">◀</button>
        <button onClick={next} aria-label="Berikutnya" style={{ color: activeColor }} className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform p-3 text-lg font-bold">▶</button>

        {/* Item above */}
        <button onClick={() => setActive(p1.i)} className="pb-6 text-2xl sm:text-4xl font-bold font-heading italic text-[var(--mu)] opacity-35 hover:opacity-75 transition-all cursor-pointer">
          {p1.role}
        </button>

        {/* Active focus row */}
        <div className="w-full border-y border-[var(--bd)] py-8 px-6 sm:px-14 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-[2px]">
          <div className="w-full sm:w-32 text-left text-xs sm:text-sm font-mono font-bold text-[var(--mu)]">
            {active + 1} of {total}
          </div>
          <div className="flex-1 text-center">
            <h3 style={{ color: activeColor }} className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading transition-colors duration-300">
              {curr.role}
            </h3>
          </div>
          <div className="w-full sm:w-72 text-center sm:text-right text-xs sm:text-sm font-medium text-[var(--tx)] leading-relaxed">
            {curr.desc}
          </div>
        </div>

        {/* Items below with fading drum cascade */}
        <div className="pt-6 flex flex-col items-center gap-3">
          <button onClick={() => setActive(n1.i)} className="text-2xl sm:text-4xl font-bold font-heading italic text-[var(--mu)] opacity-50 hover:opacity-85 transition-all cursor-pointer">{n1.role}</button>
          <button onClick={() => setActive(n2.i)} className="text-xl sm:text-3xl font-bold font-heading italic text-[var(--mu)] opacity-28 hover:opacity-60 transition-all cursor-pointer">{n2.role}</button>
          <button onClick={() => setActive(n3.i)} className="text-lg sm:text-2xl font-bold font-heading italic text-[var(--mu)] opacity-12 hover:opacity-40 transition-all cursor-pointer">{n3.role}</button>
        </div>
      </div>
    </section>
  );
}
