"use client";

import { useI18n } from "@/lib/i18n/context";
import { Icon } from "@/components/ui/icons";

export function DisclaimerBanner() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-bone border-t border-ink-100 text-xs text-ink-500">
      <Icon name="info" size={14} className="text-saffron-600 flex-shrink-0" />
      <span>{t("common.disclaimer")}</span>
    </div>
  );
}
