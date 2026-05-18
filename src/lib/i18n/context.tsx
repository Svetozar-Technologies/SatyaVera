"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import en from "./translations/en.json";
import hi from "./translations/hi.json";

export type Locale = "en" | "hi";

export interface LocaleOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
];

const translations: Record<Locale, typeof en> = { en, hi };

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`
      : never
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

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
  const [lang, setLangState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("satyavera-lang") as Locale | null;
    if (saved && (saved === "en" || saved === "hi")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    localStorage.setItem("satyavera-lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split(".");
      let value: unknown = translations[lang];
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // fallback to English
          let fallback: unknown = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else {
              return key; // key not found
            }
          }
          value = fallback;
          break;
        }
      }

      if (typeof value !== "string") return key;

      if (params) {
        let result = value;
        for (const [paramKey, paramValue] of Object.entries(params)) {
          result = result.replace(`{${paramKey}}`, String(paramValue));
        }
        return result;
      }

      return value;
    },
    [lang]
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

/** Inline bilingual text component — shortcut for simple en/hi pairs */
export function T({ en, hi }: { en: string; hi: string }) {
  const { lang } = useI18n();
  return <>{lang === "hi" ? hi : en}</>;
}
