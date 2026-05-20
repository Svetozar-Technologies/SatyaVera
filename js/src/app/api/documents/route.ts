import { generateLegalDocument } from "@/lib/ai/providers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { apiError, apiResponse } from "@/lib/api/helpers";
import { rateLimit } from "@/lib/api/rate-limiter";

const VALID_DOCUMENT_TYPES = [
  "FIR",
  "RTI",
  "COMPLAINT",
  "BAIL_APPLICATION",
  "NOTICE",
  "AGREEMENT",
  "AFFIDAVIT",
  "OTHER",
] as const;

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return apiError("Unauthorized", 401);
    }

    // Rate limit: max 5 document generations per minute per user
    const { allowed } = rateLimit(`documents-${decoded.uid}`, 5);
    if (!allowed) return apiError("Too many requests", 429);

    const { type, details } = (await req.json()) as {
      type: string;
      details: Record<string, string>;
    };

    if (!type || !details) {
      return apiError("Type and details are required", 400);
    }

    // Validate type is one of the allowed document types
    if (
      !VALID_DOCUMENT_TYPES.includes(type as (typeof VALID_DOCUMENT_TYPES)[number])
    ) {
      return apiError(
        `type must be one of: ${VALID_DOCUMENT_TYPES.join(", ")}`,
        400
      );
    }

    // Validate details is an object with string values
    if (typeof details !== "object" || Array.isArray(details)) {
      return apiError("details must be an object", 400);
    }
    for (const [key, value] of Object.entries(details)) {
      if (typeof value !== "string") {
        return apiError(`details.${key} must be a string`, 400);
      }
    }

    const content = await generateLegalDocument(type, details);

    // Save to Firestore
    const docRef = await adminDb.collection("documents").add({
      userId: decoded.uid,
      type,
      title: details.title || `${type} Document`,
      content,
      status: "DRAFT",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return apiResponse({ id: docRef.id, content, type, status: "DRAFT" });
  } catch (error) {
    console.error("Document generation error:", error);
    return apiError(
      "Failed to generate document. Check your AI provider API key.",
      500
    );
  }
}

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return apiError("Unauthorized", 401);
    }

    const snapshot = await adminDb
      .collection("documents")
      .where("userId", "==", decoded.uid)
      .orderBy("updatedAt", "desc")
      .limit(20)
      .get();

    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ documents });
  } catch {
    // Return empty list if no documents or index not ready
    return apiResponse({ documents: [] });
  }
}
