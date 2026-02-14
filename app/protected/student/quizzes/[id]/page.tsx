"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
// import confetti from "canvas-confetti";

// Mock Data
const QUIZ_DATA = {
  id: "1",
  title: "General Knowledge Assessment",
  timeLimit: 15, // minutes
  questions: [
    {
      id: 1,
      type: "mc",
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
      answer: "Mitochondria"
    },
    {
      id: 2,
      type: "mc",
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answer: "Mars"
    },
    {
      id: 3,
      type: "short",
      question: "What is the chemical symbol for Gold?",
      answer: "Au" // Case insensitive check
    },
    {
      id: 4,
      type: "mc",
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      answer: "William Shakespeare"
    },
    {
      id: 5,
      type: "short",
      question: "What is 12 * 12?",
      answer: "144"
    }
  ]
};

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = QUIZ_DATA.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / QUIZ_DATA.questions.length) * 100;

  const handleAnswer = (val: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [question.id]: val
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < QUIZ_DATA.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    QUIZ_DATA.questions.forEach(q => {
      const uAns = answers[q.id]?.trim().toLowerCase();
      const cAns = q.answer.toLowerCase();
      if (uAns === cAns) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true);

    const percentage = (calculatedScore / QUIZ_DATA.questions.length) * 100;
    if (percentage === 100) {
      // Confetti effect removed
    }
  };

  const scorePercentage = Math.round((score / QUIZ_DATA.questions.length) * 100);

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">
            {scorePercentage === 100 ? "🎉" : scorePercentage >= 80 ? "👏" : scorePercentage >= 60 ? "👍" : "📚"}
          </div>
          <h1 className="text-4xl font-bold">
            {scorePercentage === 100 ? "Perfect Score!" : scorePercentage >= 80 ? "Great Job!" : scorePercentage >= 60 ? "Good Effort!" : "Keep Practicing!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            You scored {scorePercentage}% ({score}/{QUIZ_DATA.questions.length})
          </p>
        </div>

        <Card className="text-left">
            <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Review</h3>
                {QUIZ_DATA.questions.map((q, idx) => {
                    const uAns = answers[q.id];
                    const isCorrect = uAns?.trim().toLowerCase() === q.answer.toLowerCase();
                    return (
                        <div key={q.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                            <div className="mt-1">
                                {isCorrect ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm text-gray-700">Q{idx + 1}: {q.question}</p>
                                <p className="text-sm mt-1">
                                    <span className="text-muted-foreground">Your answer: </span> 
                                    <span className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{uAns || "(Skipped)"}</span>
                                </p>
                                {!isCorrect && (
                                    <p className="text-sm text-green-600 mt-1">
                                        <span className="font-medium">Correct answer:</span> {q.answer}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" /> Retry
          </Button>
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
           <h1 className="text-2xl font-bold">{QUIZ_DATA.title}</h1>
           <p className="text-muted-foreground">Question {currentQuestionIdx + 1} of {QUIZ_DATA.questions.length}</p>
        </div>
        <div className="text-right">
            <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">14:20 remaining</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="min-h-[300px] flex flex-col justify-between">
        <CardContent className="p-8 space-y-6">
            <h2 className="text-xl font-medium leading-relaxed">{question.question}</h2>
            
            <div className="pt-4">
                {question.type === 'mc' ? (
                    <RadioGroup 
                        value={answers[question.id] || ""} 
                        onValueChange={handleAnswer}
                        className="space-y-3"
                    >
                        {question.options?.map((opt) => (
                            <div key={opt} className={`flex items-center space-x-2 border p-4 rounded-lg hover:bg-purple-50 transition-colors ${answers[question.id] === opt ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
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

            {currentQuestionIdx === QUIZ_DATA.questions.length - 1 ? (
                <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                    onClick={handleSubmit}
                >
                    Submit Quiz <CheckCircle className="ml-2 h-4 w-4" />
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
