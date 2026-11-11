"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldIcon, SunIcon, MoonIcon } from "./Icons";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.setAttribute("data-theme", themeName);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dc_theme", themeName);
    } catch {}

    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 280);
  };

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between border-b border-[var(--bd)] px-6 backdrop-blur-md transition-all duration-300 ${scrolled ? "py-3 bg-[var(--card)]/90 shadow-sm" : "py-4 bg-[var(--card)]/75"}`}>
      <div
        className="absolute bottom-0 left-0 h-[2.5px] bg-[var(--bl)] transition-[width] duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <a href="#home" className="flex items-center gap-3 group">
        <Image
          src="/Logo.png"
          alt="DistribuCore"
          width={176}
          height={32}
          className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          priority
        />
        <span className="sr-only">DistribuCore</span>
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
          className="group flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] hover:bg-[var(--soft)] active:scale-95 transition-all"
        >
          {isDark ? (
            <SunIcon className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <MoonIcon className="w-4 h-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
          )}
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
