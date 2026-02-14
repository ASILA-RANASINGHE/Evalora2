import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

export default function QuizzesPage() {
  const subjects = [
    { name: "History", emoji: "\u{1F3DB}\u{FE0F}", color: "bg-orange-100 border-orange-200" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Practice Quizzes</h2>
          <p className="text-muted-foreground mt-1">Test your knowledge across different subjects</p>
        </div>
        <Link href="/protected/student/quizzes/random">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md">
            <Shuffle className="mr-2 h-4 w-4" /> I&apos;m Feeling Lucky
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => (
          <Link href={`/protected/student/quizzes/subject/${subject.name.toLowerCase()}`} key={subject.name}>
            <Card className={`h-full border-2 hover:shadow-lg transition-all cursor-pointer group ${subject.color} bg-opacity-40`}>
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <span className="text-6xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                  {subject.emoji}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
