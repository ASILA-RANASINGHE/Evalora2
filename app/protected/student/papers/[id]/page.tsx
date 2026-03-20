import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle2,
  Play,
  BookOpen,
  Hash,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { getPaperById, getStudentPaperAttempts } from "@/lib/actions/paper";
import { notFound } from "next/navigation";

const termLabels: Record<string, string> = {
  TERM_1: "Term 1",
  TERM_2: "Term 2",
  TERM_3: "Term 3",
  MID_YEAR: "Mid-Year",
  END_OF_YEAR: "End of Year",
};

const gradeColors: Record<string, string> = {
  "A+": "text-green-600",
  A: "text-green-500",
  "B+": "text-blue-600",
  B: "text-blue-500",
  C: "text-yellow-600",
  S: "text-orange-500",
  F: "text-red-600",
};

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  }
  return `${minutes}m`;
}

export default async function PaperViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [paper, attempts] = await Promise.all([
    getPaperById(id),
    getStudentPaperAttempts(id),
  ]);

  if (!paper) notFound();

  const durationLabel =
    paper.duration >= 60
      ? `${Math.floor(paper.duration / 60)} Hour${Math.floor(paper.duration / 60) > 1 ? "s" : ""}${paper.duration % 60 > 0 ? ` ${paper.duration % 60} Min` : ""}`
      : `${paper.duration} Minutes`;

  const hasAttempts = attempts.length > 0;
  const bestAttempt = hasAttempts
    ? attempts.reduce((best, a) => (a.score > best.score ? a : best), attempts[0])
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href="/protected/student/papers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Papers
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 text-sm">
          {paper.subject} &bull; {termLabels[paper.term] || paper.term}
          {paper.year ? ` \u2022 ${paper.year}` : ""}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{paper.title}</h1>
        <p className="text-muted-foreground">
          {paper.grade}
          {paper.isModel ? " \u2022 Model Paper" : ""}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <Clock className="h-7 w-7 text-blue-500" />
            <span className="font-bold text-lg">{durationLabel}</span>
            <span className="text-xs text-muted-foreground">Time Limit</span>
          </CardContent>
        </Card>
        {paper.mcqCount > 0 && (
          <Card>
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <Hash className="h-7 w-7 text-blue-500" />
              <span className="font-bold text-lg">{paper.mcqCount}</span>
              <span className="text-xs text-muted-foreground">MCQs (Part 1)</span>
            </CardContent>
          </Card>
        )}
        {paper.essayCount > 0 && (
          <Card>
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <FileText className="h-7 w-7 text-purple-500" />
              <span className="font-bold text-lg">{paper.essayCount}</span>
              <span className="text-xs text-muted-foreground">Structured (Part 2)</span>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
            <span className="font-bold text-lg">{paper.totalMarks} Marks</span>
            <span className="text-xs text-muted-foreground">
              Pass: {paper.passPercentage}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Paper structure */}
      {(paper.mcqCount > 0 || paper.essayCount > 0) && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-base">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Paper Structure
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 text-muted-foreground font-medium">Section</th>
                  <th className="pb-2 text-muted-foreground font-medium">Type</th>
                  <th className="pb-2 text-muted-foreground font-medium text-center">
                    Questions
                  </th>
                  <th className="pb-2 text-muted-foreground font-medium text-center">
                    Marks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paper.mcqCount > 0 && (
                  <tr>
                    <td className="py-3 font-medium">Section A</td>
                    <td className="py-3 text-muted-foreground">
                      Part 1 — MCQ / True/False / Fill in Blank
                    </td>
                    <td className="py-3 text-center">{paper.mcqCount}</td>
                    <td className="py-3 text-center font-semibold">
                      {paper.mcqCount * paper.mcqMarks}
                    </td>
                  </tr>
                )}
                {paper.essayCount > 0 && (
                  <tr>
                    <td className="py-3 font-medium">Section B</td>
                    <td className="py-3 text-muted-foreground">
                      Structured / Essay
                    </td>
                    <td className="py-3 text-center">{paper.essayCount}</td>
                    <td className="py-3 text-center font-semibold">
                      {paper.totalMarks - paper.mcqCount * paper.mcqMarks}
                    </td>
                  </tr>
                )}
                <tr className="font-bold bg-gray-50 dark:bg-muted/30">
                  <td className="py-3" colSpan={2}>
                    Total
                  </td>
                  <td className="py-3 text-center">{paper.mcqCount + paper.essayCount}</td>
                  <td className="py-3 text-center">{paper.totalMarks}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {paper.instructions && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-yellow-600 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Instructions
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {paper.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past Attempts */}
      {hasAttempts && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-base text-green-700">
              <Trophy className="h-5 w-5" />
              Your Attempts
              <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Best score highlight */}
            {bestAttempt && (
              <div className="flex items-center justify-between bg-white dark:bg-card rounded-xl border border-green-200 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Best Score</p>
                  <p className="text-2xl font-bold mt-0.5">
                    <span className={gradeColors[bestAttempt.grade] ?? "text-gray-700"}>
                      {bestAttempt.grade}
                    </span>
                    <span className="text-base font-semibold text-muted-foreground ml-2">
                      {bestAttempt.score}%
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(bestAttempt.submittedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Time: {formatDuration(Math.ceil(bestAttempt.timeTaken / 60))}
                  </p>
                </div>
              </div>
            )}

            {/* All attempts list */}
            {attempts.length > 1 && (
              <div className="space-y-2">
                {attempts.map((attempt, idx) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg bg-white dark:bg-card border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-medium w-16 shrink-0">
                        Attempt {attempts.length - idx}
                      </span>
                      <span className={`font-bold ${gradeColors[attempt.grade] ?? "text-gray-700"}`}>
                        {attempt.grade} — {attempt.score}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <span>
                        {new Date(attempt.submittedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="mx-1.5">&bull;</span>
                      <span>{formatDuration(Math.ceil(attempt.timeTaken / 60))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Warning */}
      <Card className="border-l-4 border-l-red-500 bg-red-50">
        <CardContent className="p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Important Notice</p>
            <p className="text-red-600 text-sm mt-1">
              Once you start, the timer begins and{" "}
              <strong>cannot be paused</strong>. Make sure you have a stable
              internet connection and sufficient time before beginning.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center pt-2 pb-8">
        <Link href={`/protected/student/papers/${paper.id}/attempt`}>
          <Button
            size="lg"
            className="h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all gap-3"
          >
            {hasAttempts ? (
              <>
                <RotateCcw className="h-5 w-5" />
                Attempt Again
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Paper
              </>
            )}
          </Button>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" />
          {paper.mcqCount + paper.essayCount} questions &bull; {paper.totalMarks} marks &bull;{" "}
          {durationLabel}
        </p>
      </div>
    </div>
  );
}
