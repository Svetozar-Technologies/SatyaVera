"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const dictionaryCategories = [
  { label: "All Categories", count: 342 },
  { label: "Criminal Law", count: 87 },
  { label: "Constitutional Law", count: 64 },
  { label: "Property Law", count: 51 },
  { label: "Family Law", count: 43 },
  { label: "Contract Law", count: 38 },
  { label: "Consumer Law", count: 29 },
  { label: "Labour Law", count: 30 },
];

const terms = [
  {
    id: 1,
    term: "Mens Rea",
    pronunciation: "/menz ree-uh/",
    category: "Criminal Law",
    origin: "Latin",
    definition:
      "A guilty mind; the mental element of a person's intention to commit a crime, or knowledge that one's action or lack of action would cause a crime to be committed.",
    example:
      "In a murder trial, the prosecution must prove mens rea — that the accused intended to cause death or knew that their actions were likely to cause death.",
    relatedTerms: ["Actus Reus", "Culpable Homicide", "Criminal Intent"],
    sections: ["IPC Section 299", "IPC Section 300"],
  },
  {
    id: 2,
    term: "Maintenance",
    pronunciation: "/meyn-tuh-nuhns/",
    category: "Family Law",
    origin: "English",
    definition:
      "A legal obligation to provide financial support to a spouse, children, or parents who are unable to maintain themselves. Under Indian law, maintenance can be claimed under multiple statutes.",
    example:
      "After the divorce, the court ordered monthly maintenance of Rs. 25,000 to the wife under Section 125 CrPC.",
    relatedTerms: ["Alimony", "Interim Maintenance", "Section 125 CrPC"],
    sections: ["CrPC Section 125", "Hindu Adoption and Maintenance Act"],
  },
  {
    id: 3,
    term: "Magistrate",
    pronunciation: "/maj-uh-strayt/",
    category: "Constitutional Law",
    origin: "Latin (magistratus)",
    definition:
      "A judicial officer who administers the law, especially one who conducts a court that deals with minor offenses and holds preliminary hearings for more serious ones. In India, magistrates are classified as Judicial Magistrates and Executive Magistrates.",
    example:
      "The accused was produced before the Judicial Magistrate First Class within 24 hours of arrest as mandated by Article 22(2) of the Constitution.",
    relatedTerms: ["Sessions Court", "Judicial Magistrate", "Executive Magistrate"],
    sections: ["CrPC Section 6", "CrPC Section 11"],
  },
  {
    id: 4,
    term: "Mortgage",
    pronunciation: "/mawr-gij/",
    category: "Property Law",
    origin: "Old French (mort gage — dead pledge)",
    definition:
      "The transfer of an interest in specific immoveable property for the purpose of securing the payment of money advanced or to be advanced by way of loan, an existing or future debt, or the performance of an engagement which may give rise to a pecuniary liability.",
    example:
      "The homeowner executed a simple mortgage of his property with the bank to secure a home loan of Rs. 50 lakhs.",
    relatedTerms: ["Mortgagor", "Mortgagee", "Equitable Mortgage", "Foreclosure"],
    sections: ["Transfer of Property Act, Section 58"],
  },
];

export default function DictionaryPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("M");
  const [selectedTerm, setSelectedTerm] = useState(terms[0]);
  const [activeCategory, setActiveCategory] = useState("All Categories");

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="dict" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
              Legal Dictionary
            </h1>
            <p className="text-sm text-ink-500">
              342 legal terms explained in plain language with examples
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
                  activeLetter === letter
                    ? "bg-navy-700 text-white"
                    : "bg-white border border-ink-100 text-ink-600 hover:bg-navy-50 hover:text-navy-700"
                }`}
                onClick={() => setActiveLetter(letter)}
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
                  Showing terms starting with &quot;{activeLetter}&quot;
                </p>
                <span className="text-xs text-ink-400">{terms.length} terms</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {terms.map((term) => (
                  <Card
                    key={term.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTerm.id === term.id
                        ? "ring-2 ring-navy-500 shadow-md"
                        : "hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedTerm(term)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-serif font-bold text-base text-navy-900">
                          {term.term}
                        </h3>
                        <p className="text-[11px] text-ink-400 italic">
                          {term.pronunciation}
                        </p>
                      </div>
                      <Chip
                        variant={
                          term.category === "Criminal Law"
                            ? "red"
                            : term.category === "Family Law"
                            ? "saffron"
                            : term.category === "Property Law"
                            ? "green"
                            : "navy"
                        }
                        className="text-[9px] flex-shrink-0"
                      >
                        {term.category}
                      </Chip>
                    </div>
                    <p className="text-[12px] text-ink-600 leading-relaxed line-clamp-3 mb-2">
                      {term.definition}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-400">
                      <span className="bg-ink-50 px-1.5 py-0.5 rounded">
                        Origin: {term.origin}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Selected Term Detail */}
              {selectedTerm && (
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-serif font-bold text-xl text-navy-900">
                        {selectedTerm.term}
                      </h2>
                      <p className="text-sm text-ink-400 italic">
                        {selectedTerm.pronunciation} &middot; {selectedTerm.origin}
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
                      {selectedTerm.definition}
                    </p>
                  </div>

                  <div className="bg-navy-50 border border-navy-100 rounded-lg p-4 mb-4">
                    <h4 className="text-xs font-semibold text-navy-700 mb-1.5">
                      Example
                    </h4>
                    <p className="text-[12.5px] text-navy-800 leading-relaxed italic">
                      &ldquo;{selectedTerm.example}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase mb-2">
                        Relevant Sections
                      </h4>
                      <div className="space-y-1.5">
                        {selectedTerm.sections.map((section) => (
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
                        activeCategory === cat.label
                          ? "bg-navy-50 text-navy-700 font-semibold"
                          : "text-ink-700 hover:bg-ink-50"
                      }`}
                      onClick={() => setActiveCategory(cat.label)}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[10px] text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">
                        {cat.count}
                      </span>
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
        </main>
      </div>
    </div>
  );
}
