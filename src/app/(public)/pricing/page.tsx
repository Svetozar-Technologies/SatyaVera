"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";

interface PlanFeature {
  text: string;
  color: "green" | "saffron";
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyLabel: string;
  yearlyLabel: string;
  features: PlanFeature[];
  cta: string;
  ctaVariant: "ghost" | "saffron";
  badge?: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "Get started with basic legal awareness tools at no cost.",
    monthlyPrice: "0",
    yearlyPrice: "0",
    monthlyLabel: "forever",
    yearlyLabel: "forever",
    cta: "Get Started Free",
    ctaVariant: "ghost",
    features: [
      { text: "5 GandhiAI questions per day", color: "green" },
      { text: "Basic rights guides (10+ topics)", color: "green" },
      { text: "Legal dictionary access", color: "green" },
      { text: "1 document draft per month", color: "green" },
      { text: "Community support", color: "green" },
      { text: "English & Hindi languages", color: "green" },
      { text: "SOS emergency helplines", color: "green" },
    ],
  },
  {
    name: "Citizen Premium",
    description: "Unlimited access to all citizen legal awareness features.",
    monthlyPrice: "99",
    yearlyPrice: "999",
    monthlyLabel: "/mo",
    yearlyLabel: "/yr",
    cta: "Upgrade to Premium",
    ctaVariant: "saffron",
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "Unlimited GandhiAI conversations", color: "saffron" },
      { text: "All rights guides & step-by-step walkthroughs", color: "saffron" },
      { text: "Unlimited document drafts & templates", color: "saffron" },
      { text: "Document scanner with AI analysis", color: "saffron" },
      { text: "Priority lawyer matching", color: "saffron" },
      { text: "All 8 regional languages", color: "saffron" },
      { text: "Email & chat support", color: "saffron" },
    ],
  },
  {
    name: "Lawyer Pro",
    description: "Professional AI tools built for practicing advocates.",
    monthlyPrice: "499",
    yearlyPrice: "4,999",
    monthlyLabel: "/mo",
    yearlyLabel: "/yr",
    cta: "Start Free Trial",
    ctaVariant: "ghost",
    features: [
      { text: "AI-powered legal document drafter", color: "green" },
      { text: "Case law research across 22 High Courts", color: "green" },
      { text: "Bare Acts browser with smart search", color: "green" },
      { text: "Argument builder with citation suggestions", color: "green" },
      { text: "Client management dashboard", color: "green" },
      { text: "Get listed in citizen lawyer directory", color: "green" },
      { text: "Priority support with legal tech team", color: "green" },
      { text: "Export to .docx, .pdf with court formatting", color: "green" },
    ],
  },
];

export default function PricingPage() {
  const { t } = useI18n();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-bone flex flex-col">
      <PublicNav active="pricing" />

      {/* Header */}
      <section className="px-6 md:px-20 pt-16 pb-12 text-center">
        <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-saffron-600 mb-3 block">
          Pricing
        </span>
        <h1 className="font-serif text-[44px] font-semibold text-navy-900 leading-[1.1] mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-ink-500 text-lg max-w-xl mx-auto mb-8">
          Start for free. Upgrade when you need more. No hidden fees, no surprises.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex bg-ink-50 rounded-full p-1 gap-1">
          <Chip
            variant={billing === "monthly" ? "navy" : "default"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </Chip>
          <Chip
            variant={billing === "yearly" ? "navy" : "default"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setBilling("yearly")}
          >
            Yearly
            <span className="text-green-600 font-semibold ml-1">Save 15%</span>
          </Chip>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 md:px-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col p-8 ${
                plan.highlight
                  ? "border-2 border-saffron-600 shadow-lg"
                  : ""
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Chip variant="saffron" className="shadow-sm font-bold">
                    {plan.badge}
                  </Chip>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="font-serif text-xl font-semibold text-navy-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-ink-500 text-lg">&#8377;</span>
                <span className="font-serif text-[42px] font-bold text-navy-900 leading-none">
                  {billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-ink-500 text-sm ml-1">
                  {billing === "monthly" ? plan.monthlyLabel : plan.yearlyLabel}
                </span>
              </div>

              {/* CTA */}
              <Link href="/signup" className="mb-6">
                <Button
                  variant={plan.ctaVariant}
                  size="lg"
                  className="w-full justify-center"
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Divider */}
              <div className="h-px bg-ink-100 mb-6" />

              {/* Features */}
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Icon
                      name="check"
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        feature.color === "saffron" ? "text-saffron-600" : "text-green-600"
                      }`}
                    />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Custom Plan CTA */}
      <section className="px-6 md:px-20 pb-16 text-center">
        <p className="text-ink-500 text-base">
          Need a custom plan for your law firm or organization?{" "}
          <Link href="#" className="text-navy-700 font-semibold hover:underline">
            Contact us <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
