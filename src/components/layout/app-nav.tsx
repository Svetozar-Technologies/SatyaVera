"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { LangToggle } from "@/components/ui/lang-toggle";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";

interface AppNavProps {
  role: "citizen" | "lawyer";
  name: string;
}

export function AppNav({ role, name }: AppNavProps) {
  const { t } = useI18n();

  return (
    <nav className="flex items-center gap-7 px-8 bg-paper border-b border-ink-100 h-16 sticky top-0 z-40">
      <Link href={role === "lawyer" ? "/advocate" : "/dashboard"} className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="SatyaVera" width={32} height={32} className="object-contain" />
        <span className="font-serif font-semibold text-lg text-navy-900 tracking-[0.2px]">
          Satya<span className="text-saffron-600">Vera</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 ml-6">
        <Chip variant="navy" className="font-semibold">
          {role === "lawyer" ? t("common.advocate") : t("common.citizen")}
        </Chip>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative flex items-center">
          <Icon name="search" size={14} className="absolute left-2.5 text-ink-400 pointer-events-none" />
          <input
            className="border border-ink-100 bg-ink-50 rounded-md py-1.5 pl-8 pr-3 w-60 text-[13px] font-sans outline-none focus:border-navy-500"
            placeholder={t("common.search") + " bare acts, cases, terms…"}
          />
        </div>

        <LangToggle />

        <button className="p-1.5 rounded-md hover:bg-ink-50 transition-colors cursor-pointer">
          <Icon name="bell" size={16} className="text-ink-500" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-saffron-100 text-saffron-700 font-bold text-[13px] flex items-center justify-center">
            {name[0].toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[13px]">{name}</span>
            <span className="text-[11px] text-ink-500">
              {role === "lawyer" ? "Adv. · Verified" : "Delhi"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
