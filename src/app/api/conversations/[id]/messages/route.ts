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
    if (!body.role || !body.content) {
      return apiError("role and content are required", 400);
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
