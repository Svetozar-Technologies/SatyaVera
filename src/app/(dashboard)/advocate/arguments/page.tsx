"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, lawyerSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";

export default function ArgumentBuilderPage() {
  const { t } = useI18n();

  const forArgs = [
    { h: "No recovery — undermines prima facie case", body: "No incriminating articles were recovered from the accused either at arrest or during police custody. Without recovery, the prosecution rests entirely on a single eye-witness account.", sec: ["§ 483 BNSS"], cases: ["Lalita Kumari v. UP (2014)", "Tomaso Bruno v. UP (2015)"] },
    { h: "Unexplained 14-day delay in FIR", body: "Settled position that unexplained delay in lodging FIR shifts the burden on the prosecution to explain. No such explanation exists on record.", sec: [], cases: ["Thulia Kali v. State of TN, (1972) 3 SCC 393", "Ramdas v. State of Maharashtra, (2007) 2 SCC 170"] },
    { h: "Bail is the rule — Sanjay Chandra principle", body: "Personal liberty under Article 21; punitive pre-trial incarceration is impermissible where flight risk and tampering are not made out.", sec: ["Article 21"], cases: ["Sanjay Chandra v. CBI, (2012) 1 SCC 40", "Siddharth v. State of UP, (2022) 1 SCC 676"] },
  ];

  const counters = [
    { h: "State will rely on eye-witness testimony", counter: "Prosecution will argue the eye-witness is direct and reliable, statement recorded u/s 161.", rebuttal: "Reply: Sole eye-witness uncorroborated by recovery or forensic evidence is insufficient at bail stage; cite Sharad B. Sarda v. State of Maharashtra, (1984) 4 SCC 116." },
    { h: "Seriousness of offence (§ 309 BNS) bars bail", counter: "Prosecution likely to invoke gravity and societal impact.", rebuttal: "Gravity alone cannot be a ground; nature of evidence matters. Cite Prabhakar Tewari v. State of UP, (2020) 11 SCC 648." },
  ];

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="lawyer" name="Karthik" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={lawyerSidebar} active="arg" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="font-serif text-[22px] font-semibold text-navy-900">{t("sidebar.argumentBuilder")}</h2>
            <p className="text-ink-500 text-sm">Pre-court preparation: arguments, anticipated counters, and rebuttals — with citations.</p>
          </div>

          {/* Case Facts */}
          <Card className="p-[18px] mb-[18px]">
            <div className="flex gap-3">
              <div className="flex-[2]">
                <div className="eyebrow mb-1.5">Case facts</div>
                <p className="text-sm leading-relaxed m-0">
                  Client (auto driver, 32 yrs) booked u/s 309 BNS, 2023 (robbery) on basis of single eye-witness, no recovery, no CCTV. FIR registered after 14-day delay. Bail sought in Sessions Court, Tis Hazari.
                </p>
              </div>
              <div className="flex-1">
                <div className="eyebrow mb-1.5">Arguing for</div>
                <Chip variant="navy" className="font-bold">Petitioner / Accused</Chip>
                <div className="text-[11px] text-ink-500 mt-2">Sessions Court, NCT of Delhi · Bail u/s 483 BNSS</div>
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <Button variant="ghost" size="sm"><Icon name="edit" size={12} /> Edit facts</Button>
                <Button variant="saffron" size="sm"><Icon name="sparkles" size={12} className="text-white" /> Refine with GandhiAI</Button>
              </div>
            </div>
          </Card>

          {/* Arguments Grid */}
          <div className="flex gap-4 items-start">
            {/* For your side */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-600" />
                <h3 className="font-serif text-base font-semibold text-green-600">Arguments for your side</h3>
              </div>
              {forArgs.map((a, i) => (
                <Card key={i} className="p-4 !border-l-[3px] !border-l-green-500">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-green-600">FOR · {i + 1}</span>
                    <span className="font-bold text-sm">{a.h}</span>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed mb-2.5">{a.body}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {a.sec.map((s, j) => <Chip key={j} variant="navy" className="text-[10px]">{s}</Chip>)}
                    {a.cases.map((c, j) => <Chip key={j} className="text-[10px] italic">{c}</Chip>)}
                  </div>
                </Card>
              ))}
            </div>

            {/* Counter-arguments */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon name="info" size={16} className="text-red-600" />
                <h3 className="font-serif text-base font-semibold text-red-600">Anticipated counters & rebuttals</h3>
              </div>
              {counters.map((a, i) => (
                <Card key={i} className="p-4 !border-l-[3px] !border-l-red-500">
                  <div className="text-[11px] font-bold text-red-600 mb-1.5">COUNTER · {i + 1}</div>
                  <div className="font-bold text-sm mb-1.5">{a.h}</div>
                  <p className="text-sm text-ink-700 leading-relaxed mb-2.5">{a.counter}</p>
                  <div className="p-2.5 bg-green-100 rounded-md text-xs text-green-600">
                    <strong>Your rebuttal: </strong>
                    <span className="text-ink-900">{a.rebuttal}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional precedents */}
          <div className="flex items-center gap-3 mt-6 p-[18px] bg-white rounded-[10px] border border-ink-100">
            <Icon name="info" size={16} className="text-saffron-600 flex-shrink-0" />
            <div className="flex-1 text-sm text-ink-700">
              Additional precedents to consider, ranked by relevance:
              <span className="italic"> Manoj v. State of MP, (2022) 2 SCC 562 · Satender Kumar Antil v. CBI, (2022) 10 SCC 51 · Pankaj Bansal v. UoI, (2023) SCC OnLine SC 1244</span>
            </div>
            <Button variant="primary" size="sm">Use in Drafter</Button>
            <Button variant="ghost" size="sm"><Icon name="download" size={12} /> Export PDF</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
