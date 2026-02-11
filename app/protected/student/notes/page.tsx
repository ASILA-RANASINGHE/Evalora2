import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Code, Calculator, Globe, Beaker, PenTool } from "lucide-react";

export default function NotesPage() {
  const subjects = [
    { name: "Mathematics", icon: Calculator, count: 12, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Physics", icon: ZapIcon, count: 8, color: "text-yellow-500", bg: "bg-yellow-100" },
    { name: "Chemistry", icon: Beaker, count: 15, color: "text-green-500", bg: "bg-green-100" },
    { name: "English", icon: Book, count: 20, color: "text-red-500", bg: "bg-red-100" },
    { name: "Computer Science", icon: Code, count: 5, color: "text-purple-500", bg: "bg-purple-100" },
    { name: "Geography", icon: Globe, count: 9, color: "text-teal-500", bg: "bg-teal-100" },
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
                  <p className="text-sm text-muted-foreground mt-1">{subject.count} Topics Available</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ZapIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4z" />
      </svg>
    )
  }
