import { adminDb } from "@/lib/firebase/admin";
import { apiResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("quizzes")
      .orderBy("order", "asc")
      .get();

    const quizzes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse({ quizzes });
  } catch {
    return apiResponse({ quizzes: [] });
  }
}
