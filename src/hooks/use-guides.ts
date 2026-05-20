"use client";

import { useApi } from "./use-api";

interface GuidesResponse {
  guides: Array<{
    id: string;
    title: string;
    titleHi: string;
    slug: string;
    category: string;
    description: string;
    descriptionHi: string;
    icon: string;
    tags: string[];
    readTime: string;
    content?: string;
    contentHi?: string;
    rights?: string[];
    rightsHi?: string[];
    steps?: Array<{ title: string; titleHi: string; description: string; descriptionHi: string }>;
    relatedLawSections?: string[];
    readCount?: number;
    featured?: boolean;
    order?: number;
  }>;
}

export function useGuides(category?: string) {
  const params = category && category !== "all" ? `?category=${category}` : "";
  const { data, loading, error, refetch } = useApi<GuidesResponse>(`/api/guides${params}`);
  return { guides: data?.guides || [], loading, error, refetch };
}
