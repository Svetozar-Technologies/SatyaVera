"use client";

import { useI18n } from "@/lib/i18n/context";
import { useGuides } from "@/hooks/use-guides";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const categories = [
  { label: "All", value: "all" },
  { label: "Criminal Law", value: "criminal" },
  { label: "Property & Rent", value: "property" },
  { label: "Consumer Rights", value: "consumer" },
  { label: "Women & Family", value: "women" },
  { label: "Employment", value: "employment" },
  { label: "RTI & Government", value: "rti" },
];

export default function GuidesPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { guides, loading, error } = useGuides(activeCategory);

  // Auto-select first guide when data arrives and nothing is selected yet
  const effectiveSelectedId =
    selectedId && guides.some((g) => g.id === selectedId)
      ? selectedId
      : guides[0]?.id || null;

  const selectedGuide = guides.find((g) => g.id === effectiveSelectedId) || null;

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
          Know Your Rights
        </h1>
        <p className="text-sm text-ink-500">
          Step-by-step guides to help you understand and exercise your legal rights
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <Chip
            key={cat.value}
            variant={activeCategory === cat.value ? "navy" : "default"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setActiveCategory(cat.value);
              setSelectedId(null);
            }}
          >
            {cat.label}
          </Chip>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-ink-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-ink-100 rounded animate-pulse" />
                    <div className="h-2 w-full bg-ink-50 rounded animate-pulse" />
                    <div className="h-2 w-1/2 bg-ink-50 rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-1/3 bg-ink-100 rounded animate-pulse" />
                <div className="h-6 w-2/3 bg-ink-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-ink-50 rounded animate-pulse" />
                <div className="h-32 w-full bg-ink-50 rounded animate-pulse mt-4" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card className="p-6 text-center">
          <p className="text-sm text-red-600 mb-2">Failed to load guides</p>
          <p className="text-xs text-ink-400">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && guides.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-ink-500">No guides found for this category.</p>
        </Card>
      )}

      {/* Two-column layout */}
      {!loading && !error && guides.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Guide List (Left) */}
          <div className="lg:col-span-2 space-y-3">
            {guides.map((guide) => (
              <Card
                key={guide.id}
                className={`p-4 cursor-pointer transition-all ${
                  effectiveSelectedId === guide.id
                    ? "ring-2 ring-navy-500 shadow-md"
                    : "hover:shadow-sm"
                }`}
                onClick={() => setSelectedId(guide.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={(guide.icon as "shield" | "home" | "flag" | "heart" | "book") || "book"}
                      size={16}
                      className="text-navy-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[13px] text-ink-900 mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-[11px] text-ink-500 mb-2 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-ink-400">
                      {guide.readTime && (
                        <span className="flex items-center gap-1">
                          <Icon name="book" size={10} /> {guide.readTime} read
                        </span>
                      )}
                      {guide.readCount != null && (
                        <span className="flex items-center gap-1">
                          <Icon name="eye" size={10} />{" "}
                          {guide.readCount >= 1000
                            ? `${(guide.readCount / 1000).toFixed(1)}K`
                            : guide.readCount}{" "}
                          readers
                        </span>
                      )}
                    </div>
                    {guide.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {guide.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-ink-50 text-ink-500 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Selected Guide Detail (Right) */}
          <div className="lg:col-span-3">
            {selectedGuide ? (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Chip variant="navy" className="text-[10px]">
                    {selectedGuide.category}
                  </Chip>
                  {selectedGuide.readTime && (
                    <span className="text-[10px] text-ink-400">
                      {selectedGuide.readTime} read
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-serif font-bold text-navy-900 mb-1">
                  {selectedGuide.title}
                </h2>
                <p className="text-[11px] text-ink-500 mb-5">
                  {selectedGuide.description}
                </p>

                {/* Your Rights */}
                {selectedGuide.rights && selectedGuide.rights.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                    <h3 className="font-semibold text-sm text-green-800 mb-3 flex items-center gap-2">
                      <Icon name="shield" size={14} />
                      Your Rights
                    </h3>
                    <ul className="space-y-2">
                      {selectedGuide.rights.map((right, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[12.5px] text-green-800"
                        >
                          <Icon
                            name="check"
                            size={12}
                            className="text-green-600 mt-0.5 flex-shrink-0"
                          />
                          {right}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Step-by-Step */}
                {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                  <>
                    <h3 className="font-semibold text-sm text-ink-900 mb-3">
                      What To Do: Step by Step
                    </h3>
                    <div className="space-y-4 mb-6">
                      {selectedGuide.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-navy-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-[13px] text-ink-900 mb-0.5">
                              {step.title}
                            </p>
                            <p className="text-[12.5px] text-ink-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Full content if available */}
                {selectedGuide.content && !selectedGuide.steps?.length && (
                  <div className="prose prose-sm max-w-none mb-6 text-[13px] text-ink-700 leading-relaxed whitespace-pre-line">
                    {selectedGuide.content}
                  </div>
                )}

                {/* CTA */}
                <div className="border-t border-ink-100 pt-5">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" size="sm">
                      <Icon name="download" size={14} />
                      Download PDF
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="bookmark" size={14} />
                      Save Guide
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="sparkles" size={14} />
                      Ask GandhiAI About This
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-sm text-ink-400">
                  Select a guide from the list to view its details.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
