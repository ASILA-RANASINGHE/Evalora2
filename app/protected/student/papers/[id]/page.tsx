import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { getPaperById } from "@/lib/actions/paper";
import { notFound } from "next/navigation";

const termLabels: Record<string, string> = {
  TERM_1: "Term 1",
  TERM_2: "Term 2",
  TERM_3: "Term 3",
  MID_YEAR: "Mid-Year",
  END_OF_YEAR: "End of Year",
};

export default async function PaperViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = await getPaperById(id);

  if (!paper) {
    notFound();
  }

  const durationLabel = paper.duration >= 60
    ? `${Math.floor(paper.duration / 60)} Hour${Math.floor(paper.duration / 60) > 1 ? "s" : ""}${paper.duration % 60 > 0 ? ` ${paper.duration % 60} Min` : ""}`
    : `${paper.duration} Minutes`;

  const sections = (paper.mcqCount > 0 ? 1 : 0) + (paper.essayCount > 0 ? 1 : 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/protected/student/papers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Papers
      </Link>

      <div className="text-center space-y-4">
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 text-sm">
          {paper.subject} &bull; {termLabels[paper.term] || paper.term} {paper.year ? `\u2022 ${paper.year}` : ""}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{paper.title}</h1>
        <p className="text-xl text-muted-foreground">
          {paper.grade} {paper.isModel ? "- Model Paper" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <span className="font-bold text-lg">{durationLabel}</span>
            <span className="text-sm text-muted-foreground">Duration</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <FileText className="h-8 w-8 text-purple-500 mb-2" />
            <span className="font-bold text-lg">{sections} Section{sections !== 1 ? "s" : ""}</span>
            <span className="text-sm text-muted-foreground">
              {paper.mcqCount > 0 ? `${paper.mcqCount} MCQs` : ""}{paper.mcqCount > 0 && paper.essayCount > 0 ? " + " : ""}{paper.essayCount > 0 ? `${paper.essayCount} Essays` : ""}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-bold text-lg">{paper.totalMarks} Marks</span>
            <span className="text-sm text-muted-foreground">Pass: {paper.passPercentage}%</span>
          </CardContent>
        </Card>
      </div>

      {paper.instructions && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 font-bold text-lg mb-2">
              <AlertCircle className="h-5 w-5" />
              Instructions
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{paper.instructions}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-center pt-4">
        <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
          Start Examination via PDF Viewer
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Opens in a secure, interactive viewing environment</p>
      </div>
    </div>
  );
}
