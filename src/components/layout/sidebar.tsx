"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Icon, type IconName } from "@/components/ui/icons";

export interface SidebarItem {
  label?: string;
  labelKey?: string;
  id?: string;
  icon?: IconName;
  textKey?: string;
  href?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  active?: string;
}

export const citizenSidebar: SidebarItem[] = [
  { labelKey: "sidebar.gandhiai" },
  { id: "home", icon: "home", textKey: "sidebar.home", href: "/dashboard" },
  { id: "ask", icon: "chat", textKey: "sidebar.askGandhi", href: "/dashboard/ask" },
  { id: "docs", icon: "doc", textKey: "sidebar.myDocuments", href: "/dashboard/drafter" },
  { id: "scanner", icon: "camera", textKey: "sidebar.scanDocument", href: "/dashboard/scanner" },
  { labelKey: "sidebar.learn" },
  { id: "guides", icon: "shield", textKey: "sidebar.rightsGuides", href: "/dashboard/guides" },
  { id: "dict", icon: "book", textKey: "sidebar.legalDictionary", href: "/dashboard/dictionary" },
  { id: "quiz", icon: "quiz", textKey: "sidebar.rightsQuiz", href: "/dashboard/quiz" },
  { labelKey: "sidebar.help" },
  { id: "aid", icon: "map", textKey: "sidebar.findLegalAid", href: "/dashboard/legal-aid" },
  { id: "sos", icon: "siren", textKey: "sidebar.emergencySOS", href: "/dashboard/sos" },
  { id: "lawyer", icon: "users", textKey: "sidebar.findLawyer", href: "/dashboard/lawyers" },
  { id: "tpl", icon: "template", textKey: "sidebar.templates", href: "/dashboard/templates" },
  { labelKey: "sidebar.account" },
  { id: "sub", icon: "crown", textKey: "sidebar.subscription", href: "/pricing" },
  { id: "set", icon: "cog", textKey: "sidebar.settings", href: "/dashboard/settings" },
];

export const lawyerSidebar: SidebarItem[] = [
  { labelKey: "sidebar.practice" },
  { id: "home", icon: "home", textKey: "sidebar.home", href: "/advocate" },
  { id: "draft", icon: "edit", textKey: "sidebar.documentDrafter", href: "/advocate/drafter" },
  { id: "case", icon: "search", textKey: "sidebar.caseLawResearch", href: "/advocate/case-law" },
  { id: "acts", icon: "book", textKey: "sidebar.bareActs", href: "/advocate/bare-acts" },
  { id: "arg", icon: "scale", textKey: "sidebar.argumentBuilder", href: "/advocate/arguments" },
  { id: "tpl", icon: "template", textKey: "sidebar.templateLibrary", href: "/dashboard/templates" },
  { id: "docs", icon: "doc", textKey: "sidebar.myDocuments", href: "/advocate/drafter" },
  { labelKey: "sidebar.marketplace" },
  { id: "profile", icon: "user", textKey: "sidebar.myProfile", href: "/advocate" },
  { id: "req", icon: "bell", textKey: "sidebar.consultationRequests", href: "/advocate" },
  { labelKey: "sidebar.account" },
  { id: "sub", icon: "crown", textKey: "sidebar.subscription", href: "/pricing" },
  { id: "set", icon: "cog", textKey: "sidebar.settings", href: "/dashboard/settings" },
];

export function Sidebar({ items, active }: SidebarProps) {
  const { t } = useI18n();

  return (
    <nav className="w-60 flex-shrink-0 bg-paper border-r border-ink-100 py-[18px] px-3 min-h-full">
      {items.map((item, i) =>
        item.labelKey ? (
          <div
            key={i}
            className="text-ink-400 text-[11px] uppercase tracking-[0.08em] px-2.5 pt-3.5 pb-1.5 font-semibold"
          >
            {t(item.labelKey)}
          </div>
        ) : (
          <Link
            key={i}
            href={item.href || "#"}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium no-underline transition-colors mb-0.5 ${
              active === item.id
                ? "bg-navy-50 text-navy-800 font-semibold"
                : "text-ink-700 hover:bg-ink-50"
            }`}
          >
            {item.icon && <Icon name={item.icon} size={16} />}
            {item.textKey && t(item.textKey)}
          </Link>
        )
      )}
    </nav>
  );
}
