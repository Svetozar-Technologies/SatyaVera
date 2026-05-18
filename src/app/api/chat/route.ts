import { streamLegalChat } from "@/lib/ai/providers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { type ModelMessage } from "ai";

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = (await req.json()) as { messages: ModelMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Messages array is required" }, { status: 400 });
    }

    const result = await streamLegalChat(messages);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response. Check your AI provider API key." },
      { status: 500 }
    );
  }
}
