import { generateLegalDocument } from "@/lib/ai/providers";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, details } = (await req.json()) as {
      type: string;
      details: Record<string, string>;
    };

    if (!type || !details) {
      return Response.json({ error: "Type and details are required" }, { status: 400 });
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

    return Response.json({ id: docRef.id, content, type, status: "DRAFT" });
  } catch (error) {
    console.error("Document generation error:", error);
    return Response.json(
      { error: "Failed to generate document. Check your AI provider API key." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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

    return Response.json({ documents });
  } catch {
    // Return empty list if no documents or index not ready
    return Response.json({ documents: [] });
  }
}
