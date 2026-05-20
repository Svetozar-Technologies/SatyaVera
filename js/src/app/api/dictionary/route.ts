import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const letter = searchParams.get("letter");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let ref: FirebaseFirestore.Query = adminDb.collection("dictionaryEntries");

    if (letter) {
      ref = ref.where("letter", "==", letter.toUpperCase());
    }
    if (category) {
      ref = ref.where("category", "==", category);
    }

    ref = ref.orderBy("termEn", "asc").limit(200);

    const snapshot = await ref.get();
    let entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const lower = search.toLowerCase();
      entries = entries.filter((e: Record<string, unknown>) =>
        (e.termEn as string)?.toLowerCase().includes(lower) ||
        (e.termHi as string)?.includes(search) ||
        (e.definitionEn as string)?.toLowerCase().includes(lower)
      );
    }

    return apiResponse({ entries });
  } catch {
    return apiResponse({ entries: [] });
  }
}
