"use client";

import { useApi, useApiMutation } from "./use-api";

interface ProfileResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "CITIZEN" | "ADVOCATE" | "ADMIN";
    language: string;
    state?: string;
    city?: string;
    district?: string;
    pincode?: string;
    barCouncilNumber?: string;
    barCouncilState?: string;
    yearsOfPractice?: number;
    specializations?: string[];
    courts?: string[];
    verified: boolean;
    image?: string;
    emergencyContact?: {
      name: string;
      relation: string;
      phone: string;
      altPhone?: string;
    };
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
      newsletter: boolean;
      quizReminders: boolean;
      lawyerUpdates: boolean;
    };
    privacySettings?: {
      saveChatHistory: boolean;
      analyticsOptIn: boolean;
    };
  };
}

export function useProfile() {
  const { data, loading, error, refetch } = useApi<ProfileResponse>(
    "/api/settings",
    { auth: true }
  );
  const { mutate, loading: saving, error: saveError } = useApiMutation();

  const updateProfile = async (updates: Record<string, unknown>) => {
    const result = await mutate("/api/settings", "PUT", updates);
    if (result) await refetch();
    return result;
  };

  return {
    profile: data?.profile || null,
    loading,
    error,
    refetch,
    updateProfile,
    saving,
    saveError,
  };
}
