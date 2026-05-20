"use client";

import { useApi } from "./use-api";

interface LawyersResponse {
  lawyers: Array<{
    id: string;
    name: string;
    photo?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    experience: number;
    location: string;
    city: string;
    state: string;
    practiceAreas: string[];
    languages: string[];
    fee: string;
    feeAmount?: number;
    availability: string;
    courts: string[];
    description: string;
    descriptionHi: string;
  }>;
}

interface LawyerFilters {
  area?: string;
  city?: string;
  language?: string;
  sort?: string;
  search?: string;
}

export function useLawyers(filters: LawyerFilters = {}) {
  const params = new URLSearchParams();
  if (filters.area && filters.area !== "all") params.set("area", filters.area);
  if (filters.city) params.set("city", filters.city);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  const url = `/api/lawyers${qs ? `?${qs}` : ""}`;
  const { data, loading, error, refetch } = useApi<LawyersResponse>(url);
  return { lawyers: data?.lawyers || [], loading, error, refetch };
}
