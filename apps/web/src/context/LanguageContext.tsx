"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;
}

export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  id: {
    nav_modules: "Modul",
    nav_workflow: "Alur Kerja",
    nav_personas: "Untuk Siapa",
    nav_pricing: "Harga",
    nav_faq: "FAQ",
    nav_contact: "Kontak",
    nav_demo: "Coba Demo",
  },
  en: {
    nav_modules: "Modules",
    nav_workflow: "Workflow",
    nav_personas: "Personas",
    nav_pricing: "Pricing",
    nav_faq: "FAQ",
    nav_contact: "Contact",
    nav_demo: "Try Demo",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  setLocale: () => {},
  t: (key: string) => TRANSLATIONS.id[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("dc_lang") as Locale;
    if (saved === "id" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    document.documentElement.lang = loc;
    try {
      localStorage.setItem("dc_lang", loc);
    } catch {}
  };

  const t = (key: string) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS.id[key] || key;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
