import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";

export default function NotesPage() {
  const subjects = [
    { name: "History", icon: Book, count: 0, color: "text-orange-500", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Study Notes</h2>
        <p className="text-muted-foreground">Select a subject to browse notes</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link href={`/protected/student/notes/subject/${subject.name.toLowerCase()}`} key={subject.name}>
            <Card className="hover:shadow-lg transition-all hover:border-purple-500/50 cursor-pointer h-full group bg-card border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${subject.bg} ${subject.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                  <subject.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Browse Topics</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
