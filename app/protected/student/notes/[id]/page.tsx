import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Bookmark, Printer, Clock, User, Tag } from "lucide-react";

export default function NoteViewerPage({ params }: { params: { id: string } }) {
  // Mock data based on ID
  const note = {
    title: "Introduction to Calculus: Limits and Continuity",
    subject: "Mathematics",
    author: "Prof. Johnson",
    date: "Oct 12, 2023",
    readTime: "12 min read",
    content: `
      <h2>1. Understanding Limits</h2>
      <p class="mb-4">In calculus, a limit helps us understand how a function behaves as its input approaches a specific value. It is the foundational concept for derivatives and integrals.</p>
      
      <div class="bg-gray-100 p-4 rounded-lg my-4 border-l-4 border-purple-500">
        <strong>Definition:</strong> The limit of f(x) as x approaches c is L if f(x) gets arbitrarily close to L as x gets sufficiently close to c.
      </div>

      <p class="mb-4">Notation: $$\\lim_{{x \\to c}} f(x) = L$$</p>

      <h2>2. Continuity</h2>
      <p class="mb-4">A function is continuous at a point if the limit exists, the function is defined at that point, and the limit equals the function value.</p>
      
      <ul class="list-disc pl-6 space-y-2 mb-4">
        <li>Condition 1: f(c) is defined</li>
        <li>Condition 2: The limit as x approaches c exists</li>
        <li>Condition 3: The limit equals f(c)</li>
      </ul>

      <h3>Key Examples</h3>
      <p class="mb-4">Polynomial functions are continuous everywhere. Rational functions are continuous wherever they are defined (i.e., denominator is not zero).</p>
    ` // In a real app, this would be sanitized HTML or Markdown content
  };

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
                <Badge variant="secondary">Note {params.id}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{note.title}</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{note.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{note.date} • {note.readTime}</span>
                </div>
            </div>
        </header>

        <article className="prose prose-purple max-w-none text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
        </article>
      </div>
    </div>
  );
}
