import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText, Eye, Shield, GraduationCap, Star } from "lucide-react";
import { getPapersBySubjectAndTerm } from "@/lib/actions/paper";

type Paper = {
  id: string;
  title: string;
  year: number | null;
  duration: number;
  totalMarks: number;
  grade: string;
  isModel: boolean;
};

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Card className="hover:border-[#696FC7] transition-colors border-border/50 shadow-sm">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-[#B7BDF7]/40 text-[#4D2FB2] rounded-xl">
            {paper.isModel ? <Star className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">{paper.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {paper.year && <span>Year: {paper.year}</span>}
              <span>Duration: {paper.duration >= 60 ? `${Math.floor(paper.duration / 60)}h ${paper.duration % 60 > 0 ? `${paper.duration % 60}m` : ""}` : `${paper.duration} mins`}</span>
              <span>Total Marks: {paper.totalMarks}</span>
              <span>Grade: {paper.grade}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/protected/student/papers/${paper.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
              <Eye className="h-4 w-4 mr-2" /> View Paper
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TermPapersPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string; term: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { subject, term } = await params;
  const { type } = await searchParams;

  // Decode subject name (e.g. "civic-education" → "Civic Education")
  const subjectName = subject
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const { adminContent, teacherContent } = await getPapersBySubjectAndTerm(subjectName, term);

  // Filter by type if provided
  const filterFn = (p: Paper) => {
    if (type === "past") return !p.isModel;
    if (type === "model") return p.isModel;
    return true;
  };

  const filteredAdmin = adminContent.filter(filterFn);
  const filteredTeacher = teacherContent.filter(filterFn);
  const hasContent = filteredAdmin.length > 0 || filteredTeacher.length > 0;

  const typeLabel = type === "past" ? "Past Papers" : type === "model" ? "Model Papers" : "Papers";
  const backHref = "/protected/student/papers";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {subjectName} — Term {term}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {typeLabel}
          </p>
        </div>
        {type && (
          <Badge className={`ml-2 ${type === "model" ? "bg-[#696FC7] text-white" : "bg-[#4D2FB2] text-white"} border-0`}>
            {typeLabel}
          </Badge>
        )}
      </div>

      {!hasContent ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No {typeLabel.toLowerCase()} available for this term yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later!</p>
          <Link href={backHref} className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">← Back to Papers</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredAdmin.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-[#4D2FB2]" />
                <h3 className="text-xl font-semibold text-[#4D2FB2]">Admin Papers</h3>
              </div>
              <div className="grid gap-4">
                {filteredAdmin.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          )}

          {filteredTeacher.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-[#696FC7]" />
                <h3 className="text-xl font-semibold text-[#696FC7]">Teacher Papers</h3>
              </div>
              <div className="grid gap-4">
                {filteredTeacher.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
