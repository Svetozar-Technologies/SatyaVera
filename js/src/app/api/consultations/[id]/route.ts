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

    // Role-based status authorization
    const isLawyer = data.lawyerId === decoded.uid;
    const isCitizen = data.citizenId === decoded.uid;

    if (
      (body.status === "ACCEPTED" || body.status === "DECLINED") &&
      !isLawyer
    ) {
      return apiError(
        "Only the advocate can accept or decline a consultation",
        403
      );
    }

    if (body.status === "COMPLETED" && !isCitizen && !isLawyer) {
      return apiError(
        "Only a party to this consultation can mark it as completed",
        403
      );
    }

    // Validate scheduledAt as ISO date string if present
    if (body.scheduledAt !== undefined) {
      if (
        typeof body.scheduledAt !== "string" ||
        isNaN(Date.parse(body.scheduledAt))
      ) {
        return apiError("scheduledAt must be a valid ISO date string", 400);
      }
    }

    // Validate notes as string, max 1000 chars
    if (body.notes !== undefined) {
      if (typeof body.notes !== "string") {
        return apiError("notes must be a string", 400);
      }
      if (body.notes.length > 1000) {
        return apiError("notes must be at most 1000 characters", 400);
      }
    }

    const updates: Record<string, unknown> = {
      status: body.status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (body.scheduledAt) updates.scheduledAt = body.scheduledAt;
    if (body.notes !== undefined) updates.notes = body.notes;

    await adminDb.collection("consultationRequests").doc(id).update(updates);

    return apiResponse({ success: true });
  } catch {
    return apiError("Failed to update consultation", 500);
  }
}
