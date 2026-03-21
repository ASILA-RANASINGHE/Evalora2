import { getStudentProgressData } from "@/lib/actions/analytics";
import { ProgressDashboard } from "./progress-dashboard";
import { DownloadProgressPDF } from "./components/download-pdf-button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const data = await getStudentProgressData();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Your Progress 📈</h2>
            <p className="text-[#B7BDF7] mt-1 text-sm font-medium">Track your learning journey and improvements</p>
          </div>
          {data && <DownloadProgressPDF data={data} />}
        </div>
      </div>

      {data ? (
        <ProgressDashboard data={data} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-base font-medium text-muted-foreground">No progress data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete quizzes and papers to start tracking your progress here.
            </p>
          </div>
          <Link
            href="/protected/student/quizzes"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            Browse quizzes →
          </Link>
        </div>
      )}
    </div>
  );
}
