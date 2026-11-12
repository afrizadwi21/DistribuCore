"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "./tour-steps";
import { BTN, BTN_PRIMARY } from "./ui";

type Rect = { top: number; left: number; width: number; height: number };

function useTargetRect(target: string) {
  const [rect, setRect] = useState<Rect | null>(null);
  useEffect(() => {
    let raf = 0, tries = 0, scrolled = false;
    const measure = () => {
      const el = target ? document.querySelector(`[data-tour="${target}"]`) : null;
      if (!el) { setRect(null); if (target && tries++ < 40) raf = requestAnimationFrame(measure); return; }
      if (!scrolled) { scrolled = true; el.scrollIntoView({ block: "center", behavior: "smooth" }); }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure); };
  }, [target]);
  return rect;
}

export function Tour({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const router = useRouter();
  const step = TOUR_STEPS[index];
  const rect = useTargetRect(step.target);
  const last = index === TOUR_STEPS.length - 1;

  const go = (i: number) => { onIndex(i); router.push(TOUR_STEPS[i].href); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 rounded-xl ring-2 ring-[var(--bl)] ring-offset-4 ring-offset-[var(--bg)] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out"
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
        >
          <div className="absolute -top-8 left-3 flex items-center gap-1.5 rounded-full bg-[var(--bl)] px-2.5 py-1 text-[11px] font-bold text-[var(--act)] shadow-md animate-bounce">
            <span>👇 Fokus Bagian Ini</span>
          </div>
        </div>
      )}
      <aside role="dialog" aria-modal="false" aria-label="Panduan demo" className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-5 shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[24rem]">
        <p className="text-xs font-semibold text-[var(--mu)]">Langkah {index + 1} dari {TOUR_STEPS.length}</p>
        <h2 className="mt-1 text-xl font-bold font-heading leading-tight">{step.title}</h2>
        <dl className="mt-3 space-y-2.5 text-sm leading-relaxed">
          <div><dt className="font-bold">Untuk apa</dt><dd className="text-[var(--mu)]">{step.purpose}</dd></div>
          <div><dt className="font-bold">Fungsinya</dt><dd className="text-[var(--mu)]">{step.func}</dd></div>
          <div><dt className="font-bold">Coba sekarang</dt><dd className="text-[var(--tx)]">{step.tryIt}</dd></div>
        </dl>
        <div className="mt-4 flex items-center gap-2">
          <button className={BTN} onClick={() => go(index - 1)} disabled={index === 0}>Sebelumnya</button>
          {last ? <button className={`${BTN_PRIMARY} flex-1`} onClick={onClose}>Selesai</button>
            : <button className={`${BTN_PRIMARY} flex-1`} onClick={() => go(index + 1)}>Lanjut</button>}
          {!last && <button className="px-2 py-2 text-sm font-semibold text-[var(--mu)] hover:text-[var(--tx)]" onClick={onClose}>Tutup</button>}
        </div>
      </aside>
    </>
  );
}
