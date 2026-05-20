import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const subRef = adminDb.collection("subscriptions").doc(decoded.uid);
    const doc = await subRef.get();
    const today = new Date().toISOString().split("T")[0];

    if (!doc.exists) {
      await subRef.set({
        plan: "FREE",
        status: "active",
        queriesUsedToday: 1,
        documentsUsedThisMonth: 0,
        lastResetDate: today,
        lastDocResetDate: today,
      });
      return apiResponse({ allowed: true, used: 1, limit: 5 });
    }

    const data = doc.data()!;

    // Reset if new day
    if (data.lastResetDate !== today) {
      await subRef.update({ queriesUsedToday: 1, lastResetDate: today });
      return apiResponse({
        allowed: true,
        used: 1,
        limit: data.plan === "FREE" ? 5 : -1,
      });
    }

    const queryLimit = data.plan === "FREE" ? 5 : Infinity;
    if (data.queriesUsedToday >= queryLimit) {
      return apiResponse({
        allowed: false,
        used: data.queriesUsedToday,
        limit: 5,
      });
    }

    await subRef.update({ queriesUsedToday: FieldValue.increment(1) });
    return apiResponse({
      allowed: true,
      used: data.queriesUsedToday + 1,
      limit: data.plan === "FREE" ? 5 : -1,
    });
  } catch {
    return apiError("Failed to update usage", 500);
  }
}
