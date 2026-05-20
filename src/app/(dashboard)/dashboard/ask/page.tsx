"use client";

import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/contexts/auth-context";
import { useConversations, useConversation } from "@/hooks/use-conversations";
import { useSubscription } from "@/hooks/use-subscription";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { GandhiAvatar } from "@/components/ui/gandhi-avatar";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { UIMessage } from "ai";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract plain text from a UIMessage's parts array. */
function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Format a Firestore _seconds timestamp into a human-readable time. */
function formatTime(seconds: number): string {
  const d = new Date(seconds * 1000);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Group conversations by Today / Last 7 Days / Older. */
function groupConversations(
  conversations: Array<{
    id: string;
    title: string;
    createdAt: { _seconds: number };
    updatedAt: { _seconds: number };
  }>
) {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const today: typeof conversations = [];
  const week: typeof conversations = [];
  const older: typeof conversations = [];

  for (const c of conversations) {
    const ts = c.updatedAt._seconds * 1000;
    if (ts >= todayStart.getTime()) today.push(c);
    else if (ts >= weekAgo) week.push(c);
    else older.push(c);
  }

  return { today, week, older };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AskPage() {
  const { t } = useI18n();
  const { user, profile, getToken } = useAuth();
  const {
    conversations,
    loading: convsLoading,
    createConversation,
    deleteConversation,
    refetch: refetchConversations,
  } = useConversations();
  const { queryLimit, queriesUsed } = useSubscription();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ---- Load selected conversation's messages ----
  const {
    messages: savedMessages,
    loading: messagesLoading,
  } = useConversation(activeConversationId);

  // ---- Streaming chat via AI SDK v6 ----
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const token = await getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [getToken]
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error: chatError,
    stop,
  } = useChat({
    transport,
    onFinish: async ({ message }) => {
      // Persist assistant message to Firestore
      if (activeConversationId) {
        const token = await getToken();
        const text = getMessageText(message);
        if (text) {
          await fetch(
            `/api/conversations/${activeConversationId}/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ role: "assistant", content: text }),
            }
          );
        }
        refetchConversations();
      }
    },
    onError: (err) => {
      console.error("Chat stream error:", err);
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // ---- Hydrate chat messages when loading a saved conversation ----
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    if (messagesLoading || !savedMessages) return;

    const hydrated: UIMessage[] = savedMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: m.content }],
    }));
    setMessages(hydrated);
  }, [activeConversationId, savedMessages, messagesLoading, setMessages]);

  // ---- Auto-scroll to bottom on new messages ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // ---- Filter conversations by search ----
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = groupConversations(filteredConversations);

  // ---- Handlers ----
  const handleNewChat = useCallback(async () => {
    setIsCreating(true);
    try {
      const result = await createConversation("New conversation");
      if (result?.id) {
        setActiveConversationId(result.id);
      }
    } finally {
      setIsCreating(false);
    }
  }, [createConversation]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [deleteConversation, activeConversationId]
  );

  const handleSend = useCallback(async () => {
    const text = inputRef.current?.value.trim();
    if (!text || isStreaming) return;

    // Auto-create a conversation if none selected
    let convId = activeConversationId;
    if (!convId) {
      setIsCreating(true);
      try {
        const result = await createConversation(
          text.slice(0, 60) + (text.length > 60 ? "..." : "")
        );
        if (!result?.id) return;
        convId = result.id;
        setActiveConversationId(convId);
      } finally {
        setIsCreating(false);
      }
    }

    // Persist user message to Firestore
    const token = await getToken();
    const isFirstMessage = messages.length === 0;
    await fetch(`/api/conversations/${convId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        role: "user",
        content: text,
        updateTitle: isFirstMessage,
      }),
    });

    if (isFirstMessage) {
      refetchConversations();
    }

    // Send via streaming chat
    sendMessage({ text });
  }, [
    activeConversationId,
    isStreaming,
    messages.length,
    createConversation,
    getToken,
    sendMessage,
    refetchConversations,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ---- User initials for avatar ----
  const initials = (profile?.name || user?.displayName || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ---- Queries remaining ----
  const queriesRemaining = queryLimit === -1 ? null : queryLimit - queriesUsed;

  return (
    <div className="-m-5 md:-m-7 md:-mx-10 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ============================================================= */}
      {/* LEFT PANEL: Conversation List                                  */}
      {/* ============================================================= */}
      <div className="w-[260px] flex-shrink-0 bg-paper border-r border-ink-100 flex flex-col">
        <div className="p-3">
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center mb-3"
            onClick={handleNewChat}
            disabled={isCreating}
          >
            {isCreating ? (
              <Icon name="loader" size={14} className="animate-spin" />
            ) : (
              <Icon name="plus" size={14} />
            )}
            {t("ask.newChat")}
          </Button>
          <div className="relative">
            <Icon
              name="search"
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              className="w-full border border-ink-100 bg-ink-50 rounded-md py-2 pl-8 pr-3 text-xs font-sans outline-none focus:border-navy-500"
              placeholder={t("ask.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 pb-3">
          {convsLoading && (
            <div className="flex items-center justify-center py-8">
              <Icon name="loader" size={18} className="animate-spin text-ink-400" />
            </div>
          )}

          {!convsLoading && conversations.length === 0 && (
            <p className="text-xs text-ink-400 text-center py-8 px-3">
              {t("ask.noConversations")}
            </p>
          )}

          {/* Today */}
          {grouped.today.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-2 pt-3 pb-1.5">
                {t("ask.today")}
              </p>
              {grouped.today.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConversationId}
                  onSelect={handleSelectConversation}
                  onDelete={handleDeleteConversation}
                />
              ))}
            </>
          )}

          {/* Last 7 Days */}
          {grouped.week.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-2 pt-4 pb-1.5">
                {t("ask.last7Days")}
              </p>
              {grouped.week.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConversationId}
                  onSelect={handleSelectConversation}
                  onDelete={handleDeleteConversation}
                />
              ))}
            </>
          )}

          {/* Older */}
          {grouped.older.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-2 pt-4 pb-1.5">
                {t("ask.older")}
              </p>
              {grouped.older.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConversationId}
                  onSelect={handleSelectConversation}
                  onDelete={handleDeleteConversation}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* CENTER PANEL: Chat Area                                        */}
      {/* ============================================================= */}
      <div className="flex-1 flex flex-col bg-bone min-w-0">
        {/* Chat Header */}
        <div className="bg-paper border-b border-ink-100 px-6 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <GandhiAvatar size="sm" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-ink-900">GandhiAI</h2>
              <p className="text-[11px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                {t("ask.online")}
              </p>
            </div>
            {isStreaming && (
              <Button variant="ghost" size="sm" onClick={stop}>
                <Icon name="x" size={12} />
                {t("ask.stop")}
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
          {/* Empty state: no conversation selected or new empty conversation */}
          {!activeConversationId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <GandhiAvatar size="lg" />
              <h3 className="mt-4 font-serif font-bold text-lg text-ink-900">
                {t("ask.welcomeTitle")}
              </h3>
              <p className="mt-2 text-sm text-ink-500 max-w-md">
                {t("ask.welcomeSubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  t("ask.suggestion1"),
                  t("ask.suggestion2"),
                  t("ask.suggestion3"),
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="text-[12px] px-3 py-2 rounded-lg border border-ink-200 bg-paper text-ink-700 hover:bg-navy-50 hover:border-navy-200 transition-colors cursor-pointer"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = suggestion;
                        inputRef.current.focus();
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading existing conversation messages */}
          {activeConversationId && messagesLoading && (
            <div className="flex items-center justify-center py-12">
              <Icon name="loader" size={20} className="animate-spin text-ink-400" />
              <span className="ml-2 text-sm text-ink-400">{t("ask.loadingMessages")}</span>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => {
            const text = getMessageText(msg);
            if (!text) return null;

            if (msg.role === "assistant") {
              return (
                <div key={msg.id} className="flex gap-3">
                  <GandhiAvatar size="sm" />
                  <Card className="p-4 max-w-xl">
                    <div className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap prose-sm">
                      {text}
                    </div>
                  </Card>
                </div>
              );
            }

            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  <Card className="p-4 max-w-xl bg-navy-50 border-navy-100">
                    <p className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap">
                      {text}
                    </p>
                  </Card>
                </div>
              );
            }

            return null;
          })}

          {/* Streaming indicator */}
          {isStreaming && messages.length > 0 && (
            <div className="flex gap-3">
              <GandhiAvatar size="sm" />
              <div className="flex items-center gap-2 text-ink-400 text-xs py-2">
                <Icon name="loader" size={14} className="animate-spin" />
                {status === "submitted" ? t("ask.thinking") : t("ask.streaming")}
              </div>
            </div>
          )}

          {/* Error display */}
          {chatError && (
            <div className="flex gap-3">
              <GandhiAvatar size="sm" />
              <Card className="p-4 max-w-xl border-red-200 bg-red-50">
                <p className="text-[13px] text-red-700">
                  <Icon name="siren" size={13} className="inline mr-1.5" />
                  {chatError.message || t("ask.error")}
                </p>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-paper border-t border-ink-100 px-6 py-3 flex-shrink-0">
          <div className="flex items-end gap-2 border border-ink-200 rounded-lg px-3 py-1 bg-white focus-within:border-navy-500 transition-colors">
            <button className="p-1.5 rounded hover:bg-ink-50 cursor-pointer transition-colors mb-1">
              <Icon name="plus" size={16} className="text-ink-400" />
            </button>
            <textarea
              ref={inputRef}
              className="flex-1 py-2 text-[13px] font-sans outline-none bg-transparent resize-none min-h-[36px] max-h-[120px]"
              placeholder={t("ask.inputPlaceholder")}
              rows={1}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
              disabled={isStreaming}
            />
            <button className="p-1.5 rounded hover:bg-ink-50 cursor-pointer transition-colors mb-1">
              <Icon name="camera" size={16} className="text-ink-400" />
            </button>
            <Button
              variant="primary"
              size="sm"
              className="mb-1"
              onClick={handleSend}
              disabled={isStreaming}
            >
              {isStreaming ? (
                <Icon name="loader" size={14} className="animate-spin" />
              ) : (
                <Icon name="send" size={14} />
              )}
            </Button>
          </div>
          <DisclaimerBanner />
        </div>
      </div>

      {/* ============================================================= */}
      {/* RIGHT PANEL: Info & Usage                                      */}
      {/* ============================================================= */}
      <div className="w-[280px] flex-shrink-0 bg-paper border-l border-ink-100 p-5 overflow-auto hidden lg:block">
        <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">
          {t("ask.infoTitle")}
        </h3>

        {/* Usage card */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="bolt" size={14} className="text-saffron-600" />
            <p className="text-xs font-semibold text-ink-700">
              {t("ask.usage")}
            </p>
          </div>
          {queriesRemaining !== null ? (
            <>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[22px] font-bold text-navy-800">
                  {queriesRemaining}
                </span>
                <span className="text-[11px] text-ink-400">
                  / {queryLimit} {t("ask.perDay")}
                </span>
              </div>
              <div className="w-full bg-ink-100 rounded-full h-1.5 mb-2">
                <div
                  className="bg-navy-600 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, (queriesRemaining / queryLimit) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-ink-400">
                {t("ask.queriesUsed", { count: queriesUsed })}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Icon name="crown" size={14} className="text-saffron-600" />
              <p className="text-xs text-ink-600">{t("ask.unlimited")}</p>
            </div>
          )}
        </Card>

        {/* Disclaimer card */}
        <Card className="p-4 mb-4 border-l-[3px] border-l-saffron-500">
          <div className="flex items-start gap-2">
            <Icon name="info" size={14} className="text-saffron-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ink-700 mb-1">
                {t("ask.importantTitle")}
              </p>
              <p className="text-[12px] text-ink-500 leading-relaxed">
                {t("ask.importantText")}
              </p>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-ink-700 mb-2">
            {t("ask.tipsTitle")}
          </p>
          <ul className="text-[12px] text-ink-600 space-y-2">
            <li className="flex items-start gap-2">
              <Icon name="check" size={10} className="text-green-600 mt-1 flex-shrink-0" />
              {t("ask.tip1")}
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size={10} className="text-green-600 mt-1 flex-shrink-0" />
              {t("ask.tip2")}
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size={10} className="text-green-600 mt-1 flex-shrink-0" />
              {t("ask.tip3")}
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Conversation list item
// ---------------------------------------------------------------------------

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete,
}: {
  conv: {
    id: string;
    title: string;
    updatedAt: { _seconds: number };
  };
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(conv.id)}
      className={`group w-full text-left px-3 py-2.5 rounded-md mb-0.5 cursor-pointer transition-colors ${
        active
          ? "bg-navy-50 border border-navy-100"
          : "hover:bg-ink-50 border border-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className={`text-[12.5px] truncate flex-1 ${
            active ? "font-semibold text-navy-800" : "text-ink-700"
          }`}
        >
          {conv.title || "Untitled"}
        </p>
        <button
          onClick={(e) => onDelete(e, conv.id)}
          className="hidden group-hover:block p-0.5 rounded hover:bg-ink-200 transition-colors flex-shrink-0"
          aria-label="Delete conversation"
        >
          <Icon name="x" size={10} className="text-ink-400" />
        </button>
      </div>
      <p className="text-[10px] text-ink-400 mt-0.5">
        {formatTime(conv.updatedAt._seconds)}
      </p>
    </button>
  );
}
