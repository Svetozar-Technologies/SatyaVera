import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const doc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!doc.exists) return apiError("Profile not found", 404);

    return apiResponse({ profile: { id: doc.id, ...doc.data() } });
  } catch {
    return apiError("Failed to fetch profile", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const body = await req.json();

    // Only allow updating safe fields
    const allowedFields = [
      "name",
      "phone",
      "language",
      "state",
      "city",
      "district",
      "pincode",
      "image",
      "emergencyContact",
      "notifications",
      "privacySettings",
      "barCouncilNumber",
      "barCouncilState",
      "yearsOfPractice",
      "specializations",
      "courts",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    updates.updatedAt = FieldValue.serverTimestamp();

    await adminDb.collection("users").doc(decoded.uid).update(updates);

    const updated = await adminDb.collection("users").doc(decoded.uid).get();
    return apiResponse({ profile: { id: updated.id, ...updated.data() } });
  } catch {
    return apiError("Failed to update profile", 500);
  }
}
