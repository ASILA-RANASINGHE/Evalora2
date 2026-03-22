import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, CalendarDays, FileText, Pencil } from "lucide-react";
import { getNoteById } from "@/lib/actions/note";
import { getShortNoteById } from "@/lib/actions/short-note";
import { getPaperById } from "@/lib/actions/paper";
import { getQuizDetails } from "@/lib/actions/quiz";
import { notFound } from "next/navigation";
import { DeleteContentButton } from "../../delete-button";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ContentViewPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  let content: any = null;
  let backLink = "/protected/teacher/my-content";
  let typeLabel = "";

  // Fetch content based on type
  switch (type) {
    case "notes":
      content = await getNoteById(id);
      typeLabel = "Note";
      break;
    case "short-notes":
      content = await getShortNoteById(id);
      typeLabel = "Short Note";
      break;
    case "papers":
      content = await getPaperById(id);
      typeLabel = "Paper";
      break;
    case "quizzes":
      content = await getQuizDetails(id);
      typeLabel = "Quiz";
      break;
    default:
      notFound();
  }

  if (!content) {
    notFound();
  }

  const authorName = content.author || content.createdBy || "You";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={backLink}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to My Content
        </Link>
        <div className="flex gap-2">
          <Link href={`${backLink}/${type}/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          </Link>
          <DeleteContentButton type={type} id={id} title={content.title} backHref={backLink} />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-8 md:p-12">
        <header className="border-b pb-6 mb-8">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              {content.subject}
            </Badge>
            {(content.topic || content.grade) && (
              <Badge variant="secondary">
                {content.topic || content.grade}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {typeLabel}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {content.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {content.createdAt && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Created {formatDate(content.createdAt)}</span>
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{content.duration} mins</span>
              </div>
            )}
            {type === "papers" && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{content.totalMarks} Marks</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-purple max-w-none text-foreground dark:prose-invert">
          {type === "notes" || type === "short-notes" ? (
            <div className="whitespace-pre-wrap">{content.content}</div>
          ) : null}

          {type === "papers" && (
            <div className="space-y-6">
              {/* Paper details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Term</p>
                  <p>{content.term}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Year</p>
                  <p>{content.year || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Pass Mark</p>
                  <p>{content.passPercentage}%</p>
                </div>
                 <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Type</p>
                  <p>{content.isModel ? "Model Paper" : "Past Paper"}</p>
                </div>
              </div>
              
              {content.instructions && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                  <p className="whitespace-pre-wrap">{content.instructions}</p>
                </div>
              )}

              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                 <p className="text-muted-foreground">Paper questions are stored in PDF/Doc format (mock).</p>
                 <Button className="mt-4" variant="outline">Download Paper</Button>
              </div>
            </div>
          )}

          {type === "quizzes" && (
             <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span>{content.questions?.length || 0} Questions</span>
                  <span>{content.questions?.reduce((acc: number, q: any) => acc + q.points, 0) || 0} Total Points</span>
               </div>

               <div className="space-y-4">
                 {content.questions?.map((q: any, i: number) => (
                   <div key={q.id} className="p-4 border rounded-lg">
                     <div className="flex justify-between mb-2">
                       <span className="font-bold">Q{i + 1}</span>
                       <Badge variant="outline">{q.points} pts</Badge>
                     </div>
                     <p className="font-medium mb-3">{q.text}</p>
                     
                     {q.type === "mc" ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {q.options.map((opt: string, j: number) => (
                           <div key={j} className={`p-2 rounded border ${opt === q.correctAnswer ? "bg-green-50 border-green-200 dark:bg-green-900/20" : "bg-muted/30"}`}>
                             {opt}
                             {opt === q.correctAnswer && <span className="ml-2 text-green-600 text-xs font-bold">(Correct)</span>} 
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="p-3 bg-muted/30 rounded border">
                         <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                         <p>{q.correctAnswer}</p>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
