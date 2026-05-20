import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;
    const convDoc = await adminDb.collection("conversations").doc(id).get();

    if (!convDoc.exists) return apiError("Conversation not found", 404);
    if (convDoc.data()?.userId !== decoded.uid)
      return apiError("Unauthorized", 403);

    const messagesSnap = await adminDb
      .collection("conversations")
      .doc(id)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({
      conversation: { id: convDoc.id, ...convDoc.data() },
      messages,
    });
  } catch {
    return apiError("Failed to fetch conversation", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;
    const convDoc = await adminDb.collection("conversations").doc(id).get();

    if (!convDoc.exists) return apiError("Conversation not found", 404);
    if (convDoc.data()?.userId !== decoded.uid)
      return apiError("Unauthorized", 403);

    // Delete all messages in the conversation
    const messagesSnap = await adminDb
      .collection("conversations")
      .doc(id)
      .collection("messages")
      .get();

    const batch = adminDb.batch();
    messagesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(adminDb.collection("conversations").doc(id));
    await batch.commit();

    return apiResponse({ success: true });
  } catch {
    return apiError("Failed to delete conversation", 500);
  }
}
