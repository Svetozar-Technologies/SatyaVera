"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";

export default function ScannerPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="docs" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="font-serif text-[22px] font-semibold text-navy-900">Scan & Understand a Legal Document</h2>
            <p className="text-ink-500 text-sm">Upload a photo or PDF — GandhiAI summarises it in plain language.</p>
          </div>

          <div className="flex gap-4">
            {/* Original Document */}
            <Card className="flex-1 !p-0 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-ink-50 border-b border-ink-100 flex items-center gap-2 text-xs">
                <Icon name="paper" size={14} className="text-ink-500" />
                <span className="font-semibold">legal-notice-from-bank.pdf</span>
                <span className="text-[11px] text-ink-500 ml-auto">page 1 of 2</span>
              </div>
              <div className="p-8 bg-[#f8f6f1] min-h-[500px] font-serif text-xs leading-relaxed">
                <div className="text-right text-ink-500 font-mono text-[10px] mb-3.5">Ref: HBDB/LD/2026/8841 · 14-05-2026</div>
                <div className="text-center font-bold mb-2">LEGAL NOTICE</div>
                <div className="text-center text-[10px] mb-[18px]">Under Section 138 of the Negotiable Instruments Act, 1881</div>
                <p>To,<br />Mr. Aarav Sharma<br />B-42, Lajpat Nagar, New Delhi — 110024</p>
                <p>From,<br />Adv. R. Iyer, Counsel for HBD Bank Ltd.<br />Court Chambers, Tis Hazari, Delhi.</p>
                <p>1. That my client, HBD Bank Ltd., received a cheque bearing No. 414289 dated 02-05-2026 for ₹ 84,500/- drawn on your account, towards repayment of personal loan EMI.</p>
                <p>2. That the said cheque, when presented for encashment on 06-05-2026, was returned <strong>unpaid</strong> with the remark &ldquo;<strong>Funds Insufficient</strong>&rdquo;…</p>
                <p>3. You are hereby called upon to <strong>pay the said sum of ₹ 84,500/- within 15 (fifteen) days</strong> from the receipt of this notice…</p>
              </div>
            </Card>

            {/* GandhiAI Explanation */}
            <div className="flex-1 flex flex-col gap-3">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GandhiAvatar size="sm" />
                  <span className="font-bold">GandhiAI Explanation</span>
                  <Chip variant="green" className="ml-auto"><Icon name="check" size={11} /> Analysed in 8 sec</Chip>
                </div>

                <div className="text-[11px] text-ink-500 mb-1">Document Type</div>
                <div className="font-bold text-navy-900 mb-2.5">Statutory Legal Notice — Cheque Dishonour (Section 138, NI Act 1881)</div>

                <div className="text-[11px] text-ink-500 mb-1">Plain-language summary</div>
                <p className="text-[13px] leading-relaxed mt-0 mb-3">
                  HBD Bank&apos;s lawyer says a cheque you wrote to them for ₹84,500 bounced because of insufficient funds. They are demanding you pay within 15 days, or they will file a criminal complaint.
                </p>

                <div className="text-[11px] text-ink-500 mb-1">Key points</div>
                <ul className="list-disc pl-[18px] text-[13px] leading-relaxed mb-3">
                  <li>Cheque amount: ₹ 84,500</li>
                  <li>Cheque returned with: &ldquo;Funds Insufficient&rdquo;</li>
                  <li>Demand under <span className="lref">S. 138 NI Act</span></li>
                  <li>Failure to pay = criminal proceedings</li>
                </ul>

                <div className="p-3 bg-red-100 rounded-lg text-[13px] text-red-600">
                  <strong className="block mb-1">⚠ Important deadline</strong>
                  Pay within <strong>15 days from receipt</strong> (i.e. by <strong>30 May 2026</strong>) or face criminal complaint under S. 138 (up to 2 years&apos; jail or fine up to twice the cheque amount).
                </div>

                <div className="text-[11px] text-ink-500 mt-3.5 mb-1">What you should do</div>
                <ol className="list-decimal pl-[18px] text-[13px] leading-relaxed">
                  <li>Verify the cheque amount and the bounce reason.</li>
                  <li>If genuine, pay the full amount within 15 days and obtain a receipt.</li>
                  <li>If you dispute the demand, send a legal reply notice through a lawyer.</li>
                </ol>
              </Card>

              <div className="flex gap-3">
                <Button variant="primary" className="flex-1 justify-center"><Icon name="sparkles" size={14} className="text-white" /> Ask GandhiAI about this</Button>
                <Button variant="ghost" className="flex-1 justify-center"><Icon name="users" size={14} /> Find a Cheque-Bounce Lawyer</Button>
              </div>

              <Card className="p-3.5">
                <div className="text-[11px] text-ink-500 mb-1.5">Legal terms in this document</div>
                <div className="flex gap-2 flex-wrap">
                  {["Negotiable Instrument", "Statutory Notice", "Drawer", "Encashment", "Cognizable Offence"].map((term) => (
                    <Chip key={term}>{term}</Chip>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
