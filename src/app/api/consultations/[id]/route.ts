import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    if (
      !body.status ||
      !["ACCEPTED", "DECLINED", "COMPLETED"].includes(body.status)
    ) {
      return apiError(
        "Valid status is required (ACCEPTED, DECLINED, COMPLETED)",
        400
      );
    }

    const consultDoc = await adminDb
      .collection("consultationRequests")
      .doc(id)
      .get();
    if (!consultDoc.exists) return apiError("Consultation not found", 404);

    const data = consultDoc.data()!;
    if (data.lawyerId !== decoded.uid && data.citizenId !== decoded.uid) {
      return apiError("Unauthorized", 403);
    }

    const updates: Record<string, unknown> = {
      status: body.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (body.scheduledAt) updates.scheduledAt = body.scheduledAt;
    if (body.notes) updates.notes = body.notes;

    await adminDb.collection("consultationRequests").doc(id).update(updates);

    return apiResponse({ success: true });
  } catch {
    return apiError("Failed to update consultation", 500);
  }
}
