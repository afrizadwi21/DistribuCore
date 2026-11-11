"use client";

import React, { useEffect, useRef, useState } from "react";
import { PERSONAS } from "./data";

const STEP = 20; // derajat antar peran pada silinder 3D
const pad = (n: number) => String(n).padStart(2, "0");

export function PersonaDrum() {
  const total = PERSONAS.length;
  const sectionRef = useRef<HTMLElement>(null);
  const drumRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [fs, setFs] = useState(72);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current, drum = drumRef.current;
      if (!el || !drum) return;
      const size = Math.max(26, Math.min(96, window.innerWidth * 0.058));
      const radius = size * 3.3;
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span)) : 0;
      const pos = p * (total - 1);
      drum.style.transform = `translateZ(${-radius}px) rotateX(${pos * STEP}deg)`;
      itemRefs.current.forEach((li, i) => {
        if (!li) return;
        const d = Math.abs(i - pos);
        li.style.transform = `rotateX(${-i * STEP}deg) translateZ(${radius}px)`;
        li.style.opacity = String(Math.max(0, 1 - d * 0.3));
        li.style.color = d < 0.5 ? "var(--tx)" : "var(--mu)";
      });
      setFs(size);
      setActive(Math.round(pos));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

  const jump = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: top + ((el.offsetHeight - window.innerHeight) * i) / (total - 1), behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="peran" className="relative border-t border-[var(--bd)]" style={{ height: `${100 + (total - 1) * 60}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[var(--bg)] select-none">
        <div className="absolute inset-x-0 top-[9vh] z-10 px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--tx)]">Satu sistem untuk setiap peran operasional</h2>
          <p className="mt-2 text-sm text-[var(--mu)]">Gulir untuk memutar daftar peran.</p>
        </div>

        <div className="absolute inset-0" style={{ perspective: "1400px" }}>
          <ol ref={drumRef} className="absolute inset-0 m-0 list-none p-0" style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
            {PERSONAS.map((p, i) => (
              <li
                key={p.role}
                ref={(n) => { itemRefs.current[i] = n; }}
                className="absolute inset-x-0 top-1/2 whitespace-nowrap text-center font-bold leading-[1.1] tracking-[-0.035em] transition-colors duration-200"
                style={{ fontSize: fs, height: "1.1em", marginTop: "-0.55em", fontFamily: "var(--font-heading)", backfaceVisibility: "hidden" }}
              >
                <button onClick={() => jump(i)} className="cursor-pointer">{p.role}</button>
              </li>
            ))}
          </ol>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-0">
          <div className="absolute inset-x-6 h-px bg-[var(--bd)] sm:inset-x-12" style={{ top: -fs * 0.68 }} />
          <div className="absolute inset-x-6 h-px bg-[var(--bd)] sm:inset-x-12" style={{ top: fs * 0.68 }} />
          <span className="absolute left-2 -top-[7px] h-3.5 w-2 bg-[var(--tx)] [clip-path:polygon(0_0,100%_50%,0_100%)] sm:left-5" />
          <span className="absolute right-2 -top-[7px] h-3.5 w-2 bg-[var(--tx)] [clip-path:polygon(100%_0,0_50%,100%_100%)] sm:right-5" />
        </div>

        <div className="absolute inset-x-0 bottom-[7vh] z-10 mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 sm:px-12">
          <span className="font-mono text-sm font-bold tabular-nums text-[var(--tx)]">
            {pad(active + 1)} <span className="text-[var(--mu)]">/ {pad(total)}</span>
          </span>
          <p aria-live="polite" className="max-w-md text-right text-sm leading-relaxed text-[var(--mu)] sm:text-base">{PERSONAS[active].desc}</p>
        </div>
      </div>
    </section>
  );
}
