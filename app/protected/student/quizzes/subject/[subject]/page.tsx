import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Clock, BarChart, CheckCircle2 } from "lucide-react";

export default function SubjectQuizzesPage({ params }: { params: { subject: string } }) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  
  // Mock data
  const quizzes = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    title: `${subjectName} Assessment ${i + 1}`,
    questions: 10 + (i * 2),
    duration: "15 mins",
    difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard",
    completed: i < 2,
    score: i < 2 ? 85 + i * 5 : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/protected/student/quizzes" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{subjectName} Quizzes</h2>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden border-l-4 border-l-transparent hover:border-l-purple-500 transition-all hover:shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                    {quiz.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                        </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {quiz.duration}
                    </div>
                    <div className="flex items-center gap-1">
                        <BarChart className="w-4 h-4" /> {quiz.questions} Questions
                    </div>
                    <div>
                        Difficulty: <span className={
                            quiz.difficulty === 'Hard' ? 'text-red-500 font-medium' : 
                            quiz.difficulty === 'Medium' ? 'text-yellow-600 font-medium' : 
                            'text-green-600 font-medium'
                        }>{quiz.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 h-full flex items-center justify-center min-w-[200px] border-l">
                    {quiz.completed ? (
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-gray-900">{quiz.score}%</span>
                            <span className="text-xs text-muted-foreground">Your Score</span>
                            <div className="mt-2">
                                <Link href={`/protected/student/quizzes/${quiz.id}`}>
                                    <Button variant="outline" size="sm">Review</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link href={`/protected/student/quizzes/${quiz.id}`}>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                <Play className="w-4 h-4 mr-2" /> Start Quiz
                            </Button>
                        </Link>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
