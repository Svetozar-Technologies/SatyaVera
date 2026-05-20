import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const doc = await adminDb.collection("subscriptions").doc(decoded.uid).get();

    if (!doc.exists) {
      // Return default free subscription
      return apiResponse({
        subscription: {
          plan: "FREE",
          status: "active",
          queriesUsedToday: 0,
          documentsUsedThisMonth: 0,
          lastResetDate: new Date().toISOString().split("T")[0],
          lastDocResetDate: new Date().toISOString().split("T")[0],
        },
      });
    }

    const data = doc.data()!;
    const today = new Date().toISOString().split("T")[0];

    // Reset daily count if new day
    if (data.lastResetDate !== today) {
      data.queriesUsedToday = 0;
      data.lastResetDate = today;
    }

    return apiResponse({ subscription: { id: doc.id, ...data } });
  } catch {
    return apiError("Failed to fetch subscription", 500);
  }
}
