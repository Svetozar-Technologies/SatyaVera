import { streamLegalChat } from "@/lib/ai/providers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { apiError } from "@/lib/api/helpers";
import { rateLimit } from "@/lib/api/rate-limiter";
import { type ModelMessage } from "ai";

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return apiError("Unauthorized", 401);
    }

    // Rate limit: max 10 messages per minute per user
    const { allowed } = rateLimit(`chat-${decoded.uid}`, 10);
    if (!allowed) return apiError("Too many requests", 429);

    const { messages } = (await req.json()) as { messages: ModelMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return apiError("Messages array is required", 400);
    }

    // Validate messages array is non-empty
    if (messages.length === 0) {
      return apiError("Messages array must not be empty", 400);
    }

    // Validate each message has role + content
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== "object") {
        return apiError(`messages[${i}] must be an object`, 400);
      }
      if (!msg.role || typeof msg.role !== "string") {
        return apiError(`messages[${i}].role is required and must be a string`, 400);
      }
      if (!msg.content && msg.content !== "") {
        return apiError(`messages[${i}].content is required`, 400);
      }
    }

    const result = await streamLegalChat(messages);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return apiError(
      "Failed to generate response. Check your AI provider API key.",
      500
    );
  }
}
