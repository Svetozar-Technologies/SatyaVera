"use client";

import { useI18n } from "@/lib/i18n/context";

interface SectionTitleProps {
  titleKey: string;
  subtitleKey?: string;
}

export function SectionTitle({ titleKey, subtitleKey }: SectionTitleProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-1 mb-4">
      <h2 className="font-serif text-[22px] font-semibold text-navy-900">{t(titleKey)}</h2>
      {subtitleKey && <p className="text-ink-500 text-sm">{t(subtitleKey)}</p>}
    </div>
  );
}
