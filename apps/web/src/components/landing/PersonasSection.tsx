"use client";

import React, { useState, useEffect, useRef } from "react";
import { PERSONAS } from "./data";

export function PersonasSection() {
  const [active, setActive] = useState(0);
  const total = PERSONAS.length, containerRef = useRef<HTMLElement>(null);
  const lastScroll = useRef(0), touchStartY = useRef(0);

  const prev = () => setActive((c) => (c > 0 ? c - 1 : total - 1));
  const next = () => setActive((c) => (c < total - 1 ? c + 1 : 0));

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.offsetHeight - window.innerHeight;
      if (h > 0) setActive(Math.min(total - 1, Math.floor(Math.max(0, Math.min(1, -containerRef.current.getBoundingClientRect().top / h)) * total)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [total]);

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

  return (
    <section ref={containerRef} id="peran" onWheel={handleWheel} className="relative h-[280vh] border-t border-[var(--bd)] select-none">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden bg-[var(--bg)] px-6 sm:px-12 py-10">
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
        className="relative py-10 flex flex-col items-center justify-center min-h-[480px] overflow-hidden"
      >
        {/* Navigation arrows */}
        <button onClick={prev} aria-label="Sebelumnya" className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform p-3 text-lg font-bold text-[var(--tx)]">◀</button>
        <button onClick={next} aria-label="Berikutnya" className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform p-3 text-lg font-bold text-[var(--tx)]">▶</button>

        {/* Item above */}
        <button onClick={() => setActive(p1.i)} className="pb-6 text-2xl sm:text-4xl lg:text-5xl font-bold font-heading italic text-[var(--mu)] opacity-30 hover:opacity-60 transition-all cursor-pointer">
          {p1.role}
        </button>

        {/* Active focus row (1 layar monumental) */}
        <div className="w-full border-y border-[var(--bd)] py-8 sm:py-14 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-32 text-left font-mono text-xs sm:text-sm font-bold text-[var(--mu)]">
            0{active + 1} / 0{total}
          </div>
          <div className="flex-1 text-center">
            <h3 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--tx)] font-heading leading-none">
              {curr.role}
            </h3>
          </div>
          <div className="w-full md:w-80 text-center md:text-right text-xs sm:text-sm font-medium text-[var(--mu)] leading-relaxed">
            {curr.desc}
          </div>
        </div>

        {/* Items below with fading drum cascade */}
        <div className="pt-6 flex flex-col items-center gap-3">
          <button onClick={() => setActive(n1.i)} className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading italic text-[var(--mu)] opacity-40 hover:opacity-75 transition-all cursor-pointer">{n1.role}</button>
          <button onClick={() => setActive(n2.i)} className="text-xl sm:text-3xl font-bold font-heading italic text-[var(--mu)] opacity-20 hover:opacity-50 transition-all cursor-pointer">{n2.role}</button>
          <button onClick={() => setActive(n3.i)} className="text-lg sm:text-2xl font-bold font-heading italic text-[var(--mu)] opacity-10 hover:opacity-30 transition-all cursor-pointer">{n3.role}</button>
        </div>
      </div>
      <div className="max-w-md mx-auto w-full pb-4 flex gap-2">
        {PERSONAS.map((_, idx) => (
          <div key={idx} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${idx === active ? "bg-[var(--tx)]" : "bg-[var(--bd)]"}`} />
        ))}
      </div>
      </div>
    </section>
  );
}
