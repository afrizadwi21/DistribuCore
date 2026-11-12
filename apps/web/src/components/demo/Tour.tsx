"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getTourSteps } from "./tour-steps";
import { BTN, BTN_PRIMARY } from "./ui";

type Rect = { top: number; left: number; width: number; height: number };

function useTargetRect(target: string) {
  const [rect, setRect] = useState<Rect | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let scrolled = false;
    let timer: NodeJS.Timeout;
    let count = 0;

    const measure = () => {
      const el = target ? document.querySelector(`[data-tour="${target}"]`) : null;
      if (!el) {
        setRect(null);
        if (target && count++ < 30) timer = setTimeout(measure, 80);
        return;
      }
      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [target, pathname]);

  return rect;
}

export function Tour({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const steps = getTourSteps(locale);
  const step = steps[index] ?? steps[0];
  const rect = useTargetRect(step.target);
  const last = index === steps.length - 1;

  const go = (i: number) => {
    onIndex(i);
    router.push(steps[i].href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isTargetBottom = rect ? rect.top > 240 : false;

  return (
    <>
      {rect && (
        <>
          <div aria-hidden className="pointer-events-none fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-[0.5px] transition-opacity" />
          <div
            aria-hidden
            className="pointer-events-none fixed z-40 rounded-xl ring-4 ring-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.3),0_0_25px_rgba(14,165,233,0.35)] transition-all duration-300 ease-out"
            style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
          >
            <div className="absolute -top-8 left-2 flex items-center gap-1.5 rounded-full bg-sky-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
              <span>{isEn ? "Focus" : "Fokus"}: {step.title}</span>
            </div>
          </div>
        </>
      )}

      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Panduan demo"
        className={`fixed inset-x-3 z-50 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-5 shadow-2xl transition-all sm:inset-x-auto sm:right-6 sm:w-88 ${
          isTargetBottom ? "bottom-3 sm:top-20 sm:bottom-auto" : "bottom-3 sm:bottom-6 sm:top-auto"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--mu)]">
            {isEn ? `Step ${index + 1} of ${steps.length}` : `Langkah ${index + 1} dari ${steps.length}`}
          </p>
          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
            {isEn ? "TOUR GUIDE" : "PANDUAN"}
          </span>
        </div>
        <h2 className="mt-1 text-base font-black font-heading leading-tight">{step.title}</h2>
        <dl className="mt-3 space-y-2 text-xs leading-relaxed">
          <div><dt className="font-bold text-[var(--tx)]">{isEn ? "Purpose" : "Untuk apa"}</dt><dd className="text-[var(--mu)]">{step.purpose}</dd></div>
          <div><dt className="font-bold text-[var(--tx)]">{isEn ? "Mechanism" : "Fungsinya"}</dt><dd className="text-[var(--mu)]">{step.func}</dd></div>
          <div><dt className="font-bold text-[var(--tx)]">{isEn ? "Action instruction" : "Instruksi aksi"}</dt><dd className="font-medium text-[var(--tx)]">{step.tryIt}</dd></div>
        </dl>
        <div className="mt-4 flex items-center gap-2">
          <button className={BTN} onClick={() => go(index - 1)} disabled={index === 0}>{isEn ? "Previous" : "Sebelumnya"}</button>
          {last ? (
            <button className={`${BTN_PRIMARY} flex-1`} onClick={onClose}>{isEn ? "Finish" : "Selesai"}</button>
          ) : (
            <button className={`${BTN_PRIMARY} flex-1`} onClick={() => go(index + 1)}>{isEn ? "Next" : "Lanjut"}</button>
          )}
          {!last && (
            <button className="px-2 py-2 text-xs font-semibold text-[var(--mu)] hover:text-[var(--tx)]" onClick={onClose}>{isEn ? "Close" : "Tutup"}</button>
          )}
        </div>
      </aside>
    </>
  );
}
