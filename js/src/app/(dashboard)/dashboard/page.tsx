"use client";

import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/hooks/use-subscription";
import { useConversations } from "@/hooks/use-conversations";
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

const iconForCategory: Record<string, "chat" | "doc" | "shield" | "book"> = {
  ask: "chat",
  drafter: "doc",
  guides: "shield",
  default: "book",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { queriesUsed, queryLimit, loading: subLoading } = useSubscription();
  const { conversations, loading: convLoading } = useConversations();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const name = profile?.name?.split(" ")[0] || "";

  // Derive recent activity from conversations
  const recentActivity = conversations.slice(0, 3).map((c) => {
    const time = c.updatedAt?._seconds
      ? formatRelativeTime(c.updatedAt._seconds)
      : "";
    const icon = iconForCategory[c.category || ""] || iconForCategory.default;
    return {
      icon,
      title: c.title || "Untitled conversation",
      time,
      status: "Completed",
      statusColor: "text-green-600",
    };
  });

  return (
    <>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs text-ink-500 mb-1">{today}</p>
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">
          {name ? `Namaste, ${name}` : "Namaste"}{" "}
          <span role="img" aria-label="namaste">
            🙏
          </span>
        </h1>
        <p className="text-sm text-ink-600">{t("dashboard.howCanHelp")}</p>
      </div>

      {/* Usage Bar */}
      <div className="mb-7 max-w-sm">
        {subLoading ? (
          <div className="h-5 bg-ink-100 rounded animate-pulse" />
        ) : (
          <UsageBar used={queriesUsed} total={queryLimit === -1 ? queriesUsed : queryLimit} />
        )}
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
              {t("dashboard.recentActivity")}
            </h3>
            <Link
              href="/dashboard/ask"
              className="text-xs text-navy-700 font-semibold hover:underline"
            >
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {convLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-ink-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3 w-3/4 bg-ink-100 rounded animate-pulse" />
                    <div className="h-2 w-1/4 bg-ink-50 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">
                No recent activity yet. Start a conversation with GandhiAI!
              </p>
            ) : (
              recentActivity.map((item, idx) => (
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
              ))
            )}
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
    </>
  );
}

/** Format a Firestore _seconds timestamp as a relative time string. */
function formatRelativeTime(seconds: number): string {
  const now = Date.now() / 1000;
  const diff = now - seconds;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(seconds * 1000).toLocaleDateString("en-IN");
}
