import { getPendingReviews, getReviewStats, getCompletedReviews } from "@/lib/actions/review";
import { FlaggedDashboard } from "./flagged-dashboard";
import { Flag, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ReviewFlaggedPage() {
  const [stats, pendingReviews, completedReviews] = await Promise.all([
    getReviewStats(false),
    getPendingReviews(false),
    getCompletedReviews(false),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold flex items-center gap-2">
          <Flag className="h-6 w-6 text-amber-500" />
          Review Flagged Answers
        </h2>
        <p className="text-muted-foreground mt-1">
          Manually grade student answers that require teacher review
        </p>
      </div>

      {stats.totalPending === 0 && stats.totalInProgress === 0 && stats.totalCompleted === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-base font-medium text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When students flag answers for manual grading, they&apos;ll appear here.
            </p>
          </div>
          <Link href="/protected/teacher" className="text-sm font-semibold text-purple-600 hover:underline">
            Back to dashboard →
          </Link>
        </div>
      ) : (
        <FlaggedDashboard
          initialStats={stats}
          initialPending={pendingReviews}
          initialCompleted={completedReviews}
          adminMode={false}
        />
      )}
    </div>
  );
}
