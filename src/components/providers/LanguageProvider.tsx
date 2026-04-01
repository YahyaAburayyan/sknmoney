"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, createT, translations } from "@/lib/i18n/translations";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: ReturnType<typeof createT>;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: createT("en"),
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read from cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
    const saved = (match?.[1] as Lang) ?? "en";
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
      applyDir(saved);
    }
  }, []);

  function applyDir(l: Lang) {
    const dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = l;
  }

  function setLang(l: Lang) {
    setLangState(l);
    document.cookie = `lang=${l};path=/;max-age=31536000`;
    applyDir(l);
  }

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const t = createT(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
