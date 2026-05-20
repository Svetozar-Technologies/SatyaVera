"use client";

import { useApi, useApiMutation } from "./use-api";

interface ConversationsResponse {
  conversations: Array<{
    id: string;
    title: string;
    category?: string;
    language: string;
    createdAt: { _seconds: number };
    updatedAt: { _seconds: number };
  }>;
}

interface ConversationDetailResponse {
  conversation: {
    id: string;
    title: string;
    category?: string;
    language: string;
  };
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    citations?: string[];
    createdAt: { _seconds: number };
  }>;
}

export function useConversations() {
  const { data, loading, error, refetch } = useApi<ConversationsResponse>(
    "/api/conversations",
    { auth: true }
  );
  const { mutate } = useApiMutation();

  const createConversation = async (title?: string, language?: string) => {
    const result = await mutate("/api/conversations", "POST", { title, language });
    if (result) await refetch();
    return result as { id: string } | null;
  };

  const deleteConversation = async (id: string) => {
    await mutate(`/api/conversations/${id}`, "DELETE");
    await refetch();
  };

  return {
    conversations: data?.conversations || [],
    loading,
    error,
    refetch,
    createConversation,
    deleteConversation,
  };
}

export function useConversation(id: string | null) {
  const { data, loading, error, refetch } = useApi<ConversationDetailResponse>(
    id ? `/api/conversations/${id}` : null,
    { auth: true }
  );

  return {
    conversation: data?.conversation || null,
    messages: data?.messages || [],
    loading,
    error,
    refetch,
  };
}
