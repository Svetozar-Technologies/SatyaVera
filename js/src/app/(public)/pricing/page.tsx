"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/contexts/auth-context";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { email?: string; name?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PlanFeature {
  text: string;
  color: "green" | "saffron";
}

interface Plan {
  name: string;
  planKey: string | null; // null = free plan
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
    planKey: null,
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
    planKey: "CITIZEN_PREMIUM",
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
    planKey: "LAWYER_PRO",
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
  const { user, profile, getToken } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanAction = async (plan: Plan) => {
    setError(null);

    // Free plan: always go to signup
    if (!plan.planKey) {
      router.push("/signup");
      return;
    }

    // Paid plan: if not logged in, redirect to signup
    if (!user) {
      router.push("/signup");
      return;
    }

    // Paid plan + logged in: trigger Razorpay checkout
    await handleUpgrade(plan.planKey);
  };

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planKey, billing }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Failed to create order");
      }

      const { orderId, amount, currency, keyId } = await res.json();

      if (!window.Razorpay) {
        throw new Error("Payment SDK not loaded. Please refresh and try again.");
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "SatyaVera",
        description: `${planKey.replace("_", " ")} Subscription`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const errBody = await verifyRes.json().catch(() => null);
              throw new Error(errBody?.error || "Payment verification failed");
            }

            router.push("/dashboard?upgraded=true");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          email: user?.email || undefined,
          name: profile?.name || undefined,
        },
        theme: { color: "#1e3a5f" },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bone flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <PublicNav active="pricing" />

      {/* Header */}
      <section className="px-6 md:px-20 pt-16 pb-12 text-center">
        <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-saffron-600 mb-3 block">
          {t("nav.pricing")}
        </span>
        <h1 className="font-serif text-[44px] font-semibold text-navy-900 leading-[1.1] mb-4">
          {t("pricing.title")}
        </h1>
        <p className="text-ink-500 text-lg max-w-xl mx-auto mb-8">
          {t("pricing.subtitle")}
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex bg-ink-50 rounded-full p-1 gap-1">
          <Chip
            variant={billing === "monthly" ? "navy" : "default"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setBilling("monthly")}
          >
            {t("pricing.monthly")}
          </Chip>
          <Chip
            variant={billing === "yearly" ? "navy" : "default"}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setBilling("yearly")}
          >
            {t("pricing.yearly")}
          </Chip>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="px-6 md:px-20 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-500 hover:text-red-700 font-semibold"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="px-6 md:px-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isLoading = loadingPlan === plan.planKey;

            return (
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
                <div className="mb-6">
                  <Button
                    variant={plan.ctaVariant}
                    size="lg"
                    className="w-full justify-center"
                    disabled={isLoading || (loadingPlan !== null && !isLoading)}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>

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
            );
          })}
        </div>
      </section>

      {/* Custom Plan CTA */}
      <section className="px-6 md:px-20 pb-16 text-center">
        <p className="text-ink-500 text-base">
          {t("pricing.customPlan")}{" "}
          <Link href="#" className="text-navy-700 font-semibold hover:underline">
            {t("pricing.contactUs")}
          </Link>
        </p>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
