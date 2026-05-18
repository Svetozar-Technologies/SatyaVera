"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { useState } from "react";

const quizzes = [
  {
    id: 1,
    title: "Know Your Arrest Rights",
    category: "Criminal Law",
    questions: 10,
    time: "5 min",
    difficulty: "Beginner",
    completedBy: "2.1K",
    icon: "shield" as const,
  },
  {
    id: 2,
    title: "Tenant & Landlord Rights",
    category: "Property Law",
    questions: 8,
    time: "4 min",
    difficulty: "Beginner",
    completedBy: "1.8K",
    icon: "home" as const,
  },
  {
    id: 3,
    title: "Consumer Protection Basics",
    category: "Consumer Law",
    questions: 12,
    time: "6 min",
    difficulty: "Intermediate",
    completedBy: "3.2K",
    icon: "scale" as const,
  },
  {
    id: 4,
    title: "RTI Act Essentials",
    category: "Constitutional Law",
    questions: 10,
    time: "5 min",
    difficulty: "Beginner",
    completedBy: "4.5K",
    icon: "eye" as const,
  },
  {
    id: 5,
    title: "Women's Legal Rights",
    category: "Family Law",
    questions: 15,
    time: "8 min",
    difficulty: "Intermediate",
    completedBy: "2.9K",
    icon: "heart" as const,
  },
  {
    id: 6,
    title: "Employment & Labour Law",
    category: "Labour Law",
    questions: 10,
    time: "5 min",
    difficulty: "Advanced",
    completedBy: "1.2K",
    icon: "users" as const,
  },
];

const activeQuizQuestion = {
  quizTitle: "Know Your Arrest Rights",
  questionNumber: 3,
  totalQuestions: 10,
  question:
    "Within how many hours must an arrested person be produced before a Magistrate?",
  options: [
    { id: "a", text: "12 hours", correct: false },
    { id: "b", text: "24 hours", correct: true },
    { id: "c", text: "48 hours", correct: false },
    { id: "d", text: "72 hours", correct: false },
  ],
  explanation:
    "Under Article 22(2) of the Indian Constitution, every person who is arrested and detained shall be produced before the nearest Magistrate within a period of 24 hours, excluding the time necessary for the journey from the place of arrest to the court.",
  legalRef: "Article 22(2), Constitution of India",
};

