import { adminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { apiResponse, apiError } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    if (!body.answers || !Array.isArray(body.answers)) {
      return apiError("answers array is required", 400);
    }

    // Fetch questions to calculate score
    const questionsSnap = await adminDb
      .collection("quizzes")
      .doc(id)
      .collection("questions")
      .orderBy("order", "asc")
      .get();

    const questions = questionsSnap.docs.map((doc) => doc.data());
    let score = 0;
    const results = questions.map((q, i) => {
      const correct = body.answers[i] === q.correctIndex;
      if (correct) score++;
      return {
        correct,
        correctIndex: q.correctIndex,
        userAnswer: body.answers[i],
        explanation: q.explanation,
        explanationHi: q.explanationHi,
      };
    });

    // Save attempt
    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .collection("quizAttempts")
      .add({
        quizId: id,
        score,
        totalQuestions: questions.length,
        completedAt: FieldValue.serverTimestamp(),
      });

    // Increment quiz completed count
    await adminDb.collection("quizzes").doc(id).update({
      completedCount: FieldValue.increment(1),
    });

    return apiResponse({ score, totalQuestions: questions.length, results });
  } catch {
    return apiError("Failed to submit quiz", 500);
  }
}
