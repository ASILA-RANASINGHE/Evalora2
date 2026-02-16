import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Clock, User } from "lucide-react";
import { getShortNoteById } from "@/lib/actions/short-note";
import { notFound } from "next/navigation";

export default async function ShortNoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getShortNoteById(id);

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center">
        <Link href="/protected/student/short-notes" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Short Notes
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 md:p-8">
          <header className="border-b pb-4 mb-6">
            <div className="flex gap-2 mb-3">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{note.subject}</Badge>
              <Badge variant="secondary">{note.topic}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{note.title}</h1>
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
        </CardContent>
      </Card>
    </div>
  );
}
