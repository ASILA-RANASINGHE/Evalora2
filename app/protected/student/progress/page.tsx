import { getStudentProgressData } from "@/lib/actions/analytics";
import { ProgressDashboard } from "./progress-dashboard";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const data = await getStudentProgressData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Progress</h2>
        <p className="text-muted-foreground mt-1">Track your learning journey and improvements</p>
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
