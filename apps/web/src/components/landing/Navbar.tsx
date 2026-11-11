"use client";

import React, { useState, useEffect } from "react";
import { ShieldIcon, SunIcon, MoonIcon } from "./Icons";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dc_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dc_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dc_theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors">
      <a href="#home" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
          <ShieldIcon className="w-4 h-4" />
        </span>
        DistribuCore
      </a>

      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <a href="#fitur" className="hover:text-blue-600 dark:hover:text-white transition-colors">Modul</a>
        <a href="#alur" className="hover:text-blue-600 dark:hover:text-white transition-colors">Alur Kerja</a>
        <a href="#peran" className="hover:text-blue-600 dark:hover:text-white transition-colors">Untuk Siapa</a>
        <a href="#harga" className="hover:text-blue-600 dark:hover:text-white transition-colors">Harga</a>
        <a href="#faq" className="hover:text-blue-600 dark:hover:text-white transition-colors">FAQ</a>
        <a href="#kontak" className="hover:text-blue-600 dark:hover:text-white transition-colors">Kontak</a>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-600" />}
        </button>

        <a
          href="#coba"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Coba Demo
        </a>
      </div>
    </header>
  );
}
