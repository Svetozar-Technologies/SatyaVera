import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;

    // Verify ownership
    const convDoc = await adminDb.collection("conversations").doc(id).get();
    if (!convDoc.exists) return apiError("Conversation not found", 404);
    if (convDoc.data()?.userId !== decoded.uid)
      return apiError("Unauthorized", 403);

    const body = await req.json();

    // Validate role
    if (!body.role || (body.role !== "user" && body.role !== "assistant")) {
      return apiError('role must be "user" or "assistant"', 400);
    }

    // Validate content
    if (!body.content || typeof body.content !== "string") {
      return apiError("content must be a non-empty string", 400);
    }
    if (body.content.length > 10000) {
      return apiError("content must be at most 10000 characters", 400);
    }

    // Validate citations if present
    if (body.citations !== undefined) {
      if (!Array.isArray(body.citations)) {
        return apiError("citations must be an array", 400);
      }
      for (const citation of body.citations) {
        if (typeof citation !== "string") {
          return apiError("each citation must be a string", 400);
        }
      }
    }

    const msgRef = await adminDb
      .collection("conversations")
      .doc(id)
      .collection("messages")
      .add({
        role: body.role,
        content: body.content,
        citations: body.citations || [],
        createdAt: FieldValue.serverTimestamp(),
      });

    // Update conversation's updatedAt and title if first user message
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (body.role === "user" && body.updateTitle) {
      updateData.title =
        body.content.slice(0, 60) +
        (body.content.length > 60 ? "..." : "");
    }
    await adminDb.collection("conversations").doc(id).update(updateData);

    return apiResponse({ id: msgRef.id }, 201);
  } catch {
    return apiError("Failed to add message", 500);
  }
}
