"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Home, Loader2 } from "lucide-react";
import { getQuizById, submitQuizAttempt } from "@/lib/actions/quiz";
import { use } from "react";

interface QuizData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: number;
  questions: {
    id: string;
    text: string;
    type: "mc" | "short";
    points: number;
    options: string[];
  }[];
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ questionId: string; correct: boolean; correctAnswer: string }[]>([]);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await getQuizById(id);
        setQuiz(data);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Quiz not found.</p>
        <Link href="/protected/student/quizzes" className="mt-4 inline-block">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  const handleAnswer = (val: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [question.id]: val }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitQuizAttempt(quiz.id, answers);
      setScore(result.score);
      setResults(result.results);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scorePercentage = score;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">
            {scorePercentage === 100 ? "\u{1F389}" : scorePercentage >= 80 ? "\u{1F44F}" : scorePercentage >= 60 ? "\u{1F44D}" : "\u{1F4DA}"}
          </div>
          <h1 className="text-4xl font-bold">
            {scorePercentage === 100 ? "Perfect Score!" : scorePercentage >= 80 ? "Great Job!" : scorePercentage >= 60 ? "Good Effort!" : "Keep Practicing!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            You scored {scorePercentage}%
          </p>
        </div>

        <Card className="text-left">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Review</h3>
            {quiz.questions.map((q, idx) => {
              const r = results.find(r => r.questionId === q.id);
              const uAns = answers[q.id];
              return (
                <div key={q.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="mt-1">
                    {r?.correct ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-700">Q{idx + 1}: {q.text}</p>
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">Your answer: </span>
                      <span className={r?.correct ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{uAns || "(Skipped)"}</span>
                    </p>
                    {!r?.correct && (
                      <p className="text-sm text-green-600 mt-1">
                        <span className="font-medium">Correct answer:</span> {r?.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Link href="/protected/student/quizzes">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Home className="mr-2 h-4 w-4" /> Back to Quizzes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
        </div>
        <div className="text-right">
          <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">{quiz.duration} min</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="min-h-[300px] flex flex-col justify-between">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-xl font-medium leading-relaxed">{question.text}</h2>

          <div className="pt-4">
            {question.type === "mc" ? (
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {question.options.map((opt) => (
                  <div key={opt} className={`flex items-center space-x-2 border p-4 rounded-lg hover:bg-purple-50 transition-colors ${answers[question.id] === opt ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}>
                    <RadioGroupItem value={opt} id={opt} />
                    <Label htmlFor={opt} className="flex-1 cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                className="min-h-[100px] text-lg"
              />
            )}
          </div>
        </CardContent>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {currentQuestionIdx === quiz.questions.length - 1 ? (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"} <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-purple-600 hover:bg-purple-700 px-8"
              onClick={handleNext}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
