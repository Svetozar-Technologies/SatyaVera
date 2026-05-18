"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, lawyerSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LawyerDashboard() {
  const { t } = useI18n();

  const quickActions = [
    { icon: "edit" as const, key: "draftDocument", sub: "Petitions, notices, agreements", href: "/advocate/drafter", tone: "navy" },
    { icon: "search" as const, key: "searchCaseLaw", sub: "1.8 M judgments, AI-summarised", href: "/advocate/case-law", tone: "saffron" },
    { icon: "book" as const, key: "browseBareActs", sub: "Old↔new section mapper", href: "/advocate/bare-acts", tone: "navy" },
    { icon: "scale" as const, key: "buildArguments", sub: "Pro / counter / rebuttals", href: "/advocate/arguments", tone: "saffron" },
  ];

  const recentDocs = [
    { title: "Bail Application — Karthik v. State (NCT)", type: "Bail Application", court: "Delhi Sessions", time: "2 hrs ago" },
    { title: "Notice u/s 80 CPC — Mehta v. NDMC", type: "Legal Notice", court: "Pre-litigation", time: "Yesterday" },
    { title: "Writ Petition (Article 226) — Verma & Sons", type: "Writ Petition", court: "Delhi HC", time: "3 days ago" },
    { title: "Sale Deed — Khanna Properties", type: "Agreement", court: "Sub-Registrar", time: "5 days ago" },
  ];

  const consultations = [
    { name: "Priya M.", city: "Pune", topic: "Tenant eviction — landlord pressure", mode: "Video · ₹1,500", time: "18 min ago" },
    { name: "Mohan R.", city: "Gurugram", topic: "NI Act § 138 cheque bounce defence", mode: "Phone · ₹800", time: "1 hr ago" },
    { name: "Anuradha S.", city: "Delhi", topic: "Domestic violence — protection order", mode: "In-person · ₹2,500", time: "3 hr ago" },
  ];

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="lawyer" name="Karthik" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={lawyerSidebar} active="home" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Tuesday, 23 May 2026</span>
              <h1 className="font-serif text-3xl font-semibold text-navy-900">
                {t("lawyer.welcomeAdvocate", { name: "Karthik" })}
              </h1>
              <div className="flex items-center gap-2">
                <Chip variant="green"><Icon name="check" size={11} /> {t("lawyer.verifiedAdvocate")}</Chip>
                <span className="text-ink-500 text-sm">Bar Council of Delhi · Enrol. D/2156/2018</span>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: t("lawyer.proSearches"), value: "8 / ∞" },
                { label: t("lawyer.openRequests"), value: "3", accent: true },
                { label: t("lawyer.profileViews"), value: "247", badge: "+18%" },
              ].map((stat, i) => (
                <Card key={i} className="px-3.5 py-2.5 min-w-[140px]">
                  <div className="text-[11px] text-ink-500">{stat.label}</div>
                  <div className={`font-bold text-lg ${stat.accent ? "text-saffron-700" : ""}`}>
                    {stat.value}
                    {stat.badge && <span className="text-[11px] text-green-600 font-semibold ml-1">{stat.badge}</span>}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {quickActions.map((c) => (
              <Link key={c.key} href={c.href}>
                <Card className="p-[18px] cursor-pointer hover:shadow-sh-2 transition-shadow h-full">
                  <div className={`w-[38px] h-[38px] rounded-[9px] flex items-center justify-center mb-3 ${
                    c.tone === "saffron" ? "bg-saffron-50 text-saffron-700" : "bg-navy-50 text-navy-700"
                  }`}>
                    <Icon name={c.icon} size={18} />
                  </div>
                  <div className="font-bold text-sm text-navy-900 mb-0.5">{t(`lawyer.${c.key}`)}</div>
                  <div className="text-[11px] text-ink-500">{c.sub}</div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Two columns */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recent Documents */}
            <Card className="flex-[1.4] p-5">
              <div className="flex justify-between mb-3.5">
                <h3 className="font-serif text-base font-semibold">{t("lawyer.recentDocuments")}</h3>
                <span className="text-navy-700 text-sm font-semibold cursor-pointer">{t("common.viewAll")}</span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-ink-500 text-[11px] uppercase tracking-wide">
                    <th className="py-2 font-semibold">Title</th>
                    <th className="py-2 font-semibold">Type</th>
                    <th className="py-2 font-semibold">Court</th>
                    <th className="py-2 font-semibold">Modified</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocs.map((r, i) => (
                    <tr key={i} className="border-t border-ink-100">
                      <td className="py-3 pr-2 font-medium">{r.title}</td>
                      <td className="py-3"><Chip>{r.type}</Chip></td>
                      <td className="py-3 text-ink-500">{r.court}</td>
                      <td className="py-3 text-ink-500">{r.time}</td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="!p-1"><Icon name="download" size={12} /></Button>
                        <Button variant="ghost" size="sm" className="!p-1 ml-1"><Icon name="edit" size={12} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Consultation Requests */}
            <Card className="flex-1 p-5">
              <div className="flex justify-between mb-3.5">
                <h3 className="font-serif text-base font-semibold">{t("lawyer.consultationRequests")}</h3>
                <Chip variant="saffron">3 new</Chip>
              </div>
              {consultations.map((r, i) => (
                <div key={i} className={`flex gap-3 py-3 ${i ? "border-t border-ink-100" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-ink-50 text-navy-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[13px]">{r.name} · <span className="text-[11px] text-ink-500 font-normal">{r.city}</span></div>
                    <div className="text-sm text-ink-700">{r.topic}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Chip>{r.mode}</Chip>
                      <span className="text-[11px] text-ink-500">{r.time}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <Button variant="primary" size="sm">Accept</Button>
                      <Button variant="ghost" size="sm">Decline</Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
