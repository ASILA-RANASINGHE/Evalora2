import { getTeacherAnalyticsData } from "@/lib/actions/analytics";
import { AnalysisDashboard } from "./analysis-dashboard";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AnalysisPage() {
  const payload = await getTeacherAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Student Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Class overview, performance trends, and individual student insights
        </p>
      </div>

      {payload ? (
        <AnalysisDashboard payload={payload} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-base font-medium text-muted-foreground">No analytics data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with students and they&apos;ll appear here once they start attempting papers and quizzes.
            </p>
          </div>
          <Link
            href="/protected/teacher"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            Back to dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
