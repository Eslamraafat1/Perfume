"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useSiteContent } from "./SiteContentContext";

export type Lang = "en" | "ar";

interface LanguageContextValue {
  lang: Lang;
  isRTL: boolean;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const { get: sc } = useSiteContent();

  /* Sync <html> attributes when language changes */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const t = useCallback(
    (key: string): string => {
      // Use the translated key from SiteContentContext (e.g. en_nav_home)
      const val = sc(`${lang}_${key}`);
      // Fallback: If not found, it might just return empty string if default is missing, 
      // but defaults are now comprehensive. Still, we can fallback to the english one if arabic is missing, or just return the key.
      if (val) return val;
      const enVal = sc(`en_${key}`);
      if (enVal) return enVal;
      return key;
    },
    [lang, sc]
  );

  return (
    <LanguageContext.Provider value={{ lang, isRTL: lang === "ar", toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
