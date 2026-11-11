"use client";

import React, { useState, useEffect } from "react";
import { ShieldIcon, SunIcon, MoonIcon } from "./Icons";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dc_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved || (prefersDark ? "dark" : "light");
    const darkActive = initialTheme === "dark";
    setIsDark(darkActive);
    document.documentElement.setAttribute("data-theme", initialTheme);
    document.documentElement.classList.toggle("dark", darkActive);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    const themeName = next ? "dark" : "light";
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", themeName);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dc_theme", themeName);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--bd)] bg-[var(--card)] px-6 py-4 backdrop-blur-md transition-colors">
      <a href="#home" className="flex items-center gap-2.5 font-black text-xl sm:text-2xl font-heading text-[var(--tx)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bl)] text-[var(--act)] shadow-sm">
          <ShieldIcon className="w-5 h-5" />
        </span>
        DistribuCore
      </a>

      <nav className="hidden md:flex items-center gap-8 text-sm sm:text-base font-semibold text-[var(--mu)]">
        <a href="#fitur" className="hover:text-[var(--tx)] transition-colors">Modul</a>
        <a href="#alur" className="hover:text-[var(--tx)] transition-colors">Alur Kerja</a>
        <a href="#peran" className="hover:text-[var(--tx)] transition-colors">Untuk Siapa</a>
        <a href="#harga" className="hover:text-[var(--tx)] transition-colors">Harga</a>
        <a href="#faq" className="hover:text-[var(--tx)] transition-colors">FAQ</a>
        <a href="#kontak" className="hover:text-[var(--tx)] transition-colors">Kontak</a>
      </nav>

      <div className="flex items-center gap-3.5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] hover:bg-[var(--soft)] transition-colors"
        >
          {isDark ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
        </button>

        <a
          href="#coba"
          className="rounded-lg bg-[var(--bl)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--act)] shadow-sm hover:opacity-90 transition-opacity"
        >
          Coba Demo
        </a>
      </div>
    </header>
  );
}
