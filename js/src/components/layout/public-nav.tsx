"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { LangToggle } from "@/components/ui/lang-toggle";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/assets";

interface PublicNavProps {
  active?: string;
}

const navItems = [
  { id: "home", key: "nav.home", href: "/" },
  { id: "features", key: "nav.features", href: "/#features" },
  { id: "lawyers", key: "nav.forLawyers", href: "/#lawyers" },
  { id: "pricing", key: "nav.pricing", href: "/pricing" },
  { id: "about", key: "nav.about", href: "/#about" },
];

export function PublicNav({ active = "home" }: PublicNavProps) {
  const { t } = useI18n();

  return (
    <nav className="flex items-center gap-7 px-8 bg-paper border-b border-ink-100 h-16 sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src={assetPath("/logo.svg")}
          alt="SatyaVera"
          width={32}
          height={32}
          className="object-contain"
          unoptimized
        />
        <span className="font-serif font-semibold text-lg text-navy-900 tracking-[0.2px]">
          Satya<span className="text-saffron-600">Vera</span>
        </span>
      </Link>

      <ul className="hidden md:flex gap-6 list-none p-0 m-0">
        {navItems.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`text-sm font-medium no-underline transition-colors ${
                active === item.id ? "text-navy-700" : "text-ink-700 hover:text-navy-700"
              }`}
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>

      <div className="ml-auto flex items-center gap-3">
        <LangToggle />
        <Link href="/login">
          <Button variant="ghost" size="sm">{t("common.login")}</Button>
        </Link>
        <Link href="/signup">
          <Button variant="primary" size="sm">{t("common.signUp")}</Button>
        </Link>
      </div>
    </nav>
  );
}
