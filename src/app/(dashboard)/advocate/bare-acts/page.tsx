"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";
import { useApi } from "@/hooks/use-api";
import type { LawDoc, LawSectionDoc } from "@/lib/firebase/firestore";

const CATEGORIES = [
  { id: "all", label: "All" }, { id: "criminal", label: "Criminal" }, { id: "constitutional", label: "Constitutional" },
  { id: "civil", label: "Civil" }, { id: "property", label: "Property" }, { id: "family", label: "Family" },
  { id: "labour", label: "Labour" }, { id: "consumer", label: "Consumer" }, { id: "women", label: "Women" },
  { id: "corporate", label: "Corporate" }, { id: "tax", label: "Tax" }, { id: "environment", label: "Environment" },
  { id: "cyber", label: "Cyber" }, { id: "general", label: "General" },
];

type LawWithMeta = LawDoc & { id: string; categories?: string[]; primaryCategory?: string };
type SectionWithId = LawSectionDoc & { id: string };

export default function BareActsPage() {
  const { t } = useI18n();
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch laws via API route
  const lawsUrl = "/api/laws" + (activeCategory !== "all" ? `?category=${activeCategory}` : "");
  const { data: lawsData, loading } = useApi<{ laws: LawWithMeta[] }>(lawsUrl);
  const laws = lawsData?.laws ?? [];

  // Fetch sections via API route when a law is selected
  const sectionsUrl = selectedLaw ? `/api/laws/${selectedLaw}/sections` : null;
  const { data: sectionsData, loading: sectionsLoading } = useApi<{ sections: SectionWithId[] }>(sectionsUrl);
  const sections = sectionsData?.sections ?? [];

  // Auto-select first section when sections load
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);

  // Reset selected section when law changes
  useEffect(() => {
    setSelectedSection(null);
  }, [selectedLaw]);

  const filtered = laws.filter((law) => {
    const matchesSearch = !searchQuery || law.title.toLowerCase().includes(searchQuery.toLowerCase()) || law.hindiTitle?.includes(searchQuery);
    return matchesSearch;
  });

  const currentLaw = laws.find((l) => l.slug === selectedLaw);
  const currentSection = sections.find((s) => s.id === selectedSection);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-serif text-xl font-semibold text-navy-900">Bare Acts & Laws of India</h2>
        <span className="text-ink-500 text-sm">
          Showing {filtered.length} of {laws.length} acts
        </span>
      </div>

      {/* Category chips + search */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
              activeCategory === c.id ? "bg-navy-700 text-white border-navy-700" : "bg-ink-50 text-ink-700 border-ink-100 hover:border-navy-500"
            }`}>{c.label}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 border border-ink-200 rounded-lg px-3 py-1.5 bg-white w-72">
          <Icon name="search" size={14} className="text-ink-400" />
          <input className="flex-1 border-0 outline-none text-sm font-sans" placeholder="Search acts by name..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Empty state */}
      {!loading && laws.length === 0 && (
        <Card className="p-12 text-center">
          <div className="gandhi-avatar lg mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-navy-900 mb-2">No laws ingested yet</h3>
          <p className="text-ink-500 text-sm mb-4 max-w-md mx-auto">
            Clone the Indian Law repository and run the ingestion script to populate the database with 846+ Indian Central Acts.
          </p>
          <div className="bg-ink-50 rounded-lg p-4 text-left max-w-lg mx-auto font-mono text-xs text-ink-700 space-y-1">
            <div>$ git clone https://github.com/Svetozar-Technologies/indian-law.git</div>
            <div>$ cd satyavera</div>
            <div>$ npm run ingest-laws -- --repo-path ../indian-law</div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex gap-4">
          <div className="w-80 flex flex-col gap-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-ink-100 rounded-lg animate-pulse" />)}
          </div>
          <div className="flex-1 h-96 bg-ink-100 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Main content */}
      {!loading && laws.length > 0 && (
        <div className="flex gap-4" style={{ minHeight: "calc(100vh - 240px)" }}>
          {/* Law list */}
          <div className="w-80 flex-shrink-0 overflow-y-auto max-h-[calc(100vh-240px)] space-y-1.5 pr-1">
            {filtered.map((law) => (
              <div key={law.slug} onClick={() => { setSelectedLaw(law.slug); setSelectedSection(null); }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedLaw === law.slug ? "border-saffron-600 bg-saffron-50 shadow-sm" : "border-ink-100 bg-white hover:border-navy-500"
                }`}>
                <div className="font-semibold text-[13px] text-navy-900 leading-tight mb-1 line-clamp-2">{law.title}</div>
                <div className="flex items-center gap-2">
                  {law.actYear && <span className="text-[11px] text-ink-500">{law.actYear}</span>}
                  {law.primaryCategory && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      selectedLaw === law.slug ? "bg-saffron-100 text-saffron-700" : "bg-ink-100 text-ink-500"
                    }`}>{law.primaryCategory}</span>
                  )}
                  <span className="text-[11px] text-ink-400 ml-auto">{law.sectionCount} §</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-ink-500 text-sm py-8">No acts match your search</div>}
          </div>

          {/* Section viewer */}
          <div className="flex-1 flex">
            {!selectedLaw ? (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center text-ink-400">
                  <Icon name="book" size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a law from the list to browse its sections</p>
                </div>
              </Card>
            ) : sectionsLoading ? (
              <Card className="flex-1 p-8"><div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-ink-100 rounded animate-pulse" />)}</div></Card>
            ) : (
              <>
                {/* TOC */}
                <Card className="w-52 flex-shrink-0 p-3 overflow-y-auto max-h-[calc(100vh-240px)] mr-4 text-xs">
                  <div className="eyebrow mb-2">Sections</div>
                  {sections.map((s) => (
                    <div key={s.id} onClick={() => setSelectedSection(s.id)}
                      className={`flex gap-1.5 px-2 py-1.5 rounded cursor-pointer mb-0.5 ${
                        selectedSection === s.id ? "bg-navy-50 text-navy-800 font-semibold" : "text-ink-700 hover:bg-ink-50"
                      }`}>
                      <span className="min-w-[28px] text-ink-500">§ {s.sectionNo}</span>
                      <span className="line-clamp-2">{s.title}</span>
                    </div>
                  ))}
                </Card>

                {/* Section content */}
                <Card className="flex-1 p-7 overflow-y-auto max-h-[calc(100vh-240px)]">
                  {currentLaw && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip variant="green"><Icon name="check" size={11} /> In force</Chip>
                        {currentLaw.actYear && <Chip>Act {currentLaw.actYear}</Chip>}
                        {currentLaw.primaryCategory && <Chip variant="navy">{currentLaw.primaryCategory}</Chip>}
                      </div>
                      <h2 className="font-serif text-lg font-semibold text-navy-900">{currentLaw.title}</h2>
                      {currentLaw.ministry && <p className="text-ink-500 text-xs mt-1">{currentLaw.ministry}</p>}
                    </div>
                  )}

                  {currentSection ? (
                    <>
                      <div className="border-t border-ink-100 pt-4 font-serif text-[15px] leading-[1.85] text-ink-900">
                        <h3 className="font-bold text-lg mb-3">§ {currentSection.sectionNo} — {currentSection.title}</h3>
                        <div className="whitespace-pre-wrap">{currentSection.content}</div>
                        {currentSection.footnotes && (
                          <div className="mt-4 pt-3 border-t border-ink-100 text-xs text-ink-500 italic">
                            {currentSection.footnotes}
                          </div>
                        )}
                      </div>

                      <Card className="p-4 mt-6 !bg-saffron-50 !border-saffron-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <GandhiAvatar size="sm" />
                          <span className="font-bold text-sm">In plain language</span>
                        </div>
                        <p className="text-sm text-ink-700 leading-relaxed">
                          Ask GandhiAI to explain this section in simple Hindi or English. Click the button below.
                        </p>
                        <Button variant="saffron" size="sm" className="mt-2">
                          <Icon name="sparkles" size={12} className="text-white" /> Explain § {currentSection.sectionNo}
                        </Button>
                      </Card>
                    </>
                  ) : (
                    <div className="text-ink-400 text-center py-8">Select a section from the table of contents</div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
