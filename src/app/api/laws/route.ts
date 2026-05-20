import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    let ref: FirebaseFirestore.Query = adminDb.collection("laws");

    if (category && category !== "all") {
      ref = ref.where("primaryCategory", "==", category);
    }

    ref = ref.orderBy("title", "asc").limit(100);

    const snapshot = await ref.get();
    let laws = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (q) {
      const lower = q.toLowerCase();
      laws = laws.filter((l: Record<string, unknown>) =>
        (l.title as string)?.toLowerCase().includes(lower) ||
        (l.hindiTitle as string)?.includes(q)
      );
    }

    return apiResponse({ laws });
  } catch {
    return apiResponse({ laws: [] });
  }
}
