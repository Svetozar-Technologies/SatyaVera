"use client";

import { useApi } from "./use-api";

interface TemplatesResponse {
  templates: Array<{
    id: string;
    name: string;
    nameHi: string;
    slug: string;
    category: string;
    description: string;
    descriptionHi: string;
    icon: string;
    format: string;
    premium: boolean;
    downloadCount?: number;
    content?: string;
    contentHi?: string;
    order?: number;
  }>;
}

export function useTemplates(category?: string) {
  const params = category && category !== "all" ? `?category=${category}` : "";
  const { data, loading, error, refetch } = useApi<TemplatesResponse>(`/api/templates${params}`);
  return { templates: data?.templates || [], loading, error, refetch };
}
