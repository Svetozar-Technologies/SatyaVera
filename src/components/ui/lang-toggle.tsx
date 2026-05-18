"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/context";
import { Icon } from "./icons";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = SUPPORTED_LOCALES.find((l) => l.code === lang) || SUPPORTED_LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-50 border border-ink-100 rounded-full text-xs font-semibold cursor-pointer hover:bg-ink-100 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.nativeLabel}</span>
        <Icon name="chevD" size={12} className="text-ink-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-ink-100 rounded-lg shadow-sh-2 py-1 min-w-[180px] z-50">
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale.code}
              onClick={() => { setLang(locale.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-ink-50 transition-colors cursor-pointer ${
                lang === locale.code ? "bg-navy-50 text-navy-700 font-semibold" : "text-ink-700"
              }`}
            >
              <span className="text-lg">{locale.flag}</span>
              <div className="flex flex-col items-start leading-tight">
                <span>{locale.nativeLabel}</span>
                <span className="text-[10px] text-ink-400">{locale.label}</span>
              </div>
              {lang === locale.code && <Icon name="check" size={14} className="ml-auto text-navy-700" />}
            </button>
          ))}
          <div className="border-t border-ink-100 mt-1 pt-1 px-3 py-1.5">
            <span className="text-[10px] text-ink-400 italic">
              தமிழ் · मराठी · বাংলা · ಕನ್ನಡ (coming soon)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Simple pill toggle for compact use (nav bars) */
export function LangPill() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center p-1 bg-ink-50 rounded-full border border-ink-100 text-xs">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
          lang === "en" ? "bg-navy-700 text-white" : "text-ink-500 hover:text-ink-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
          lang === "hi" ? "bg-navy-700 text-white" : "text-ink-500 hover:text-ink-700"
        }`}
      >
        हिं
      </button>
    </div>
  );
}
