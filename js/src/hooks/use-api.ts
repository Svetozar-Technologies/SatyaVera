"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";

interface UseApiOptions {
  /** Skip automatic fetch on mount */
  skip?: boolean;
  /** Require authentication token */
  auth?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(url: string | null, options: UseApiOptions = {}): UseApiResult<T> {
  const { auth = false, skip = false } = options;
  const { getToken } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip && !!url);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (auth) {
        const token = await getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers, signal: controller.signal });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }

      const json = await res.json();
      if (!controller.signal.aborted) {
        setData(json as T);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [url, auth, getToken]);

  useEffect(() => {
    if (!skip && url) {
      fetchData();
    }
    return () => abortRef.current?.abort();
  }, [fetchData, skip, url]);

  return { data, loading, error, refetch: fetchData };
}

/** POST/PUT/PATCH/DELETE helper */
export function useApiMutation<TBody = unknown, TResult = unknown>() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (url: string, method: string, body?: TBody): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error || `Request failed (${res.status})`);
        }

        return (await res.json()) as TResult;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return { mutate, loading, error };
}
