"use client";

import { useI18n } from "@/lib/i18n/context";
import { useDictionary } from "@/hooks/use-dictionary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const dictionaryCategories = [
  { label: "All Categories", value: "" },
  { label: "Criminal Law", value: "Criminal Law" },
  { label: "Constitutional Law", value: "Constitutional Law" },
  { label: "Property Law", value: "Property Law" },
  { label: "Family Law", value: "Family Law" },
  { label: "Contract Law", value: "Contract Law" },
  { label: "Consumer Law", value: "Consumer Law" },
  { label: "Labour Law", value: "Labour Law" },
];

export default function DictionaryPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("M");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("");

  const { entries, loading, error } = useDictionary(
    searchQuery ? undefined : activeLetter,
    activeCategory || undefined,
    searchQuery || undefined,
  );

  // Auto-select first term when data arrives
  const effectiveSelectedId =
    selectedTermId && entries.some((e) => e.id === selectedTermId)
      ? selectedTermId
      : entries[0]?.id || null;

  const selectedTerm = entries.find((e) => e.id === effectiveSelectedId) || null;

  const chipVariant = (category: string) => {
    switch (category) {
      case "Criminal Law":
        return "red" as const;
      case "Family Law":
        return "saffron" as const;
      case "Property Law":
        return "green" as const;
      default:
        return "navy" as const;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
          Legal Dictionary
        </h1>
        <p className="text-sm text-ink-500">
          Legal terms explained in plain language with examples
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mb-4">
        <Icon
          name="search"
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          className="w-full border border-ink-200 bg-white rounded-lg py-3 pl-10 pr-4 text-sm font-sans outline-none focus:border-navy-500 transition-colors"
          placeholder="Search for a legal term... e.g., habeas corpus, bail, FIR"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Alphabet Browser */}
      <div className="flex gap-0.5 flex-wrap mb-6">
        {alphabet.map((letter) => (
          <button
            key={letter}
            className={`w-8 h-8 rounded text-xs font-semibold cursor-pointer transition-colors ${
              activeLetter === letter && !searchQuery
                ? "bg-navy-700 text-white"
                : "bg-white border border-ink-100 text-ink-600 hover:bg-navy-50 hover:text-navy-700"
            }`}
            onClick={() => {
              setActiveLetter(letter);
              setSearchQuery("");
              setSelectedTermId(null);
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Main content: Terms + Category Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Term Cards */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-700">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : `Showing terms starting with "${activeLetter}"`}
            </p>
            <span className="text-xs text-ink-400">
              {loading ? "..." : `${entries.length} terms`}
            </span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <div className="h-5 w-1/3 bg-ink-100 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-ink-50 rounded animate-pulse" />
                    <div className="h-3 w-full bg-ink-50 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-ink-50 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <Card className="p-6 text-center mb-6">
              <p className="text-sm text-red-600 mb-2">Failed to load dictionary terms</p>
              <p className="text-xs text-ink-400">{error}</p>
            </Card>
          )}

          {/* Empty state */}
          {!loading && !error && entries.length === 0 && (
            <Card className="p-6 text-center mb-6">
              <p className="text-sm text-ink-500">
                {searchQuery
                  ? `No terms found matching "${searchQuery}".`
                  : `No terms found starting with "${activeLetter}".`}
              </p>
            </Card>
          )}

          {/* Term grid */}
          {!loading && entries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {entries.map((term) => (
                <Card
                  key={term.id}
                  className={`p-4 cursor-pointer transition-all ${
                    effectiveSelectedId === term.id
                      ? "ring-2 ring-navy-500 shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedTermId(term.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-navy-900">
                        {term.termEn}
                      </h3>
                      {term.pronunciation && (
                        <p className="text-[11px] text-ink-400 italic">
                          {term.pronunciation}
                        </p>
                      )}
                    </div>
                    <Chip
                      variant={chipVariant(term.category)}
                      className="text-[9px] flex-shrink-0"
                    >
                      {term.category}
                    </Chip>
                  </div>
                  <p className="text-[12px] text-ink-600 leading-relaxed line-clamp-3 mb-2">
                    {term.definitionEn}
                  </p>
                  {term.origin && (
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-400">
                      <span className="bg-ink-50 px-1.5 py-0.5 rounded">
                        Origin: {term.origin}
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Selected Term Detail */}
          {selectedTerm && (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-serif font-bold text-xl text-navy-900">
                    {selectedTerm.termEn}
                  </h2>
                  <p className="text-sm text-ink-400 italic">
                    {selectedTerm.pronunciation
                      ? `${selectedTerm.pronunciation} \u00B7 `
                      : ""}
                    {selectedTerm.origin || ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Icon name="bookmark" size={13} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="sparkles" size={13} />
                    Ask AI
                  </Button>
                </div>
              </div>

              <Chip variant="navy" className="text-[10px] mb-4">
                {selectedTerm.category}
              </Chip>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-ink-500 uppercase mb-1.5">
                  Definition
                </h4>
                <p className="text-[13px] text-ink-800 leading-relaxed">
                  {selectedTerm.definitionEn}
                </p>
                {selectedTerm.definitionHi && (
                  <p className="text-[12px] text-ink-500 leading-relaxed mt-1 italic">
                    {selectedTerm.definitionHi}
                  </p>
                )}
              </div>

              {selectedTerm.exampleEn && (
                <div className="bg-navy-50 border border-navy-100 rounded-lg p-4 mb-4">
                  <h4 className="text-xs font-semibold text-navy-700 mb-1.5">
                    Example
                  </h4>
                  <p className="text-[12.5px] text-navy-800 leading-relaxed italic">
                    &ldquo;{selectedTerm.exampleEn}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedTerm.relatedSections &&
                  selectedTerm.relatedSections.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase mb-2">
                        Relevant Sections
                      </h4>
                      <div className="space-y-1.5">
                        {selectedTerm.relatedSections.map((section) => (
                          <div
                            key={section}
                            className="flex items-center gap-2 text-[12px] text-navy-700"
                          >
                            <Icon name="doc" size={11} />
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {selectedTerm.relatedTerms &&
                  selectedTerm.relatedTerms.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase mb-2">
                        Related Terms
                      </h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedTerm.relatedTerms.map((rt) => (
                          <Chip
                            key={rt}
                            variant="default"
                            className="text-[10px] cursor-pointer hover:bg-ink-100"
                          >
                            {rt}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          )}
        </div>

        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {dictionaryCategories.map((cat) => (
                <button
                  key={cat.label}
                  className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] cursor-pointer transition-colors flex items-center justify-between ${
                    activeCategory === cat.value
                      ? "bg-navy-50 text-navy-700 font-semibold"
                      : "text-ink-700 hover:bg-ink-50"
                  }`}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    setSelectedTermId(null);
                  }}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-ink-100 mt-4 pt-4">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                Word of the Day
              </h3>
              <div className="bg-saffron-50 border border-saffron-100 rounded-lg p-3">
                <p className="font-serif font-bold text-saffron-800 text-sm">
                  Habeas Corpus
                </p>
                <p className="text-[10px] text-saffron-600 italic mb-1">
                  /hey-bee-uhs kawr-puhs/
                </p>
                <p className="text-[11px] text-saffron-700 leading-relaxed">
                  A writ requiring a person under arrest to be brought before a judge,
                  used to ensure imprisonment is not illegal.
                </p>
              </div>
            </div>

            <div className="border-t border-ink-100 mt-4 pt-4">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                Recently Viewed
              </h3>
              <div className="space-y-1.5">
                {["Bail", "Cognizable Offence", "FIR", "Writ"].map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-2 text-[12px] text-ink-600 cursor-pointer hover:text-navy-700"
                  >
                    <Icon name="book" size={11} className="text-ink-400" />
                    {term}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
