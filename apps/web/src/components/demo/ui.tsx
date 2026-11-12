import React from "react";
import type { Health } from "./calc";

export type Tone = "g" | "a" | "r" | "b" | "m";

const TONES: Record<Tone, string> = {
  g: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  a: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  r: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  b: "bg-[var(--bl)]/10 text-[var(--bl)]",
  m: "bg-[var(--soft)] text-[var(--mu)]",
};

export const TH = "px-3.5 py-3 text-left text-xs font-semibold whitespace-nowrap text-[var(--mu)] border-b border-[var(--bd)]";
export const TD = "px-3.5 py-3.5 text-sm whitespace-nowrap border-b border-[var(--bd)] tabular-nums";
export const BTN = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--bd)] bg-[var(--card)] px-3.5 py-2 text-sm font-semibold text-[var(--tx)] transition-colors hover:bg-[var(--soft)] disabled:opacity-50";
export const BTN_PRIMARY = "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--bl)] px-3.5 py-2 text-sm font-semibold text-[var(--act)] transition-opacity hover:opacity-90 disabled:opacity-50";

export function Badge({ tone = "m", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

export const DemoTag = ({ show }: { show: boolean }) => (show ? <Badge>DEMO</Badge> : null);

export const HealthBadge = ({ h }: { h: Health }) => <Badge tone={h === "HEALTHY" ? "g" : h === "CRITICAL_LOW" ? "r" : "a"}>{h}</Badge>;

export function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`rounded-xl border border-[var(--bd)] bg-[var(--card)] ${className}`}>{children}</div>;
}

export function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 border-b border-[var(--bd)] px-4 py-3 text-base font-bold font-heading">{icon}{title}</h3>
      {children}
    </Card>
  );
}

export function Bar({ parts }: { parts: { pct: number; color: string }[] }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--soft)]">
      {parts.map((p, i) => <i key={i} className="block h-full transition-[width] duration-300" style={{ width: `${p.pct}%`, background: p.color }} />)}
    </div>
  );
}
