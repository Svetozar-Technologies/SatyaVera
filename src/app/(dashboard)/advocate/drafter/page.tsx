"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, lawyerSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";

export default function LawyerDrafterPage() {
  const { t } = useI18n();

  const chatMessages = [
    { role: "ai", text: "Which court is this petition for?" },
    { role: "me", text: "Court of Sessions Judge, Tis Hazari, New Delhi." },
    { role: "ai", text: "Section under which arrest was made?" },
    { role: "me", text: "FIR No. 247/2025 u/s 309 BNS (robbery), PS Lajpat Nagar." },
    { role: "ai", text: "Date of arrest?" },
    { role: "me", text: "21 May 2026." },
    { role: "ai", text: "Brief grounds for bail you wish to advance? (e.g., false implication, no recovery, no prior antecedents, willingness to cooperate)" },
  ];

  const suggestions = [
    { title: "Sanjay Chandra v. CBI", cite: "(2012) 1 SCC 40", why: "Bail as a rule, jail as exception" },
    { title: "Arnesh Kumar v. State of Bihar", cite: "(2014) 8 SCC 273", why: "Arrest under offences <7 yr" },
    { title: "Siddharth v. State of UP", cite: "(2022) 1 SCC 676", why: "Custodial vs charge-sheet stage" },
  ];

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="lawyer" name="Karthik" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={lawyerSidebar} active="draft" />
        <main className="flex-1 p-6 md:px-8 bg-bone overflow-auto">
          <div className="flex justify-between items-center mb-[18px]">
            <div>
              <span className="eyebrow">Document Drafter</span>
              <h2 className="font-serif text-xl font-semibold text-navy-900">Bail Application — Karthik v. State (NCT of Delhi)</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">← Back</Button>
              <Button variant="ghost" size="sm"><Icon name="bookmark" size={12} /> Save</Button>
              <Button variant="primary" size="sm"><Icon name="download" size={12} className="text-white" /> Export .docx</Button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* GandhiAI Q&A */}
            <Card className="flex-1 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <GandhiAvatar size="sm" />
                <span className="font-bold">GandhiAI is gathering details</span>
                <span className="text-[11px] text-ink-500 ml-auto">4 of 6 sections complete</span>
              </div>
              <div className="h-1 bg-ink-100 rounded-sm mb-[18px]">
                <div className="w-[66%] h-full bg-saffron-600 rounded-sm" />
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-auto">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "me" ? "justify-end" : "justify-start"}`}>
                    {m.role === "ai" && <GandhiAvatar size="sm" />}
                    <div className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "me"
                        ? "bg-navy-700 text-white rounded-[14px] rounded-br-sm"
                        : "bg-ink-50 text-ink-900 rounded-sm rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px]"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-3.5">
                <textarea
                  rows={3}
                  placeholder="Type your answer in English or Hindi…"
                  className="w-full p-3 border border-ink-200 rounded-lg text-[13px] font-sans resize-none outline-none focus:border-navy-500"
                />
                <div className="flex gap-2 mt-2">
                  <Chip className="cursor-pointer">+ Cite Arnesh Kumar (2014)</Chip>
                  <Chip className="cursor-pointer">+ Cite Sanjay Chandra (2012)</Chip>
                  <Button variant="primary" size="sm" className="ml-auto">Send <Icon name="send" size={12} className="text-white" /></Button>
                </div>
              </div>
            </Card>

            {/* Document Preview */}
            <Card className="flex-[1.2] !p-0 overflow-hidden self-start">
              <div className="px-3.5 py-2.5 bg-ink-50 border-b border-ink-100 flex items-center gap-2 text-xs">
                <Icon name="paper" size={14} className="text-ink-500" />
                <span className="font-semibold">bail-application-2026-ks.docx</span>
                <span className="text-[11px] text-ink-500 ml-auto">Live · click any paragraph to edit</span>
              </div>
              <div className="p-8 font-serif text-xs leading-[1.85] text-ink-900">
                <div className="text-center font-bold mb-1.5">IN THE COURT OF SESSIONS JUDGE, TIS HAZARI, NEW DELHI</div>
                <div className="text-center mb-3.5">Bail Application No. ____ of 2026</div>
                <div>In re : FIR No. 247/2025</div>
                <div className="mb-1.5">P.S. Lajpat Nagar · U/s 309, BNS 2023</div>
                <div className="mt-3.5 mb-1.5"><strong>Karthik Subramanian</strong> S/o Sh. R. Subramanian,</div>
                <div className="mb-1.5">R/o B-42, Lajpat Nagar, New Delhi … <strong>Applicant</strong></div>
                <div className="my-2 text-center">Versus</div>
                <div className="mb-3.5"><strong>State (NCT of Delhi)</strong> … <strong>Respondent</strong></div>
                <div className="font-bold mb-1.5">APPLICATION FOR REGULAR BAIL UNDER SECTION 483, BNSS, 2023</div>
                <div>MOST RESPECTFULLY SHOWETH:</div>
                <p className="my-2">1. That the present application is being preferred under Section 483 of the Bharatiya Nagarik Suraksha Sanhita, 2023, seeking regular bail of the applicant…</p>
                <p className="my-2 bg-saffron-50 p-1.5 rounded">2. That the applicant is a permanent resident of New Delhi with deep-rooted ties to the community, having no prior antecedents — placing reliance on <em>Sanjay Chandra v. CBI</em>, (2012) 1 SCC 40.</p>
                <p className="my-2 text-ink-500"><em>3. [GandhiAI is drafting paragraph 3…]</em></p>
              </div>
            </Card>

            {/* Suggestions */}
            <Card className="w-60 p-[18px] self-start flex-shrink-0">
              <div className="eyebrow mb-2"><Icon name="sparkles" size={11} className="text-saffron-600 inline" /> GandhiAI suggests</div>
              <div className="flex flex-col gap-2.5">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-2.5 border border-ink-100 rounded-lg text-[11px] cursor-pointer hover:border-saffron-600 transition-colors">
                    <div className="font-bold text-navy-800 italic">{s.title}</div>
                    <div className="text-[11px] text-ink-500">{s.cite}</div>
                    <div className="text-ink-500 text-sm mt-1.5">{s.why}</div>
                    <div className="flex gap-1.5 mt-1.5">
                      <button className="text-navy-700 font-semibold text-[11px] cursor-pointer">Insert</button>
                      <button className="text-ink-500 font-semibold text-[11px] cursor-pointer">Read</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
