import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Eye, Shield, GraduationCap } from "lucide-react";
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
    <Card className="hover:border-purple-300 transition-colors">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{paper.title}</h3>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              {paper.year && <span>Year: {paper.year}</span>}
              <span>Duration: {paper.duration >= 60 ? `${Math.floor(paper.duration / 60)}h ${paper.duration % 60 > 0 ? `${paper.duration % 60}m` : ""}` : `${paper.duration} mins`}</span>
              <span>Total Marks: {paper.totalMarks}</span>
              <span>Grade: {paper.grade}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/protected/student/papers/${paper.id}`} className="flex-1 sm:flex-none">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Eye className="h-4 w-4 mr-2" /> View Paper
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TermPapersPage({ params }: { params: Promise<{ subject: string; term: string }> }) {
  const { subject, term } = await params;
  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
  const { adminContent, teacherContent } = await getPapersBySubjectAndTerm(subjectName, term);

  const hasContent = adminContent.length > 0 || teacherContent.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/protected/student/papers" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{subjectName} - Term {term} Papers</h2>
      </div>

      {!hasContent ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No papers available for this term yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Admin Content Section */}
          {adminContent.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-600">Admin Papers</h3>
              </div>
              <div className="grid gap-4">
                {adminContent.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          )}

          {/* Teacher Content Section */}
          {teacherContent.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <h3 className="text-xl font-semibold text-green-600">Teacher Papers</h3>
              </div>
              <div className="grid gap-4">
                {teacherContent.map((paper) => (
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
