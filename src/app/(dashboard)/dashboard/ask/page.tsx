"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";
import { useState } from "react";

const conversationsToday = [
  { id: 1, title: "Landlord refusing to return deposit", time: "10:32 AM", active: true },
  { id: 2, title: "FIR filing process in Delhi", time: "9:15 AM", active: false },
];

const conversationsWeek = [
  { id: 3, title: "Consumer complaint against Amazon", time: "May 15", active: false },
  { id: 4, title: "RTI application for land records", time: "May 14", active: false },
  { id: 5, title: "Cheque bounce case procedure", time: "May 13", active: false },
  { id: 6, title: "Domestic violence protection order", time: "May 12", active: false },
];

const topicTags = ["Tenant Rights", "Property Law", "Consumer Law", "Criminal Law", "Family Law"];

export default function AskPage() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="ask" />

        {/* Three-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Conversation List */}
          <div className="w-[260px] flex-shrink-0 bg-paper border-r border-ink-100 flex flex-col">
            <div className="p-3">
              <Button variant="primary" size="sm" className="w-full justify-center mb-3">
                <Icon name="plus" size={14} />
                New Chat
              </Button>
              <div className="relative">
                <Icon
                  name="search"
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  className="w-full border border-ink-100 bg-ink-50 rounded-md py-2 pl-8 pr-3 text-xs font-sans outline-none focus:border-navy-500"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto px-2 pb-3">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-2 pt-3 pb-1.5">
                Today
              </p>
              {conversationsToday.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full text-left px-3 py-2.5 rounded-md mb-0.5 cursor-pointer transition-colors ${
                    conv.active
                      ? "bg-navy-50 border border-navy-100"
                      : "hover:bg-ink-50 border border-transparent"
                  }`}
                >
                  <p
                    className={`text-[12.5px] truncate ${
                      conv.active ? "font-semibold text-navy-800" : "text-ink-700"
                    }`}
                  >
                    {conv.title}
                  </p>
                  <p className="text-[10px] text-ink-400 mt-0.5">{conv.time}</p>
                </button>
              ))}

              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-2 pt-4 pb-1.5">
                Last 7 Days
              </p>
              {conversationsWeek.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left px-3 py-2.5 rounded-md mb-0.5 hover:bg-ink-50 cursor-pointer border border-transparent transition-colors"
                >
                  <p className="text-[12.5px] text-ink-700 truncate">{conv.title}</p>
                  <p className="text-[10px] text-ink-400 mt-0.5">{conv.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Chat */}
          <div className="flex-1 flex flex-col bg-bone">
            {/* Chat Header */}
            <div className="bg-paper border-b border-ink-100 px-6 py-3">
              <div className="flex items-center gap-3 mb-2">
                <GandhiAvatar size="sm" />
                <div>
                  <h2 className="font-semibold text-sm text-ink-900">GandhiAI</h2>
                  <p className="text-[11px] text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {topicTags.map((tag) => (
                  <Chip key={tag} variant="default" className="text-[10px] cursor-pointer hover:bg-ink-100">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* AI Welcome */}
              <div className="flex gap-3">
                <GandhiAvatar size="sm" />
                <Card className="p-4 max-w-xl">
                  <p className="text-[13px] text-ink-800 leading-relaxed">
                    Namaste! I am GandhiAI, your legal awareness assistant. I can help you
                    understand your rights under Indian law, guide you through legal
                    procedures, and draft documents. How can I assist you today?
                  </p>
                  <p className="text-[11px] text-ink-400 mt-2">10:30 AM</p>
                </Card>
              </div>

              {/* User Message */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                  A
                </div>
                <Card className="p-4 max-w-xl bg-navy-50 border-navy-100">
                  <p className="text-[13px] text-ink-800 leading-relaxed">
                    My landlord is refusing to return my security deposit after I vacated
                    the flat. The lease period ended 2 months ago and I gave proper notice.
                    What are my rights?
                  </p>
                  <p className="text-[11px] text-ink-400 mt-2 text-right">10:32 AM</p>
                </Card>
              </div>

              {/* AI Detailed Response */}
              <div className="flex gap-3">
                <GandhiAvatar size="sm" />
                <Card className="p-4 max-w-xl">
                  <p className="text-[13px] text-ink-800 leading-relaxed mb-3">
                    You have clear legal rights in this situation. Here is what you need to know:
                  </p>

                  <div className="mb-3">
                    <p className="text-[13px] font-semibold text-ink-900 mb-1">
                      1. Right to Refund
                    </p>
                    <p className="text-[13px] text-ink-700 leading-relaxed">
                      Under the{" "}
                      <span className="text-navy-700 font-medium underline decoration-dotted cursor-pointer">
                        Indian Contract Act, 1872 (Section 73)
                      </span>
                      , the landlord is legally obligated to return your security deposit,
                      minus any legitimate deductions for damages beyond normal wear and
                      tear.
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-[13px] font-semibold text-ink-900 mb-1">
                      2. Timeline
                    </p>
                    <p className="text-[13px] text-ink-700 leading-relaxed">
                      As per the{" "}
                      <span className="text-navy-700 font-medium underline decoration-dotted cursor-pointer">
                        Delhi Rent Control Act
                      </span>{" "}
                      and standard{" "}
                      <span className="text-navy-700 font-medium underline decoration-dotted cursor-pointer">
                        Lease Deed
                      </span>{" "}
                      provisions, the deposit should typically be returned within 1-2 months
                      of vacating and handing over possession.
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-[13px] font-semibold text-ink-900 mb-1">
                      3. Steps You Can Take
                    </p>
                    <ul className="text-[13px] text-ink-700 space-y-1.5 list-none pl-0">
                      <li className="flex items-start gap-2">
                        <Icon name="check" size={12} className="text-green-600 mt-1 flex-shrink-0" />
                        Send a formal legal notice demanding the return of deposit
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="check" size={12} className="text-green-600 mt-1 flex-shrink-0" />
                        File a complaint in the Rent Control Tribunal
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="check" size={12} className="text-green-600 mt-1 flex-shrink-0" />
                        Approach the Consumer Forum if the amount is under Rs. 1 crore
                      </li>
                    </ul>
                  </div>

                  <div className="bg-saffron-50 border border-saffron-100 rounded-lg p-3 mb-3">
                    <p className="text-[12px] text-saffron-700 flex items-start gap-2">
                      <Icon name="info" size={13} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Important:</strong> Keep copies of your lease agreement,
                        rent receipts, and any communication with the landlord as evidence.
                      </span>
                    </p>
                  </div>

                  <p className="text-[11px] text-ink-400 mt-2">10:33 AM</p>
                </Card>
              </div>

              {/* Suggested Follow-ups */}
              <div className="flex gap-2 flex-wrap pl-10">
                <Chip variant="navy" className="cursor-pointer hover:bg-navy-100 text-[11px]">
                  <Icon name="doc" size={11} /> Draft a legal notice
                </Chip>
                <Chip variant="navy" className="cursor-pointer hover:bg-navy-100 text-[11px]">
                  <Icon name="users" size={11} /> Find a property lawyer
                </Chip>
                <Chip variant="navy" className="cursor-pointer hover:bg-navy-100 text-[11px]">
                  <Icon name="shield" size={11} /> Tenant rights guide
                </Chip>
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-paper border-t border-ink-100 px-6 py-3">
              <div className="flex items-center gap-2 border border-ink-200 rounded-lg px-3 py-1 bg-white focus-within:border-navy-500 transition-colors">
                <button className="p-1.5 rounded hover:bg-ink-50 cursor-pointer transition-colors">
                  <Icon name="plus" size={16} className="text-ink-400" />
                </button>
                <input
                  className="flex-1 py-2 text-[13px] font-sans outline-none bg-transparent"
                  placeholder="Type your legal question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="p-1.5 rounded hover:bg-ink-50 cursor-pointer transition-colors">
                  <Icon name="camera" size={16} className="text-ink-400" />
                </button>
                <Button variant="primary" size="sm">
                  <Icon name="send" size={14} />
                </Button>
              </div>
              <DisclaimerBanner />
            </div>
          </div>

          {/* Right Panel: Legal Term */}
          <div className="w-[300px] flex-shrink-0 bg-paper border-l border-ink-100 p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                Legal Term
              </h3>
              <Icon name="bookmark" size={14} className="text-ink-400 cursor-pointer hover:text-navy-700" />
            </div>

            <Card className="p-4 mb-4 border-l-[3px] border-l-navy-600">
              <h4 className="font-serif font-bold text-navy-900 text-base mb-2">
                Lease Deed
              </h4>
              <Chip variant="default" className="text-[10px] mb-3">Property Law</Chip>
              <p className="text-[13px] text-ink-700 leading-relaxed mb-3">
                A <strong>Lease Deed</strong> is a legal document that outlines the terms
                and conditions under which one party (lessor/landlord) agrees to rent
                property to another party (lessee/tenant) for a specified period and rent
                amount.
              </p>
              <div className="border-t border-ink-100 pt-3">
                <p className="text-[11px] font-semibold text-ink-500 mb-1.5">
                  Key Elements
                </p>
                <ul className="text-[12px] text-ink-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={10} className="text-green-600" />
                    Names of lessor and lessee
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={10} className="text-green-600" />
                    Property description and address
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={10} className="text-green-600" />
                    Duration and renewal terms
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={10} className="text-green-600" />
                    Rent amount and security deposit
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={10} className="text-green-600" />
                    Termination and notice period clauses
                  </li>
                </ul>
              </div>
            </Card>

            <div className="mb-4">
              <p className="text-[11px] font-semibold text-ink-500 mb-2">
                Relevant Sections
              </p>
              <div className="space-y-2">
                <Card className="p-3 cursor-pointer hover:shadow-sm transition-shadow">
                  <p className="text-[12px] font-semibold text-ink-800">
                    Transfer of Property Act, 1882
                  </p>
                  <p className="text-[11px] text-ink-500">Section 105 - Lease defined</p>
                </Card>
                <Card className="p-3 cursor-pointer hover:shadow-sm transition-shadow">
                  <p className="text-[12px] font-semibold text-ink-800">
                    Indian Registration Act, 1908
                  </p>
                  <p className="text-[11px] text-ink-500">
                    Section 17 - Documents requiring registration
                  </p>
                </Card>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-ink-500 mb-2">
                Related Terms
              </p>
              <div className="flex gap-1.5 flex-wrap">
                <Chip variant="default" className="text-[10px] cursor-pointer hover:bg-ink-100">
                  Rent Agreement
                </Chip>
                <Chip variant="default" className="text-[10px] cursor-pointer hover:bg-ink-100">
                  Security Deposit
                </Chip>
                <Chip variant="default" className="text-[10px] cursor-pointer hover:bg-ink-100">
                  Eviction Notice
                </Chip>
                <Chip variant="default" className="text-[10px] cursor-pointer hover:bg-ink-100">
                  Tenancy
                </Chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
