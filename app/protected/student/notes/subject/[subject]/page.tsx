import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText, Clock, User } from "lucide-react";
import { getNotesBySubject } from "@/lib/actions/note";

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default async function SubjectNotesPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
  const notes = await getNotesBySubject(subjectName);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/protected/student/notes" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{subjectName} Notes</h2>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No notes available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later or ask your teacher to upload some!</p>
        </div>
      ) : (
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
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(note.createdAt)}</span>
                        <span>{Math.ceil(note.contentLength / 1000)} min read</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100">{note.topic}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
