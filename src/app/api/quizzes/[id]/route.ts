import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;
    const quizDoc = await adminDb.collection("quizzes").doc(id).get();

    if (!quizDoc.exists) return apiError("Quiz not found", 404);

    const questionsSnap = await adminDb
      .collection("quizzes")
      .doc(id)
      .collection("questions")
      .orderBy("order", "asc")
      .get();

    const questions = questionsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        questionHi: data.questionHi,
        options: data.options,
        optionsHi: data.optionsHi,
        lawReference: data.lawReference,
        order: data.order,
        // DO NOT include correctIndex, explanation, explanationHi
      };
    });

    return apiResponse({
      quiz: { id: quizDoc.id, ...quizDoc.data() },
      questions,
    });
  } catch {
    return apiError("Failed to fetch quiz", 500);
  }
}
