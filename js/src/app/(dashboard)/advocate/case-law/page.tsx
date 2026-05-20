"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";

export default function CaseLawResearch() {
  const { t } = useI18n();

  const judgments = [
    {
      name: "Tofan Singh v. State of Tamil Nadu",
      cite: "(2021) 4 SCC 1",
      court: "Supreme Court · Constitution Bench",
      date: "29 Oct 2020",
      rel: 97,
      hold: "Held: Officers under Section 53 NDPS Act are \"police officers\" within meaning of S. 25 IEA. Confessional statements u/s 67 NDPS not admissible.",
    },
    {
      name: "Mohd Muslim @ Hussain v. State (NCT of Delhi)",
      cite: "(2023) 17 SCC 671",
      court: "Supreme Court · 2-judge bench",
      date: "28 Mar 2023",
      rel: 91,
      hold: "Held: Long incarceration without trial violates Article 21; bail in NDPS commercial-quantity matters not foreclosed despite S. 37.",
    },
    {
      name: "Union of India v. K. A. Najeeb",
      cite: "(2021) 3 SCC 713",
      court: "Supreme Court",
      date: "1 Feb 2021",
      rel: 88,
      hold: "Held: Where trial is unlikely to conclude in reasonable time, statutory restrictions on bail (UAPA / NDPS) yield to constitutional rights.",
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="font-serif text-[22px] font-semibold text-navy-900">{t("sidebar.caseLawResearch")}</h2>
        <p className="text-ink-500 text-sm">Search 1.8 M judgments — AI-summarised, ranked by relevance to your query.</p>
      </div>

      {/* Search */}
      <Card className="p-[18px] mb-[18px]">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-[1.5px] border-navy-700 rounded-[10px] bg-white">
          <Icon name="search" size={18} className="text-navy-700" />
          <input
            className="flex-1 border-0 outline-none font-sans text-sm font-medium"
            defaultValue="anticipatory bail under NDPS Act for commercial quantity — recent precedents"
          />
          <Button variant="primary" size="sm">Search</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          <span className="text-ink-500 text-sm">Filters:</span>
          <Chip>Court: All</Chip>
          <Chip variant="navy">Year: 2018 – 2026</Chip>
          <Chip>Bench: Any</Chip>
          <Chip>Topic: NDPS / Bail</Chip>
          <button className="text-navy-700 font-semibold text-[11px] ml-2 cursor-pointer">+ Add filter</button>
          <span className="text-ink-500 text-sm ml-auto">Sort by: <strong>Relevance</strong> · Date · Court hierarchy</span>
        </div>
      </Card>

      <div className="flex justify-between items-baseline mb-3.5">
        <span className="text-ink-500 text-sm">Found 23 relevant judgments</span>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Icon name="sparkles" size={12} className="text-saffron-600" />
          GandhiAI summarised in 2.4s
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-3">
        {judgments.map((j, i) => (
          <Card key={i} className="p-[18px]">
            <div className="flex gap-3.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Chip variant="navy">{j.court.split("·")[0].trim()}</Chip>
                  <span className="text-[11px] text-ink-500">{j.cite} · {j.date}</span>
                </div>
                <h3 className="font-serif text-lg italic text-navy-900 mb-1.5">{j.name}</h3>
                <div className="text-ink-500 text-sm mb-2">{j.court}</div>
                <div className="text-[13px] leading-relaxed p-3 bg-saffron-50 rounded-md border border-saffron-100">
                  <span className="eyebrow mr-1.5"><Icon name="sparkles" size={10} className="inline" /> GandhiAI</span>
                  {j.hold}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">Relevance</span>
                <div className="relative w-[54px] h-[54px]">
                  <svg viewBox="0 0 36 36" width={54} height={54}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e6eaf0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#d96f1a" strokeWidth="3"
                      strokeDasharray={`${j.rel} 100`} strokeDashoffset="0" transform="rotate(-90 18 18)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[13px]">{j.rel}</div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm">Read</Button>
                  <Button variant="ghost" size="sm" className="!p-1"><Icon name="bookmark" size={11} /></Button>
                </div>
                <button className="text-navy-700 font-semibold text-[11px] cursor-pointer">Cite this →</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
