"use client";

import { useI18n } from "@/lib/i18n/context";
import { useQuizzes, useQuiz } from "@/hooks/use-quizzes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

export default function QuizPage() {
  const { t, lang } = useI18n();
  const [view, setView] = useState<"grid" | "quiz" | "result">("grid");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    totalQuestions: number;
    results: Array<{
      correct: boolean;
      correctIndex: number;
      userAnswer: number;
      explanation: string;
      explanationHi: string;
    }>;
  } | null>(null);

  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { quiz, questions, loading: quizLoading, submitQuiz, submitting } = useQuiz(selectedQuizId);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizResult(null);
    setView("quiz");
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    const newAnswers = [...answers, selectedOption ?? -1];
    setAnswers(newAnswers);
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      const result = await submitQuiz(newAnswers);
      if (result) {
        setQuizResult(result);
      }
      setView("result");
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizResult(null);
    setView("quiz");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
            {t("dashboard.knowRights")}
          </h1>
          <p className="text-sm text-ink-500">
            {t("dashboard.knowRightsDesc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-3 py-2 flex items-center gap-2">
            <Icon name="fire" size={14} className="text-saffron-600" />
            <span className="text-xs font-semibold text-ink-700">3 day streak</span>
          </Card>
          <Card className="px-3 py-2 flex items-center gap-2">
            <Icon name="star" size={14} className="text-saffron-500" />
            <span className="text-xs font-semibold text-ink-700">240 points</span>
          </Card>
        </div>
      </div>

      {view === "grid" && (
        <>
          {/* Loading state */}
          {quizzesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5 animate-pulse">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-100" />
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-ink-100 rounded mb-1" />
                      <div className="w-20 h-4 bg-ink-50 rounded" />
                    </div>
                  </div>
                  <div className="w-24 h-3 bg-ink-50 rounded mb-3" />
                  <div className="w-16 h-5 bg-ink-100 rounded" />
                </Card>
              ))}
            </div>
          )}

          {/* Quiz Grid */}
          {!quizzesLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <Icon name={quiz.icon as "shield" | "home" | "scale" | "eye" | "heart" | "users"} size={18} className="text-navy-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[13px] text-ink-900 mb-0.5">
                        {lang === "hi" ? quiz.titleHi : quiz.title}
                      </h3>
                      <Chip
                        variant={
                          quiz.category === "Criminal Law"
                            ? "red"
                            : quiz.category === "Consumer Law"
                            ? "green"
                            : quiz.category === "Family Law"
                            ? "saffron"
                            : "navy"
                        }
                        className="text-[9px]"
                      >
                        {quiz.category}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-ink-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Icon name="list" size={10} />
                      {quiz.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="bolt" size={10} />
                      {quiz.timeMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Chip
                      variant={
                        quiz.difficulty === "Beginner"
                          ? "green"
                          : quiz.difficulty === "Intermediate"
                          ? "saffron"
                          : "red"
                      }
                      className="text-[9px]"
                    >
                      {quiz.difficulty}
                    </Chip>
                    <span className="text-[10px] text-ink-400">
                      {quiz.completedCount >= 1000
                        ? `${(quiz.completedCount / 1000).toFixed(1)}K`
                        : quiz.completedCount}{" "}
                      completed
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {view === "quiz" && (
        <div className="max-w-2xl mx-auto">
          {/* Loading quiz questions */}
          {quizLoading && (
            <Card className="p-6 animate-pulse">
              <div className="w-48 h-4 bg-ink-100 rounded mb-4" />
              <div className="h-1.5 bg-ink-100 rounded-full mb-6" />
              <div className="w-full h-6 bg-ink-100 rounded mb-6" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-ink-50 rounded-lg" />
                ))}
              </div>
            </Card>
          )}

          {!quizLoading && quiz && currentQuestion && (
            <>
              {/* Quiz Progress */}
              <Card className="p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setView("grid");
                        setSelectedQuizId(null);
                        setSelectedOption(null);
                        setShowExplanation(false);
                      }}
                    >
                      <Icon name="arrowR" size={14} className="rotate-180" />
                      Back
                    </Button>
                    <h2 className="font-semibold text-sm text-ink-900">
                      {lang === "hi" ? quiz.titleHi : quiz.title}
                    </h2>
                  </div>
                  <span className="text-xs text-ink-400 font-semibold">
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-600 rounded-full transition-all"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </Card>

              {/* Question */}
              <Card className="p-6 mb-5">
                <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-2">
                  Question {currentQuestionIndex + 1}
                </p>
                <h3 className="font-serif font-bold text-lg text-navy-900 mb-6">
                  {lang === "hi" ? currentQuestion.questionHi : currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {(lang === "hi" ? currentQuestion.optionsHi : currentQuestion.options).map((optionText, idx) => {
                    const isSelected = selectedOption === idx;
                    const showResult = showExplanation;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                    let borderClass = "border-ink-200 hover:border-navy-300 hover:bg-navy-50";
                    if (showResult && isCorrect) {
                      borderClass = "border-green-500 bg-green-50";
                    } else if (showResult && isSelected && !isCorrect) {
                      borderClass = "border-red-500 bg-red-50";
                    } else if (isSelected) {
                      borderClass = "border-navy-500 bg-navy-50";
                    }

                    return (
                      <button
                        key={idx}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer flex items-center gap-3 ${borderClass}`}
                        onClick={() => handleAnswer(idx)}
                        disabled={showExplanation}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            showResult && isCorrect
                              ? "bg-green-600 text-white"
                              : showResult && isSelected && !isCorrect
                              ? "bg-red-500 text-white"
                              : "bg-ink-100 text-ink-600"
                          }`}
                        >
                          {showResult && isCorrect ? (
                            <Icon name="check" size={14} />
                          ) : (
                            optionLabel
                          )}
                        </span>
                        <span
                          className={`text-[13px] font-medium ${
                            showResult && isCorrect
                              ? "text-green-800"
                              : showResult && isSelected && !isCorrect
                              ? "text-red-700"
                              : "text-ink-800"
                          }`}
                        >
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Explanation */}
              {showExplanation && (
                <Card className="p-5 mb-5 border-l-[3px] border-l-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="info" size={14} className="text-green-600" />
                    <h4 className="font-semibold text-sm text-green-800">Explanation</h4>
                  </div>
                  <p className="text-[13px] text-ink-700 leading-relaxed mb-2">
                    {lang === "hi" ? currentQuestion.explanationHi : currentQuestion.explanation}
                  </p>
                  {currentQuestion.lawReference && (
                    <p className="text-[11px] text-ink-500 flex items-center gap-1">
                      <Icon name="doc" size={11} />
                      {currentQuestion.lawReference}
                    </p>
                  )}
                  <div className="flex gap-3 mt-4 pt-3 border-t border-ink-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleNextQuestion}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Submitting..."
                        : currentQuestionIndex < questions.length - 1
                        ? "Next Question"
                        : "Finish Quiz"}
                      {!submitting && <Icon name="arrowR" size={14} />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="sparkles" size={14} />
                      Ask GandhiAI
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {view === "result" && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={36} className="text-green-600" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-navy-900 mb-1">
              {quizResult && quizResult.score >= quizResult.totalQuestions * 0.7 ? "Great Job!" : "Keep Learning!"}
            </h2>
            <p className="text-sm text-ink-500 mb-6">
              You completed the &quot;{quiz ? (lang === "hi" ? quiz.titleHi : quiz.title) : ""}&quot; quiz
            </p>

            {quizResult && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-700">
                      {quizResult.score}/{quizResult.totalQuestions}
                    </p>
                    <p className="text-[10px] text-green-600 font-medium">Score</p>
                  </div>
                  <div className="bg-saffron-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-saffron-700">+{quizResult.score * 10}</p>
                    <p className="text-[10px] text-saffron-600 font-medium">Points Earned</p>
                  </div>
                  <div className="bg-navy-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-navy-700">
                      {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%
                    </p>
                    <p className="text-[10px] text-navy-600 font-medium">Accuracy</p>
                  </div>
                </div>

                {quizResult.score >= quizResult.totalQuestions * 0.8 && (
                  <div className="bg-saffron-50 border border-saffron-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Icon name="star" size={16} className="text-saffron-500" />
                      <span className="font-semibold text-sm text-saffron-700">
                        Badge Unlocked!
                      </span>
                    </div>
                    <p className="text-xs text-saffron-600">
                      Rights Defender &mdash; Score 80%+ on a quiz
                    </p>
                  </div>
                )}

                {/* Questions missed */}
                {quizResult.results.some((r) => !r.correct) && (
                  <div className="text-left mb-6">
                    <h4 className="text-xs font-semibold text-ink-500 uppercase mb-2">
                      Questions You Missed
                    </h4>
                    <div className="space-y-2">
                      {quizResult.results.map((r, idx) =>
                        !r.correct ? (
                          <Card key={idx} className="p-3">
                            <p className="text-[12px] text-ink-700 mb-1">
                              <strong>Q{idx + 1}:</strong>{" "}
                              {questions[idx]
                                ? lang === "hi"
                                  ? questions[idx].questionHi
                                  : questions[idx].question
                                : ""}
                            </p>
                            <p className="text-[11px] text-green-600">
                              Correct answer:{" "}
                              {questions[idx]
                                ? (lang === "hi"
                                    ? questions[idx].optionsHi
                                    : questions[idx].options)[r.correctIndex]
                                : ""}
                            </p>
                          </Card>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setView("grid");
                  setSelectedQuizId(null);
                  setQuizResult(null);
                }}
              >
                <Icon name="list" size={14} />
                All Quizzes
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                <Icon name="arrowR" size={14} className="rotate-180" />
                Retry Quiz
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
