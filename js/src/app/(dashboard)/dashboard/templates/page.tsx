"use client";

import { useI18n } from "@/lib/i18n/context";
import { useTemplates } from "@/hooks/use-templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const categories = [
  { label: "All", value: "all" },
  { label: "FIR & Police", value: "fir" },
  { label: "RTI", value: "rti" },
  { label: "Consumer", value: "consumer" },
  { label: "Property", value: "property" },
  { label: "Employment", value: "employment" },
  { label: "Family", value: "family" },
  { label: "Legal Notices", value: "notices" },
  { label: "Affidavits", value: "affidavits" },
];

export default function TemplatesPage() {
  const { t, lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { templates, loading, error } = useTemplates(activeCategory);

  const searched = searchQuery
    ? templates.filter(
        (tpl) =>
          (lang === "hi" ? tpl.nameHi : tpl.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (lang === "hi" ? tpl.descriptionHi : tpl.description)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : templates;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
            {t("templates.title")}
          </h1>
          <p className="text-sm text-ink-500">
            {t("templates.subtitle")}
          </p>
        </div>
        <Chip variant="saffron" className="text-[11px]">
          <Icon name="lock" size={11} />
          {templates.filter((tpl) => tpl.premium).length} {t("common.premium")} {t("templates.title")}
        </Chip>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-4">
        <Icon
          name="search"
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          className="w-full border border-ink-200 bg-white rounded-lg py-2.5 pl-10 pr-4 text-sm font-sans outline-none focus:border-navy-500 transition-colors"
          placeholder="Search templates... e.g., FIR, RTI, rent agreement"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <Chip
            key={cat.value}
            variant={activeCategory === cat.value ? "navy" : "default"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </Chip>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-ink-100 mb-3" />
              <div className="w-3/4 h-4 bg-ink-100 rounded mb-2" />
              <div className="w-full h-3 bg-ink-50 rounded mb-1" />
              <div className="w-2/3 h-3 bg-ink-50 rounded mb-3" />
              <div className="w-full h-8 bg-ink-100 rounded" />
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="p-6 text-center">
          <Icon name="info" size={24} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-ink-600 mb-3">{t("ask.error")} {error}</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      )}

      {/* Results count */}
      {!loading && !error && (
        <>
          <p className="text-xs text-ink-400 mb-4">
            Showing {searched.length} template{searched.length !== 1 ? "s" : ""}
            {activeCategory !== "all" && (
              <> in {categories.find((c) => c.value === activeCategory)?.label}</>
            )}
          </p>

          {/* Template Grid 4x3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searched.map((tpl) => (
              <Card
                key={tpl.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              >
                {/* Badge */}
                <div className="absolute top-3 right-3">
                  {tpl.premium ? (
                    <Chip variant="saffron" className="text-[9px]">
                      <Icon name="lock" size={9} />
                      {t("common.premium")}
                    </Chip>
                  ) : (
                    <Chip variant="green" className="text-[9px]">
                      {t("common.free")}
                    </Chip>
                  )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-3">
                  <Icon name={tpl.icon as "flag" | "eye" | "scale" | "home" | "doc" | "heart" | "users" | "paper" | "shield" | "lock"} size={18} className="text-navy-700" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-[13px] text-ink-900 mb-1 pr-16">
                  {lang === "hi" ? tpl.nameHi : tpl.name}
                </h3>
                <p className="text-[11px] text-ink-500 leading-relaxed mb-3 line-clamp-2">
                  {lang === "hi" ? tpl.descriptionHi : tpl.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px] text-ink-400 mb-3">
                  {tpl.downloadCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Icon name="download" size={10} />
                      {tpl.downloadCount >= 1000
                        ? `${(tpl.downloadCount / 1000).toFixed(1)}K`
                        : tpl.downloadCount}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon name="paper" size={10} />
                    {tpl.format}
                  </span>
                </div>

                {/* Action */}
                <Button
                  variant={tpl.premium ? "saffron" : "primary"}
                  size="sm"
                  className="w-full justify-center"
                >
                  {tpl.premium ? (
                    <>
                      <Icon name="lock" size={12} />
                      {t("common.upgrade")}
                    </>
                  ) : (
                    <>
                      <Icon name="download" size={12} />
                      {t("drafter.download")}
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
