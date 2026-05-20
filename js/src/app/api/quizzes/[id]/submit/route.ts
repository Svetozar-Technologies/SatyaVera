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

    // Validate answers length matches questions length
    if (body.answers.length !== questions.length) {
      return apiError(
        `Expected ${questions.length} answers but received ${body.answers.length}`,
        400
      );
    }

    // Validate each answer is a non-negative integer within bounds
    for (let i = 0; i < body.answers.length; i++) {
      const answer = body.answers[i];
      if (
        typeof answer !== "number" ||
        !Number.isInteger(answer) ||
        answer < 0
      ) {
        return apiError(
          `Answer at index ${i} must be a non-negative integer`,
          400
        );
      }
      const optionsLength = questions[i].options?.length ?? 0;
      if (answer >= optionsLength) {
        return apiError(
          `Answer at index ${i} is out of bounds (max ${optionsLength - 1})`,
          400
        );
      }
    }

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
