"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from "react";
import { createI18n } from "lino-i18n";
import { catalogues, type Locale, type TranslationKey } from "./generated/catalogues";

export type { Locale, TranslationKey };

export interface LocaleOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", shortLabel: "EN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳", shortLabel: "हिं" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳", shortLabel: "বা" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳", shortLabel: "ಕ" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳", shortLabel: "म" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳", shortLabel: "த" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳", shortLabel: "తె" },
];

const localeCodes = new Set<Locale>(SUPPORTED_LOCALES.map((locale) => locale.code));
const runtimeCatalogues = catalogues as unknown as Record<string, Record<string, string>>;

function isLocale(value: string | null): value is Locale {
  return Boolean(value && localeCodes.has(value as Locale));
}

interface I18nContextType {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const i18n = useMemo(
    () =>
      createI18n({
        locales: runtimeCatalogues,
        defaultLocale: "en",
        fallback: ["en"],
        compatibilityAliases: ["collapseTail", "parentLabel"],
      }),
    []
  );
  const [lang, setLangState] = useState<Locale>("en");

  const setLang = useCallback(
    (l: Locale) => {
      i18n.setLocale(l);
      setLangState(l);
      localStorage.setItem("satyavera-lang", l);
      document.documentElement.lang = l;
    },
    [i18n]
  );

  useEffect(() => {
    const saved = localStorage.getItem("satyavera-lang");
    if (isLocale(saved)) {
      queueMicrotask(() => setLang(saved));
    }
  }, [setLang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return i18n.t(key, params, { locale: lang });
    },
    [i18n, lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Inline localized text component for simple copy that is not in the catalog. */
export function T(props: { en: string } & Partial<Record<Exclude<Locale, "en">, string>>) {
  const { lang } = useI18n();
  return <>{props[lang] ?? props.en}</>;
}
