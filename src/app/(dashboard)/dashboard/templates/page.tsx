"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
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

const templates = [
  {
    id: 1,
    title: "FIR for Theft / Robbery",
    category: "fir",
    downloads: "12.4K",
    icon: "flag" as const,
    premium: false,
    description: "Standard format for filing an FIR for theft, robbery, or snatching incidents.",
    format: "PDF / Word",
  },
  {
    id: 2,
    title: "RTI Application (Central)",
    category: "rti",
    downloads: "18.7K",
    icon: "eye" as const,
    premium: false,
    description: "Template for filing RTI under the Right to Information Act, 2005 to central government bodies.",
    format: "PDF / Word",
  },
  {
    id: 3,
    title: "Consumer Complaint (e-Daakhil)",
    category: "consumer",
    downloads: "9.3K",
    icon: "scale" as const,
    premium: false,
    description: "Ready-to-file complaint format for the National Consumer Disputes Redressal Commission.",
    format: "PDF / Word",
  },
  {
    id: 4,
    title: "Rent Agreement",
    category: "property",
    downloads: "22.1K",
    icon: "home" as const,
    premium: false,
    description: "Standard 11-month rental agreement template with all essential clauses.",
    format: "PDF / Word",
  },
  {
    id: 5,
    title: "Legal Notice for Cheque Bounce",
    category: "notices",
    downloads: "7.6K",
    icon: "doc" as const,
    premium: true,
    description: "Legal notice under Section 138 of the Negotiable Instruments Act for dishonoured cheques.",
    format: "PDF / Word",
  },
  {
    id: 6,
    title: "Divorce Petition (Mutual Consent)",
    category: "family",
    downloads: "5.4K",
    icon: "heart" as const,
    premium: true,
    description: "Joint petition for divorce by mutual consent under Section 13B of the Hindu Marriage Act.",
    format: "PDF / Word",
  },
  {
    id: 7,
    title: "Employment Termination Letter",
    category: "employment",
    downloads: "4.2K",
    icon: "users" as const,
    premium: false,
    description: "Standard notice format for wrongful termination complaints to labour courts.",
    format: "PDF / Word",
  },
  {
    id: 8,
    title: "General Affidavit",
    category: "affidavits",
    downloads: "15.8K",
    icon: "paper" as const,
    premium: false,
    description: "Multipurpose affidavit format on stamp paper for courts and government offices.",
    format: "PDF / Word",
  },
  {
    id: 9,
    title: "RTI Application (State)",
    category: "rti",
    downloads: "6.1K",
    icon: "eye" as const,
    premium: false,
    description: "RTI template addressed to state-level Public Information Officers.",
    format: "PDF / Word",
  },
  {
    id: 10,
    title: "Property Sale Agreement",
    category: "property",
    downloads: "8.9K",
    icon: "home" as const,
    premium: true,
    description: "Comprehensive sale deed template with all mandatory clauses under Transfer of Property Act.",
    format: "PDF / Word",
  },
  {
    id: 11,
    title: "Domestic Violence Complaint",
    category: "family",
    downloads: "3.7K",
    icon: "shield" as const,
    premium: false,
    description: "Complaint format under the Protection of Women from Domestic Violence Act, 2005.",
    format: "PDF / Word",
  },
  {
    id: 12,
    title: "Bail Application",
    category: "fir",
    downloads: "6.8K",
    icon: "lock" as const,
    premium: true,
    description: "Standard bail application format for regular bail under Sections 437/439 CrPC.",
    format: "PDF / Word",
  },
];

export default function TemplatesPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((tpl) => tpl.category === activeCategory);

  const searched = searchQuery
    ? filteredTemplates.filter(
        (tpl) =>
          tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tpl.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTemplates;

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="tpl" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
                Template Library
              </h1>
              <p className="text-sm text-ink-500">
                Download ready-to-use legal document templates. Free and premium formats available.
              </p>
            </div>
            <Chip variant="saffron" className="text-[11px]">
              <Icon name="lock" size={11} />
              4 Premium Templates
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

          {/* Results count */}
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
                      PREMIUM
                    </Chip>
                  ) : (
                    <Chip variant="green" className="text-[9px]">
                      FREE
                    </Chip>
                  )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-3">
                  <Icon name={tpl.icon} size={18} className="text-navy-700" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-[13px] text-ink-900 mb-1 pr-16">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-ink-500 leading-relaxed mb-3 line-clamp-2">
                  {tpl.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px] text-ink-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Icon name="download" size={10} />
                    {tpl.downloads}
                  </span>
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
                      Unlock with Pro
                    </>
                  ) : (
                    <>
                      <Icon name="download" size={12} />
                      Download Free
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
