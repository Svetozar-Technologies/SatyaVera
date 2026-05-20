import { adminDb } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const doc = await adminDb.collection("laws").doc(slug).get();

    if (!doc.exists) {
      return apiError("Law not found", 404);
    }

    return apiResponse({ id: doc.id, ...doc.data() });
  } catch {
    return apiError("Failed to fetch law", 500);
  }
}
