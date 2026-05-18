"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card } from "./card";
import Link from "next/link";

interface UsageBarProps {
  used: number;
  total: number;
}

export function UsageBar({ used, total }: UsageBarProps) {
  const { t } = useI18n();
  const pct = (used / total) * 100;
  const remaining = total - used;

  return (
    <Card className="p-3.5">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[13px]">
          {t("dashboard.queriesLeft", { remaining: String(remaining), total: String(total) })}
        </span>
        <Link href="/pricing" className="text-navy-700 font-semibold text-xs hover:underline">
          {t("common.upgrade")}
        </Link>
      </div>
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full bg-saffron-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </Card>
  );
}
