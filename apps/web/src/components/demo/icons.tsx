import React from "react";

const PATHS: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  box: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
  truck: <><path d="M2 6h11v10H2zM13 10h5l3 3v3h-8" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  doc: <path d="M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  alert: <path d="M12 3 2 20h20zM12 10v4M12 17v.01" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 3-6 6-6s6 2 6 6M17 5a3 3 0 0 1 0 6M21 20c0-3-1.5-5-4-5.5" /></>,
  wh: <><path d="M3 9 12 3l9 6v12H3z" /><path d="M8 21v-7h8v7" /></>,
  cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M3 4h3l2.5 11h10L21 7H7" /></>,
  tag: <><path d="M3 12V3h9l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  inbox: <path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01" /></>,
};

export function DIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  return (
    <svg aria-hidden className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
