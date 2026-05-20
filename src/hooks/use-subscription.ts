"use client";

import { useApi } from "./use-api";

interface SubscriptionResponse {
  subscription: {
    id?: string;
    plan: "FREE" | "CITIZEN_PREMIUM" | "LAWYER_PRO";
    status: string;
    queriesUsedToday: number;
    documentsUsedThisMonth: number;
    lastResetDate: string;
    razorpaySubscriptionId?: string;
    currentPeriodEnd?: unknown;
  };
}

export function useSubscription() {
  const { data, loading, error, refetch } = useApi<SubscriptionResponse>(
    "/api/subscriptions",
    { auth: true }
  );

  const subscription = data?.subscription || null;
  const plan = subscription?.plan || "FREE";
  const queryLimit = plan === "FREE" ? 5 : -1;
  const queriesUsed = subscription?.queriesUsedToday || 0;

  return {
    subscription,
    plan,
    queryLimit,
    queriesUsed,
    isPremium: plan !== "FREE",
    loading,
    error,
    refetch,
  };
}
