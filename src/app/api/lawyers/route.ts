import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");
    const city = searchParams.get("city");
    const sort = searchParams.get("sort") || "rating";
    const search = searchParams.get("search");

    let ref: FirebaseFirestore.Query = adminDb.collection("lawyerProfiles");

    if (area && area !== "all") {
      ref = ref.where("practiceAreas", "array-contains", area);
    }
    if (city) {
      ref = ref.where("city", "==", city);
    }

    // Sort
    if (sort === "experience") {
      ref = ref.orderBy("experience", "desc");
    } else if (sort === "fee_low") {
      ref = ref.orderBy("feeAmount", "asc");
    } else {
      ref = ref.orderBy("rating", "desc");
    }

    ref = ref.limit(50);

    const snapshot = await ref.get();
    let lawyers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const lower = search.toLowerCase();
      lawyers = lawyers.filter((l: Record<string, unknown>) =>
        (l.name as string)?.toLowerCase().includes(lower)
      );
    }

    return apiResponse({ lawyers });
  } catch {
    return apiResponse({ lawyers: [] });
  }
}
