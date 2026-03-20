import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Bookmark, Clock, User, BrainCircuit, Play, Paperclip, Download } from "lucide-react";
import { getNoteById } from "@/lib/actions/note";
import { notFound } from "next/navigation";

export default async function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  const readTime = Math.max(1, Math.ceil(note.content.length / 1000));
  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/protected/student/notes" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Notes
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12">
        <header className="border-b pb-6 mb-8">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{note.subject}</Badge>
            <Badge variant="secondary">{note.topic}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{note.title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{note.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formattedDate} &bull; {readTime} min read</span>
            </div>
          </div>
        </header>

        <article className="prose prose-purple max-w-none text-gray-800 whitespace-pre-wrap">
          {note.content}
        </article>

        {note.attachments.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <Paperclip className="h-4 w-4 text-purple-600" />
              Attachments
            </h3>
            <div className="space-y-2">
              {note.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-purple-400 hover:bg-purple-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-purple-100 rounded-md shrink-0">
                      <Paperclip className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{(a.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors shrink-0 ml-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Test Your Knowledge</h3>
                <p className="text-sm text-muted-foreground">Take a quiz on {note.topic} to reinforce what you&apos;ve learned</p>
              </div>
            </div>
            <Link href={`/protected/student/quizzes/subject/${note.subject.toLowerCase()}`}>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Play className="h-4 w-4" /> Take Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
