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

const PHONE_RE = /^\+?[0-9]{7,15}$/;

function validateSettingsFields(
  body: Record<string, unknown>
): string | null {
  // name: string, max 100 chars
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.length > 100) {
      return "name must be a string with max 100 characters";
    }
  }

  // phone: string, must match pattern or be empty
  if (body.phone !== undefined) {
    if (typeof body.phone !== "string") {
      return "phone must be a string";
    }
    if (body.phone !== "" && !PHONE_RE.test(body.phone)) {
      return "phone must match format +XXXXXXXXXX (7-15 digits) or be empty";
    }
  }

  // language: must be "en" or "hi"
  if (body.language !== undefined) {
    if (body.language !== "en" && body.language !== "hi") {
      return 'language must be "en" or "hi"';
    }
  }

  // String fields with max 100 chars
  for (const field of ["state", "city", "district", "pincode"] as const) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || (body[field] as string).length > 100) {
        return `${field} must be a string with max 100 characters`;
      }
    }
  }

  // yearsOfPractice: number, 0-80
  if (body.yearsOfPractice !== undefined) {
    if (
      typeof body.yearsOfPractice !== "number" ||
      !Number.isFinite(body.yearsOfPractice) ||
      body.yearsOfPractice < 0 ||
      body.yearsOfPractice > 80
    ) {
      return "yearsOfPractice must be a number between 0 and 80";
    }
  }

  // specializations: array of strings, max 10 items, each max 50 chars
  if (body.specializations !== undefined) {
    if (!Array.isArray(body.specializations)) {
      return "specializations must be an array";
    }
    if (body.specializations.length > 10) {
      return "specializations can have at most 10 items";
    }
    for (const item of body.specializations) {
      if (typeof item !== "string" || item.length > 50) {
        return "each specialization must be a string with max 50 characters";
      }
    }
  }

  return null;
}

export async function PUT(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const body = await req.json();

    // Validate field types and constraints
    const validationError = validateSettingsFields(body);
    if (validationError) {
      return apiError(validationError, 400);
    }

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
