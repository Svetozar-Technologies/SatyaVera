"use client";

import Link from "next/link";
import Image from "next/image";
import { SUPPORTED_LOCALES, useI18n } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useI18n();

  const columns = [
    {
      titleKey: "footer.product",
      items: [
        { key: "footer.askGandhi", href: "/dashboard/ask" },
        { key: "footer.rightsGuides", href: "/dashboard/guides" },
        { key: "footer.documentDrafter", href: "/dashboard/drafter" },
        { key: "footer.forLawyers", href: "/signup" },
      ],
    },
    {
      titleKey: "footer.company",
      items: [
        { key: "footer.aboutUs", href: "#" },
        { key: "footer.careers", href: "#" },
        { key: "footer.blog", href: "#" },
        { key: "footer.press", href: "#" },
      ],
    },
    {
      titleKey: "footer.legal",
      items: [
        { key: "footer.privacyPolicy", href: "#" },
        { key: "footer.termsOfService", href: "#" },
        { key: "footer.disclaimerLink", href: "#" },
        { key: "footer.contact", href: "#" },
      ],
    },
  ];

  return (
    <footer className="px-6 md:px-20 pt-10 pb-7 bg-ink-50 border-t border-ink-100">
      <div className="flex flex-col md:flex-row gap-12 justify-between max-w-7xl mx-auto mb-6">
        <div className="flex flex-col gap-3 max-w-[280px]">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="SatyaVera" width={28} height={28} />
            <span className="font-serif font-semibold text-base text-navy-900">
              Satya<span className="text-saffron-600">Vera</span>
            </span>
          </Link>
          <p className="text-ink-500 text-sm m-0">{t("common.tagline")}</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
            {SUPPORTED_LOCALES.map((locale, index) => (
              <span key={locale.code} className="inline-flex items-center gap-2">
                <span className="font-semibold">{locale.shortLabel}</span>
                {index < SUPPORTED_LOCALES.length - 1 && <span className="text-ink-300">·</span>}
              </span>
            ))}
          </div>
        </div>

        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-2 min-w-[140px]">
            <div className="text-[11px] uppercase tracking-[0.08em] text-ink-400 font-bold">
              {t(col.titleKey)}
            </div>
            {col.items.map((item, j) => (
              <Link key={j} href={item.href} className="text-sm text-ink-700 no-underline hover:text-navy-700">
                {t(item.key)}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="text-[11px] text-ink-500 border-t border-ink-100 pt-4 max-w-7xl mx-auto">
        {t("common.copyright")} · {t("common.disclaimer")}
      </div>
    </footer>
  );
}
