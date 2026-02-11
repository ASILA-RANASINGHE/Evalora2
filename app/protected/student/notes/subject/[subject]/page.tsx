import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText, Clock, User } from "lucide-react";

export default function SubjectNotesPage({ params }: { params: { subject: string } }) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  
  // Mock data
  const notes = Array.from({ length: 8 }).map((_, i) => ({
    id: `note-${i + 1}`,
    title: `${subjectName} Topic ${i + 1}: Introduction to Concepts`,
    author: "Dr. Smith",
    date: "2 days ago",
    readTime: "5 min read",
    tags: ["Basics", "Theory"]
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/protected/student/notes" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{subjectName} Notes</h2>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <Link href={`/protected/student/notes/${note.id}`} key={note.id}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer group border-l-4 border-l-transparent hover:border-l-purple-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border rounded-lg group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                    <FileText className="h-6 w-6 text-gray-500 group-hover:text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-purple-700 transition-colors">{note.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {note.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {note.date}</span>
                      <span>• {note.readTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
