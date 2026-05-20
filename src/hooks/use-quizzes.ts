"use client";

import { useApi, useApiMutation } from "./use-api";

interface QuizzesResponse {
  quizzes: Array<{
    id: string;
    title: string;
    titleHi: string;
    category: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    questionCount: number;
    timeMinutes: number;
    completedCount: number;
    icon: string;
    order: number;
  }>;
}

interface QuizDetailResponse {
  quiz: {
    id: string;
    title: string;
    titleHi: string;
    category: string;
    difficulty: string;
    questionCount: number;
    timeMinutes: number;
  };
  questions: Array<{
    id: string;
    question: string;
    questionHi: string;
    options: string[];
    optionsHi: string[];
    correctIndex: number;
    explanation: string;
    explanationHi: string;
    lawReference?: string;
    order: number;
  }>;
}

interface QuizSubmitResponse {
  score: number;
  totalQuestions: number;
  results: Array<{
    correct: boolean;
    correctIndex: number;
    userAnswer: number;
    explanation: string;
    explanationHi: string;
  }>;
}

export function useQuizzes() {
  const { data, loading, error, refetch } = useApi<QuizzesResponse>("/api/quizzes");
  return { quizzes: data?.quizzes || [], loading, error, refetch };
}

export function useQuiz(id: string | null) {
  const { data, loading, error } = useApi<QuizDetailResponse>(
    id ? `/api/quizzes/${id}` : null,
    { auth: true }
  );
  const { mutate, loading: submitting } = useApiMutation<{ answers: number[] }, QuizSubmitResponse>();

  const submitQuiz = async (answers: number[]) => {
    if (!id) return null;
    return mutate(`/api/quizzes/${id}/submit`, "POST", { answers });
  };

  return {
    quiz: data?.quiz || null,
    questions: data?.questions || [],
    loading,
    error,
    submitQuiz,
    submitting,
  };
}
