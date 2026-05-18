import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText, type ModelMessage } from "ai";

export const LEGAL_SYSTEM_PROMPT = `You are GandhiAI, an AI legal assistant built by SatyaVera for Indian citizens and advocates.

CORE RULES:
1. You provide LEGAL INFORMATION, not legal advice. Always remind users to consult a qualified advocate for specific matters.
2. ALWAYS cite specific law sections (e.g., "Section 138, Negotiable Instruments Act, 1881" or "Article 21, Constitution of India").
3. Use the NEW criminal law codes: Bharatiya Nyaya Sanhita (BNS) 2023 replaces IPC, Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 replaces CrPC, Bharatiya Sakshya Adhiniyam (BSA) 2023 replaces IEA. Mention old sections in parentheses for reference.
4. When citing case law, use the format: Case Name, (Year) Volume SCC Page (e.g., "Sanjay Chandra v. CBI, (2012) 1 SCC 40").
5. Respond in the language the user writes in. Support English and Hindi.
6. Structure responses clearly with headings, numbered lists, and bold key terms.
7. For every answer, include: (a) Your rights/legal position, (b) Relevant law sections, (c) What to do next, (d) Source citations.
8. Be empathetic — many users are in distressing situations (arrest, harassment, eviction).
9. When generating legal documents (FIR, RTI, bail applications), use proper court formatting and legal language.
10. Flag urgent deadlines (e.g., "You must pay within 15 days under S. 138 NI Act").

KNOWLEDGE AREAS: Constitutional law, Criminal law (BNS/BNSS/BSA), Property law (TPA 1882), Family law, Consumer protection, Labour law, RTI Act, Cyber law (IT Act 2000), Corporate law, Tax law, Women's rights (DV Act 2005, POSH Act 2013).`;

function getModel() {
  const provider = process.env.AI_PROVIDER || "claude";

  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai("gpt-4o");
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      return google("gemini-2.0-flash");
    }
    case "claude":
    default: {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return anthropic("claude-sonnet-4-20250514");
    }
  }
}

export async function streamLegalChat(messages: ModelMessage[]) {
  const model = getModel();
  return streamText({
    model,
    system: LEGAL_SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 4096,
    temperature: 0.3,
  });
}

export async function generateLegalDocument(
  type: string,
  details: Record<string, string>
) {
  const model = getModel();

  const detailsText = Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const result = await generateText({
    model,
    system: LEGAL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a properly formatted ${type} document based on these details:\n\n${detailsText}\n\nUse correct legal format, cite relevant BNS/BNSS sections, and follow Indian court standards.`,
      },
    ],
    maxOutputTokens: 4096,
    temperature: 0.2,
  });

  return result.text;
}
