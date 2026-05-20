import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    // Get user's role to determine which field to query
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    const field = role === "ADVOCATE" ? "lawyerId" : "citizenId";

    const snapshot = await adminDb
      .collection("consultationRequests")
      .where(field, "==", decoded.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const consultations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ consultations });
  } catch {
    return apiResponse({ consultations: [] });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const body = await req.json();
    if (!body.lawyerId || !body.topic) {
      return apiError("lawyerId and topic are required", 400);
    }

    // Get citizen name from profile
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const userName = userDoc.data()?.name || "Anonymous";

    const docRef = await adminDb.collection("consultationRequests").add({
      citizenId: decoded.uid,
      lawyerId: body.lawyerId,
      citizenName: userName,
      topic: body.topic,
      mode: body.mode || "phone",
      status: "PENDING",
      notes: body.notes || "",
      fee: body.fee || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return apiResponse({ id: docRef.id }, 201);
  } catch {
    return apiError("Failed to create consultation request", 500);
  }
}
