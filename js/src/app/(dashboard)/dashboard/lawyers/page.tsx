"use client";

import { useI18n } from "@/lib/i18n/context";
import { useLawyers } from "@/hooks/use-lawyers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const practiceAreas = [
  "All Areas",
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Consumer Law",
  "Labour Law",
  "Corporate Law",
  "Tax Law",
];

const languages = ["All Languages", "Hindi", "English", "Punjabi", "Tamil", "Bengali", "Marathi"];

export default function LawyersPage() {
  const { t, lang } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedCity, setSelectedCity] = useState("");

  const { lawyers, loading, error } = useLawyers({
    area: selectedArea === "All Areas" ? undefined : selectedArea,
    city: selectedCity || undefined,
    sort: sortBy,
    search: searchQuery || undefined,
  });

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
          {t("dashboard.findLawyer")}
        </h1>
        <p className="text-sm text-ink-500">
          {t("dashboard.findLawyerDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Practice Area
                </label>
                <div className="space-y-1">
                  {practiceAreas.map((area) => (
                    <button
                      key={area}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] cursor-pointer transition-colors ${
                        selectedArea === area
                          ? "bg-navy-50 text-navy-700 font-semibold"
                          : "text-ink-600 hover:bg-ink-50"
                      }`}
                      onClick={() => setSelectedArea(area)}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink-100 pt-3">
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Language
                </label>
                <div className="space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] cursor-pointer transition-colors ${
                        selectedLanguage === lang
                          ? "bg-navy-50 text-navy-700 font-semibold"
                          : "text-ink-600 hover:bg-ink-50"
                      }`}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink-100 pt-3">
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Experience
                </label>
                <div className="space-y-1">
                  {["Any", "1-5 years", "5-10 years", "10+ years"].map((exp) => (
                    <label
                      key={exp}
                      className="flex items-center gap-2 text-[12px] text-ink-600 cursor-pointer py-0.5"
                    >
                      <input type="radio" name="experience" className="accent-navy-700" />
                      {exp}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink-100 pt-3">
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Fee Range
                </label>
                <div className="space-y-1">
                  {["Any", "Under Rs. 1,000", "Rs. 1,000 - 2,000", "Rs. 2,000+"].map(
                    (fee) => (
                      <label
                        key={fee}
                        className="flex items-center gap-2 text-[12px] text-ink-600 cursor-pointer py-0.5"
                      >
                        <input type="radio" name="fee" className="accent-navy-700" />
                        {fee}
                      </label>
                    )
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center mt-2"
                onClick={() => {
                  setSelectedArea("All Areas");
                  setSelectedLanguage("All Languages");
                  setSearchQuery("");
                  setSelectedCity("");
                  setSortBy("rating");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Search + Results */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Icon
                name="search"
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                className="w-full border border-ink-200 bg-white rounded-lg py-2.5 pl-9 pr-4 text-sm font-sans outline-none focus:border-navy-500 transition-colors"
                placeholder="Search by name, specialization, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-ink-200 rounded-lg px-3 py-2.5 text-xs font-sans outline-none bg-white cursor-pointer focus:border-navy-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-ink-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="w-48 h-4 bg-ink-100 rounded mb-2" />
                      <div className="w-64 h-3 bg-ink-50 rounded mb-2" />
                      <div className="w-full h-3 bg-ink-50 rounded mb-2" />
                      <div className="flex gap-2">
                        <div className="w-20 h-5 bg-ink-100 rounded" />
                        <div className="w-20 h-5 bg-ink-100 rounded" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="p-6 text-center">
              <Icon name="info" size={24} className="text-red-500 mx-auto mb-2" />
              <p className="text-sm text-ink-600 mb-3">Failed to load lawyers: {error}</p>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          )}

          {!loading && !error && (
            <>
              <p className="text-xs text-ink-400 mb-3">
                Showing {lawyers.length} verified advocate{lawyers.length !== 1 ? "s" : ""}
              </p>

              {/* Lawyer Cards */}
              <div className="space-y-4">
                {lawyers.map((lawyer) => (
                  <Card key={lawyer.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                        {lawyer.photo || lawyer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[15px] text-ink-900">
                            {lawyer.name}
                          </h3>
                          {lawyer.verified && (
                            <Chip variant="green" className="text-[9px]">
                              <Icon name="check" size={9} /> Verified
                            </Chip>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-2 text-[11px] text-ink-500">
                          <span className="flex items-center gap-1">
                            <Icon name="star" size={11} className="text-saffron-500" />
                            <strong className="text-ink-800">{lawyer.rating}</strong> (
                            {lawyer.reviewCount} reviews)
                          </span>
                          <span>{lawyer.experience} years</span>
                          <span className="flex items-center gap-1">
                            <Icon name="pin" size={10} /> {lawyer.location}
                          </span>
                        </div>

                        <p className="text-[12px] text-ink-600 leading-relaxed mb-2.5 line-clamp-2">
                          {lang === "hi" ? lawyer.descriptionHi : lawyer.description}
                        </p>

                        <div className="flex gap-1.5 flex-wrap mb-2.5">
                          {lawyer.practiceAreas.map((area) => (
                            <Chip key={area} variant="navy" className="text-[9px]">
                              {area}
                            </Chip>
                          ))}
                          {lawyer.languages.map((lang) => (
                            <Chip key={lang} variant="default" className="text-[9px]">
                              {lang}
                            </Chip>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[11px] text-ink-400">
                            <span className="flex items-center gap-1">
                              <Icon name="scale" size={10} />
                              {lawyer.courts.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Column */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0 ml-3">
                        <div className="text-right mb-2">
                          <p className="font-bold text-sm text-navy-900">{lawyer.fee}</p>
                          <p
                            className={`text-[11px] font-medium ${
                              lawyer.availability.includes("today")
                                ? "text-green-600"
                                : "text-saffron-600"
                            }`}
                          >
                            {lawyer.availability}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="primary" size="sm">
                            <Icon name="phone" size={13} />
                            Book Consultation
                          </Button>
                          <Button variant="ghost" size="sm" className="justify-center">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
