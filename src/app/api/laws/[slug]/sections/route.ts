import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const snapshot = await adminDb
      .collection("laws")
      .doc(slug)
      .collection("sections")
      .orderBy("orderNo", "asc")
      .get();

    const sections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ sections });
  } catch {
    return apiResponse({ sections: [] });
  }
}
