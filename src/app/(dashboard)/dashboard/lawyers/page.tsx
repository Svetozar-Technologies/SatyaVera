"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";
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

const lawyers = [
  {
    id: 1,
    name: "Adv. Priya Mehta",
    photo: "PM",
    verified: true,
    rating: 4.8,
    reviews: 124,
    experience: "12 years",
    location: "South Delhi",
    practiceAreas: ["Family Law", "Property Law"],
    languages: ["Hindi", "English"],
    fee: "Rs. 1,500 / consultation",
    availability: "Available today",
    cases: "320+ cases handled",
    courts: ["Delhi High Court", "Supreme Court"],
    description:
      "Specializes in divorce, custody disputes, and property partition cases. Known for compassionate client handling and strong courtroom presence.",
  },
  {
    id: 2,
    name: "Adv. Rajesh Kumar Singh",
    photo: "RS",
    verified: true,
    rating: 4.6,
    reviews: 89,
    experience: "8 years",
    location: "Dwarka, Delhi",
    practiceAreas: ["Criminal Law", "Consumer Law"],
    languages: ["Hindi", "English", "Punjabi"],
    fee: "Rs. 1,000 / consultation",
    availability: "Available tomorrow",
    cases: "200+ cases handled",
    courts: ["Tis Hazari Court", "Dwarka Court"],
    description:
      "Expert in bail applications, criminal defense, and consumer forum cases. Former public prosecutor with deep knowledge of criminal procedure.",
  },
  {
    id: 3,
    name: "Adv. Sneha Gupta",
    photo: "SG",
    verified: true,
    rating: 4.9,
    reviews: 156,
    experience: "15 years",
    location: "Connaught Place, Delhi",
    practiceAreas: ["Corporate Law", "Tax Law"],
    languages: ["Hindi", "English"],
    fee: "Rs. 3,000 / consultation",
    availability: "Available today",
    cases: "500+ cases handled",
    courts: ["Delhi High Court", "Supreme Court", "NCLT"],
    description:
      "Senior advocate with expertise in corporate disputes, tax litigation, and M&A advisory. Trusted by Fortune 500 companies and HNI clients.",
  },
  {
    id: 4,
    name: "Adv. Mohammed Farhan",
    photo: "MF",
    verified: true,
    rating: 4.7,
    reviews: 67,
    experience: "6 years",
    location: "Saket, Delhi",
    practiceAreas: ["Labour Law", "Consumer Law"],
    languages: ["Hindi", "English", "Urdu"],
    fee: "Rs. 800 / consultation",
    availability: "Available today",
    cases: "150+ cases handled",
    courts: ["Saket Court", "Labour Court"],
    description:
      "Passionate about workers' rights and consumer protection. Handles wrongful termination, wage disputes, and e-commerce consumer complaints.",
  },
];

export default function LawyersPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [sortBy, setSortBy] = useState("rating");

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="lawyer" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
              Find a Lawyer
            </h1>
            <p className="text-sm text-ink-500">
              Browse verified advocates near you. Book consultations directly.
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

                  <Button variant="ghost" size="sm" className="w-full justify-center mt-2">
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

              <p className="text-xs text-ink-400 mb-3">
                Showing {lawyers.length} verified advocates in Delhi NCR
              </p>

              {/* Lawyer Cards */}
              <div className="space-y-4">
                {lawyers.map((lawyer) => (
                  <Card key={lawyer.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                        {lawyer.photo}
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
                            {lawyer.reviews} reviews)
                          </span>
                          <span>{lawyer.experience}</span>
                          <span className="flex items-center gap-1">
                            <Icon name="pin" size={10} /> {lawyer.location}
                          </span>
                        </div>

                        <p className="text-[12px] text-ink-600 leading-relaxed mb-2.5 line-clamp-2">
                          {lawyer.description}
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
                            <span>{lawyer.cases}</span>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
