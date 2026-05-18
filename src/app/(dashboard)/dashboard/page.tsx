"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { UsageBar } from "@/components/ui/usage-bar";
import Link from "next/link";

const quickActions = [
  {
    icon: "sparkles" as const,
    title: "Ask GandhiAI",
    desc: "Get instant legal guidance in plain language",
    href: "/dashboard/ask",
    color: "bg-navy-50 text-navy-700",
  },
  {
    icon: "doc" as const,
    title: "Draft FIR / RTI / Complaint",
    desc: "AI-powered document drafting assistant",
    href: "/dashboard/drafter",
    color: "bg-saffron-50 text-saffron-700",
  },
  {
    icon: "camera" as const,
    title: "Scan a Legal Document",
    desc: "Upload and get a plain-language summary",
    href: "/dashboard/scanner",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: "shield" as const,
    title: "Know Your Rights",
    desc: "Step-by-step guides for common situations",
    href: "/dashboard/guides",
    color: "bg-navy-50 text-navy-700",
  },
  {
    icon: "users" as const,
    title: "Find a Lawyer",
    desc: "Search verified advocates near you",
    href: "/dashboard/lawyers",
    color: "bg-saffron-50 text-saffron-700",
  },
  {
    icon: "siren" as const,
    title: "Emergency Help",
    desc: "Women helpline, police, legal aid contacts",
    href: "/dashboard/sos",
    color: "bg-red-50 text-red-700",
    emergency: true,
  },
];

const recentActivity = [
  {
    icon: "chat" as const,
    title: "Asked about tenant eviction rights",
    time: "2 hours ago",
    status: "Completed",
    statusColor: "text-green-600",
  },
  {
    icon: "doc" as const,
    title: "Drafted RTI application for municipal records",
    time: "Yesterday",
    status: "Draft saved",
    statusColor: "text-saffron-600",
  },
  {
    icon: "shield" as const,
    title: "Read: Rights During Police Arrest",
    time: "3 days ago",
    status: "Bookmarked",
    statusColor: "text-navy-600",
  },
];

export default function DashboardPage() {
  const { t } = useI18n();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="home" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Greeting */}
          <div className="mb-6">
            <p className="text-xs text-ink-500 mb-1">{today}</p>
            <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">
              Namaste, Aarav{" "}
              <span role="img" aria-label="namaste">
                🙏
              </span>
            </h1>
            <p className="text-sm text-ink-600">
              How can GandhiAI help you today?
            </p>
          </div>

          {/* Usage Bar */}
          <div className="mb-7 max-w-sm">
            <UsageBar used={2} total={5} />
          </div>

          {/* Quick Actions Grid */}
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} className="no-underline">
                <Card
                  className={`p-5 hover:shadow-md transition-shadow cursor-pointer ${
                    action.emergency ? "border-t-[3px] border-t-red-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}
                    >
                      <Icon name={action.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink-900 mb-0.5">
                        {action.title}
                      </h3>
                      <p className="text-xs text-ink-500 leading-relaxed">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Bottom Section: Recent Activity + Featured Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Recent Activity */}
            <Card className="lg:col-span-3 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-ink-900">
                  Recent Activity
                </h3>
                <Link
                  href="/dashboard/ask"
                  className="text-xs text-navy-700 font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {recentActivity.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={14} className="text-ink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink-800 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-ink-400">{item.time}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Featured Guide */}
            <Card className="lg:col-span-2 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="fire" size={14} className="text-saffron-600" />
                <h3 className="font-semibold text-sm text-ink-900">
                  Featured Guide
                </h3>
              </div>
              <div className="bg-navy-50 rounded-lg p-4 mb-4">
                <h4 className="font-serif font-bold text-navy-900 text-base mb-1">
                  Your Rights if Arrested
                </h4>
                <p className="text-xs text-ink-600 mb-3 leading-relaxed">
                  Learn what police can and cannot do during an arrest. Based on
                  the Code of Criminal Procedure and Supreme Court rulings in
                  D.K. Basu v. State of West Bengal.
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-[10px] font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                    Criminal Law
                  </span>
                  <span className="text-[10px] font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                    Police
                  </span>
                  <span className="text-[10px] font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                    Fundamental Rights
                  </span>
                </div>
              </div>
              <Link href="/dashboard/guides" className="no-underline">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  Read Guide <Icon name="arrowR" size={14} />
                </Button>
              </Link>
              <div className="mt-4 pt-4 border-t border-ink-100">
                <p className="text-[11px] text-ink-400 font-medium mb-2">
                  Popular this week
                </p>
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/dashboard/guides"
                    className="text-xs text-navy-700 hover:underline flex items-center gap-1.5"
                  >
                    <Icon name="chevR" size={10} />
                    Tenant Rights Against Eviction
                  </Link>
                  <Link
                    href="/dashboard/guides"
                    className="text-xs text-navy-700 hover:underline flex items-center gap-1.5"
                  >
                    <Icon name="chevR" size={10} />
                    Filing an RTI Application
                  </Link>
                  <Link
                    href="/dashboard/guides"
                    className="text-xs text-navy-700 hover:underline flex items-center gap-1.5"
                  >
                    <Icon name="chevR" size={10} />
                    Women&apos;s Rights: Domestic Violence Act
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
