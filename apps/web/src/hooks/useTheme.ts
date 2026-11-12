"use client";

import { useCallback, useEffect, useState } from "react";

function apply(dark: boolean) {
  const root = document.documentElement;
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.classList.toggle("dark", dark);
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dc_theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = (saved || (prefers ? "dark" : "light")) === "dark";
    setIsDark(dark);
    apply(dark);
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.add("theme-transitioning");
    apply(next);
    try {
      localStorage.setItem("dc_theme", next ? "dark" : "light");
    } catch {}
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 280);
  }, [isDark]);

  return { isDark, toggle };
}
