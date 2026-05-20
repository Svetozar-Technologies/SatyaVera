"use client";

import { useApi } from "./use-api";

interface DictionaryResponse {
  entries: Array<{
    id: string;
    termEn: string;
    termHi: string;
    pronunciation?: string;
    origin?: string;
    definitionEn: string;
    definitionHi: string;
    exampleEn?: string;
    exampleHi?: string;
    relatedTerms?: string[];
    relatedSections?: string[];
    source: string;
    category: string;
    letter: string;
  }>;
}

export function useDictionary(letter?: string, category?: string, search?: string) {
  const params = new URLSearchParams();
  if (letter) params.set("letter", letter);
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  const qs = params.toString();
  const url = `/api/dictionary${qs ? `?${qs}` : ""}`;
  const { data, loading, error, refetch } = useApi<DictionaryResponse>(url);
  return { entries: data?.entries || [], loading, error, refetch };
}
