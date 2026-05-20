import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const snapshot = await adminDb
      .collection("conversations")
      .where("userId", "==", decoded.uid)
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();

    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ conversations });
  } catch {
    return apiResponse({ conversations: [] });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const body = await req.json();

    const docRef = await adminDb.collection("conversations").add({
      userId: decoded.uid,
      title: body.title || "New Conversation",
      category: body.category || null,
      language: body.language || "en",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return apiResponse({ id: docRef.id }, 201);
  } catch {
    return apiError("Failed to create conversation", 500);
  }
}