export default function QuizPage() {
  const { t } = useI18n();
  const [view, setView] = useState<"grid" | "quiz" | "result">("grid");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (optionId: string) => {
    setSelectedOption(optionId);
    setShowExplanation(true);
  };

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="quiz" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
                Rights Quiz
              </h1>
              <p className="text-sm text-ink-500">
                Test your knowledge of Indian legal rights and earn badges
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
              {/* Quiz Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setView("quiz")}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Icon name={quiz.icon} size={18} className="text-navy-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[13px] text-ink-900 mb-0.5">
                          {quiz.title}
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
                        {quiz.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="bolt" size={10} />
                        {quiz.time}
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
                        {quiz.completedBy} completed
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {view === "quiz" && (
            <div className="max-w-2xl mx-auto">
              {/* Quiz Progress */}
              <Card className="p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setView("grid");
                        setSelectedOption(null);
                        setShowExplanation(false);
                      }}
                    >
                      <Icon name="arrowR" size={14} className="rotate-180" />
                      Back
                    </Button>
                    <h2 className="font-semibold text-sm text-ink-900">
                      {activeQuizQuestion.quizTitle}
                    </h2>
                  </div>
                  <span className="text-xs text-ink-400 font-semibold">
                    {activeQuizQuestion.questionNumber} /{" "}
                    {activeQuizQuestion.totalQuestions}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-600 rounded-full transition-all"
                    style={{
                      width: `${
                        (activeQuizQuestion.questionNumber /
                          activeQuizQuestion.totalQuestions) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </Card>

              {/* Question */}
              <Card className="p-6 mb-5">
                <p className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-2">
                  Question {activeQuizQuestion.questionNumber}
                </p>
                <h3 className="font-serif font-bold text-lg text-navy-900 mb-6">
                  {activeQuizQuestion.question}
                </h3>

                <div className="space-y-3">
                  {activeQuizQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const showResult = showExplanation;
                    let borderClass = "border-ink-200 hover:border-navy-300 hover:bg-navy-50";
                    if (showResult && option.correct) {
                      borderClass = "border-green-500 bg-green-50";
                    } else if (showResult && isSelected && !option.correct) {
                      borderClass = "border-red-500 bg-red-50";
                    } else if (isSelected) {
                      borderClass = "border-navy-500 bg-navy-50";
                    }

                    return (
                      <button
                        key={option.id}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer flex items-center gap-3 ${borderClass}`}
                        onClick={() => handleAnswer(option.id)}
                        disabled={showExplanation}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            showResult && option.correct
                              ? "bg-green-600 text-white"
                              : showResult && isSelected && !option.correct
                              ? "bg-red-500 text-white"
                              : "bg-ink-100 text-ink-600"
                          }`}
                        >
                          {showResult && option.correct ? (
                            <Icon name="check" size={14} />
                          ) : (
                            option.id.toUpperCase()
                          )}
                        </span>
                        <span
                          className={`text-[13px] font-medium ${
                            showResult && option.correct
                              ? "text-green-800"
                              : showResult && isSelected && !option.correct
                              ? "text-red-700"
                              : "text-ink-800"
                          }`}
                        >
                          {option.text}
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
                    {activeQuizQuestion.explanation}
                  </p>
                  <p className="text-[11px] text-ink-500 flex items-center gap-1">
                    <Icon name="doc" size={11} />
                    {activeQuizQuestion.legalRef}
                  </p>
                  <div className="flex gap-3 mt-4 pt-3 border-t border-ink-100">
                    <Button variant="primary" size="sm" onClick={() => setView("result")}>
                      Next Question <Icon name="arrowR" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="sparkles" size={14} />
                      Ask GandhiAI
                    </Button>
                  </div>
                </Card>
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
                  Great Job!
                </h2>
                <p className="text-sm text-ink-500 mb-6">
                  You completed the &quot;Know Your Arrest Rights&quot; quiz
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-700">8/10</p>
                    <p className="text-[10px] text-green-600 font-medium">Score</p>
                  </div>
                  <div className="bg-saffron-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-saffron-700">+80</p>
                    <p className="text-[10px] text-saffron-600 font-medium">Points Earned</p>
                  </div>
                  <div className="bg-navy-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-navy-700">4:32</p>
                    <p className="text-[10px] text-navy-600 font-medium">Time Taken</p>
                  </div>
                </div>

                <div className="bg-saffron-50 border border-saffron-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon name="star" size={16} className="text-saffron-500" />
                    <span className="font-semibold text-sm text-saffron-700">
                      Badge Unlocked!
                    </span>
                  </div>
                  <p className="text-xs text-saffron-600">
                    Rights Defender &mdash; Score 80%+ on a criminal law quiz
                  </p>
                </div>

                <div className="text-left mb-6">
                  <h4 className="text-xs font-semibold text-ink-500 uppercase mb-2">
                    Questions You Missed
                  </h4>
                  <div className="space-y-2">
                    <Card className="p-3">
                      <p className="text-[12px] text-ink-700 mb-1">
                        <strong>Q5:</strong> Can police search a woman at night?
                      </p>
                      <p className="text-[11px] text-green-600">
                        Correct answer: No, a woman cannot be arrested after sunset and
                        before sunrise except in exceptional circumstances (Section 46 CrPC)
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-[12px] text-ink-700 mb-1">
                        <strong>Q8:</strong> What is the maximum period of police remand?
                      </p>
                      <p className="text-[11px] text-green-600">
                        Correct answer: 15 days (Section 167 CrPC)
                      </p>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="primary" size="sm" onClick={() => setView("grid")}>
                    <Icon name="list" size={14} />
                    All Quizzes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setView("quiz");
                      setSelectedOption(null);
                      setShowExplanation(false);
                    }}
                  >
                    <Icon name="arrowR" size={14} className="rotate-180" />
                    Retry Quiz
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
