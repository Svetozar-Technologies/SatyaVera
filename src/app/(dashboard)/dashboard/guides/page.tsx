"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import Link from "next/link";
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

const guides = [
  {
    id: 1,
    title: "Your Rights if Arrested by Police",
    category: "Criminal Law",
    categoryValue: "criminal",
    readTime: "8 min",
    readers: "12.4K",
    description:
      "Understand what police can and cannot do during an arrest. Learn about bail, legal representation, and protections under the Constitution.",
    icon: "shield" as const,
    tags: ["Arrest", "FIR", "Bail", "CrPC"],
  },
  {
    id: 2,
    title: "Tenant Rights Against Illegal Eviction",
    category: "Property & Rent",
    categoryValue: "property",
    readTime: "6 min",
    readers: "8.7K",
    description:
      "Know your rights as a tenant including protection against unlawful eviction, security deposit rules, and rent control laws.",
    icon: "home" as const,
    tags: ["Rent", "Eviction", "Deposit", "Lease"],
  },
  {
    id: 3,
    title: "Filing a Consumer Complaint Online",
    category: "Consumer Rights",
    categoryValue: "consumer",
    readTime: "5 min",
    readers: "15.2K",
    description:
      "Step-by-step guide to filing complaints on the National Consumer Helpline and e-daakhil portal for defective products or poor services.",
    icon: "flag" as const,
    tags: ["Consumer Forum", "Complaint", "Refund"],
  },
  {
    id: 4,
    title: "Protection of Women from Domestic Violence",
    category: "Women & Family",
    categoryValue: "women",
    readTime: "10 min",
    readers: "9.1K",
    description:
      "Comprehensive guide on the Domestic Violence Act 2005, protection orders, right to residence, and how to seek help.",
    icon: "heart" as const,
    tags: ["DV Act", "Protection Order", "Maintenance"],
  },
];

const selectedGuide = {
  title: "Your Rights if Arrested by Police",
  subtitle: "Based on CrPC, Constitution of India & D.K. Basu v. State of West Bengal (1997)",
  rights: [
    "Right to know the grounds of arrest (Article 22(1))",
    "Right to consult a lawyer of your choice (Article 22(1))",
    "Right to be produced before a Magistrate within 24 hours (Article 22(2))",
    "Right to not be subjected to torture or cruel treatment (Article 21)",
    "Right to inform a relative or friend about the arrest",
    "Right to free legal aid if you cannot afford a lawyer (Article 39A)",
    "Right to medical examination (Section 54, CrPC)",
  ],
  steps: [
    {
      title: "Stay Calm and Ask for Identification",
      description:
        "Ask the police officer to identify themselves with their name and badge number. Note the time of arrest.",
    },
    {
      title: "Ask for the Grounds of Arrest",
      description:
        "Under Article 22(1), the police must inform you of the reason for your arrest. If they do not, this is a violation of your fundamental rights.",
    },
    {
      title: "Contact a Lawyer Immediately",
      description:
        "You have the right to consult an advocate of your choice. If you cannot afford one, you are entitled to free legal aid under the Legal Services Authority Act.",
    },
    {
      title: "Inform a Family Member",
      description:
        "As per D.K. Basu guidelines, police must inform your nominated person about the arrest and the place of detention.",
    },
    {
      title: "Do Not Sign Blank Papers",
      description:
        "Never sign any blank document. Read every paper carefully before signing. You have the right to refuse to sign anything you do not understand.",
    },
  ],
};

export default function GuidesPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(1);

  const filteredGuides =
    activeCategory === "all"
      ? guides
      : guides.filter((g) => g.categoryValue === activeCategory);

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="guides" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
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
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </Chip>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Guide List (Left) */}
            <div className="lg:col-span-2 space-y-3">
              {filteredGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedId === guide.id
                      ? "ring-2 ring-navy-500 shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedId(guide.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <Icon name={guide.icon} size={16} className="text-navy-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[13px] text-ink-900 mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-[11px] text-ink-500 mb-2 line-clamp-2">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-ink-400">
                        <span className="flex items-center gap-1">
                          <Icon name="book" size={10} /> {guide.readTime} read
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="eye" size={10} /> {guide.readers} readers
                        </span>
                      </div>
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
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Guide Detail (Right) */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Chip variant="navy" className="text-[10px]">Criminal Law</Chip>
                  <span className="text-[10px] text-ink-400">8 min read</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-navy-900 mb-1">
                  {selectedGuide.title}
                </h2>
                <p className="text-[11px] text-ink-500 mb-5">
                  {selectedGuide.subtitle}
                </p>

                {/* Your Rights */}
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

                {/* Step-by-Step */}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
