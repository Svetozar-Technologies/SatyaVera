import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let ref: FirebaseFirestore.Query = adminDb.collection("templates");

    if (category && category !== "all") {
      ref = ref.where("category", "==", category);
    }

    ref = ref.orderBy("order", "asc").limit(50);

    const snapshot = await ref.get();
    const templates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ templates });
  } catch {
    return apiResponse({ templates: [] });
  }
}
