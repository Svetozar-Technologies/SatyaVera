"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";
import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-bone">
      <PublicNav active="home" />

      {/* Hero */}
      <section className="px-6 md:px-20 py-16 md:py-[72px] bg-gradient-to-b from-bone to-[#f3eee5]">
        <div className="flex flex-col lg:flex-row gap-12 items-center max-w-7xl mx-auto">
          <div className="flex-[1.2] flex flex-col gap-5">
            <span className="eyebrow">{t("landing.eyebrow")}</span>
            <h1 className="font-serif text-4xl md:text-[56px] font-semibold leading-[1.05] text-navy-900">
              {t("landing.heroLine1")}
              <br />
              <span className="text-saffron-600">{t("landing.heroLine2")}</span>
            </h1>
            <p className="text-lg leading-relaxed text-ink-700 max-w-[560px]">
              {t("landing.heroDesc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/ask">
                <Button variant="saffron" size="lg">
                  <Icon name="sparkles" size={16} />
                  {t("landing.askGandhi")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ghost" size="lg">
                  {t("landing.imLawyer")}
                  <Icon name="arrowR" size={16} />
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-ink-500">
              {["noCreditCard", "freeQueries", "hindiEnglish"].map((key) => (
                <span key={key} className="flex items-center gap-1">
                  <Icon name="check" size={14} className="text-green-600" />
                  {t(`landing.${key}`)}
                </span>
              ))}
            </div>
          </div>

          {/* Demo Chat */}
          <Card className="flex-1 p-6 !shadow-sh-3 max-w-lg w-full">
            <div className="flex items-center gap-2 mb-3.5">
              <GandhiAvatar size="md" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-navy-900">GandhiAI</span>
                <span className="text-[11px] text-ink-500">{t("landing.chatOnline")}</span>
              </div>
              <Chip variant="green" className="ml-auto">● Live</Chip>
            </div>
            <div className="bg-navy-700 text-white px-3.5 py-2.5 rounded-xl rounded-br-sm text-[13px] mb-3 ml-auto max-w-[90%] text-right">
              {t("landing.chatQuestion")}
            </div>
            <div className="bg-ink-50 p-3.5 rounded-sm rounded-tr-xl rounded-br-xl rounded-bl-xl text-[13px] leading-relaxed">
              <div className="font-bold mb-1.5">{t("landing.rightsArrested")}</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("landing.rightReason")} — <span className="lref">Article 22(1)</span></li>
                <li>{t("landing.rightRelative")} — <span className="lref">S. 47, BNSS</span></li>
                <li>{t("landing.rightMagistrate")}</li>
              </ul>
              <div className="text-[11px] text-ink-500 mt-2.5">{t("landing.source")}</div>
            </div>
            <div className="flex gap-2 mt-3.5">
              <input className="flex-1 border border-ink-200 bg-white px-3.5 py-2.5 rounded-lg text-[13px] font-sans outline-none focus:border-navy-500" placeholder="Type your question…" readOnly />
              <Button variant="primary" className="!px-3.5 !py-2.5">
                <Icon name="send" size={14} className="text-white" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="px-6 md:px-20 py-14 bg-white">
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
          {(["knowRights", "draftDocs", "findLawyer"] as const).map((key, i) => {
            const icons = ["shield", "doc", "users"] as const;
            return (
              <Card key={key} className="flex-1 p-6">
                <div className="w-11 h-11 rounded-[10px] bg-navy-50 text-navy-700 flex items-center justify-center mb-3.5">
                  <Icon name={icons[i]} size={22} className="text-navy-700" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-navy-900 mb-1.5">{t(`landing.${key}`)}</h3>
                <p className="text-ink-500 text-sm">{t(`landing.${key}Desc`)}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Scenario Grid */}
      <section className="px-6 md:px-20 py-14 bg-bone">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="eyebrow">{t("landing.forCitizens")}</span>
              <h2 className="font-serif text-3xl font-semibold text-navy-900 mt-1">{t("landing.commonSituations")}</h2>
            </div>
            <Link href="/dashboard/guides" className="text-navy-700 font-semibold text-sm hover:underline">{t("landing.viewGuides")} →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { icon: "shield" as const, key: "arrestedByPolice", tag: "Criminal" },
              { icon: "home" as const, key: "landlordDeposit", tag: "Property" },
              { icon: "siren" as const, key: "workplaceHarass", tag: "Women" },
              { icon: "paper" as const, key: "fileRTI", tag: "General" },
            ]).map((s, i) => (
              <Link href="/dashboard/guides" key={i}>
                <Card className="p-[18px] cursor-pointer hover:shadow-sh-2 transition-shadow h-full">
                  <div className="w-9 h-9 rounded-lg bg-saffron-50 text-saffron-700 flex items-center justify-center mb-3">
                    <Icon name={s.icon} size={18} className="text-saffron-700" />
                  </div>
                  <div className="font-semibold text-navy-900 text-sm mb-1">{t(`landing.${s.key}`)}</div>
                  <Chip>{s.tag}</Chip>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* For Lawyers */}
      <section className="px-6 md:px-20 py-14 bg-navy-900 text-white">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-saffron-400">{t("landing.forLawyersSection")}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white">{t("landing.aiToolsAdvocate")}</h2>
            <div className="grid grid-cols-2 gap-3.5 mt-2">
              {(["docDrafter", "caseLawResearch", "bareActs", "argBuilder"] as const).map((key) => (
                <div key={key} className="border-t border-white/10 pt-3.5">
                  <div className="font-semibold text-saffron-400 text-sm mb-1">{t(`landing.${key}`)}</div>
                  <div className="text-xs text-white/70">{t(`landing.${key}Desc`)}</div>
                </div>
              ))}
            </div>
            <Link href="/signup" className="self-start mt-3">
              <Button variant="saffron">{t("landing.startFreeTrial")}</Button>
            </Link>
          </div>

          <Card className="flex-1 !p-0 !bg-white !text-ink-900 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-ink-50 border-b border-ink-100 flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 bg-[#ed6a5e] rounded-full" />
              <span className="w-2.5 h-2.5 bg-[#f5bf4f] rounded-full" />
              <span className="w-2.5 h-2.5 bg-[#62c554] rounded-full" />
              <span className="text-ink-500 ml-2">bail-application-2024-ks.docx</span>
            </div>
            <div className="p-6 text-xs leading-relaxed font-serif">
              <div className="text-center font-bold mb-2">IN THE COURT OF SESSIONS JUDGE, NEW DELHI</div>
              <div className="text-center mb-3.5">Bail Application No. ___ of 2025</div>
              <div className="mb-1.5"><strong>Karthik Subramanian</strong> ……… Applicant</div>
              <div className="mb-1.5">Versus</div>
              <div className="mb-3.5"><strong>State (NCT of Delhi)</strong> ……… Respondent</div>
              <div className="text-[11px] font-bold mb-1.5">APPLICATION U/S 483 BNSS, 2023</div>
              <div className="text-[11px] text-ink-500">1. That the applicant is being falsely implicated in FIR No. 247/2025…</div>
              <div className="text-[11px] text-ink-500 mt-1">2. That the alleged offence is bailable in nature, as held in <em>Arnesh Kumar v. State of Bihar</em>, (2014) 8 SCC 273…</div>
              <div className="flex items-center gap-2 mt-3.5 text-[10px] text-saffron-700">
                <Icon name="sparkles" size={12} className="text-saffron-700" />
                <span>GandhiAI suggests citing Sanjay Chandra v. CBI, (2012) 1 SCC 40</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Band */}
      <section className="px-6 md:px-20 py-12 bg-white border-t border-ink-100">
        <div className="flex flex-wrap justify-between gap-8 max-w-7xl mx-auto">
          {([
            { num: "2,400+", key: "actsIndexed" },
            { num: "1.8 M", key: "judgmentsSearch" },
            { num: "240+", key: "docTemplates" },
            { num: "22", key: "highCourts" },
          ]).map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="font-serif text-[28px] font-semibold text-saffron-600">{s.num}</div>
              <div className="text-ink-500 text-sm">{t(`landing.${s.key}`)}</div>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <div className="text-[28px]">🇮🇳</div>
            <div className="text-ink-500 text-sm">{t("landing.dataIndia")}</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
