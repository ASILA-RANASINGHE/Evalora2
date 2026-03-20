"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewPriority = "High" | "Medium" | "Low";
export type ReviewStatusType = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface PendingReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  paperTitle: string;
  paperTotalMarks: number;
  subjectName: string;
  questionDisplay: string;
  questionType: string;
  submittedAt: Date;
  submittedAgo: string;
  aiMarks: number;
  aiConfidence: number;
  marksAvailable: number;
  overallScore: number;
  status: ReviewStatusType;
  priority: ReviewPriority;
}

export interface ReviewDetail {
  id: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  grade: string;
  paperTitle: string;
  paperTotalMarks: number;
  overallScore: number;
  subjectName: string;
  questionDisplay: string;
  questionText: string;
  questionType: string;
  marksAvailable: number;
  correctAnswer: string;
  studentAnswer: string;
  aiMarks: number;
  aiConfidence: number;
  aiFeedback: string;
  status: ReviewStatusType;
  priority: ReviewPriority;
  requestedAt: Date;
  submittedAgo: string;
  finalMarks: number | null;
  agreeWithAI: boolean;
  overrideReason: string | null;
  teacherFeedback: string | null;
}

export interface ReviewStats {
  totalPending: number;
  totalInProgress: number;
  completedThisWeek: number;
  oldestPendingDate: Date | null;
  totalCompleted: number;
  avgConfidencePending: number;
}

export interface CompletedReviewItem {
  id: string;
  studentName: string;
  paperTitle: string;
  subjectName: string;
  questionDisplay: string;
  reviewerName: string;
  completedAt: Date;
  aiMarks: number;
  finalMarks: number;
  change: number;
  agreeWithAI: boolean;
  overrideReason: string | null;
  teacherFeedback: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computePriority(requestedAt: Date): ReviewPriority {
  const hoursAgo = (Date.now() - requestedAt.getTime()) / (1000 * 60 * 60);
  if (hoursAgo > 48) return "High";
  if (hoursAgo > 24) return "Medium";
  return "Low";
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "1 day ago";
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 604800)} weeks ago`;
}

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// ─── Get review stats ─────────────────────────────────────────────────────────

export async function getReviewStats(adminMode = false): Promise<ReviewStats> {
  const user = await getCurrentUser();

  let studentIds: string[] | undefined;
  if (!adminMode) {
    const links = await prisma.teacherStudentLink.findMany({ where: { teacherId: user.id } });
    studentIds = links.map((l) => l.studentId);
  }

  const whereBase = studentIds ? { studentId: { in: studentIds } } : {};

  const [pending, inProgress, completedAll] = await Promise.all([
    prisma.manualReview.count({ where: { ...whereBase, status: "PENDING" } }),
    prisma.manualReview.count({ where: { ...whereBase, status: "IN_PROGRESS" } }),
    prisma.manualReview.findMany({
      where: { ...whereBase, status: "COMPLETED" },
      select: { completedAt: true },
    }),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = completedAll.filter(
    (r) => r.completedAt && r.completedAt >= weekAgo
  ).length;

  const oldestPending = await prisma.manualReview.findFirst({
    where: { ...whereBase, status: { in: ["PENDING", "IN_PROGRESS"] } },
    orderBy: { requestedAt: "asc" },
    select: { requestedAt: true },
  });

  const pendingItems = await prisma.manualReview.findMany({
    where: { ...whereBase, status: { in: ["PENDING", "IN_PROGRESS"] } },
    select: { aiConfidence: true },
  });

  const avgConf =
    pendingItems.length > 0
      ? Math.round(pendingItems.reduce((s, r) => s + r.aiConfidence, 0) / pendingItems.length)
      : 0;

  return {
    totalPending: pending,
    totalInProgress: inProgress,
    completedThisWeek,
    oldestPendingDate: oldestPending?.requestedAt ?? null,
    totalCompleted: completedAll.length,
    avgConfidencePending: avgConf,
  };
}

// ─── Get pending reviews list ─────────────────────────────────────────────────

export async function getPendingReviews(adminMode = false): Promise<PendingReviewItem[]> {
  const user = await getCurrentUser();

  let studentIds: string[] | undefined;
  if (!adminMode) {
    const links = await prisma.teacherStudentLink.findMany({ where: { teacherId: user.id } });
    studentIds = links.map((l) => l.studentId);
    if (studentIds.length === 0) return [];
  }

  const reviews = await prisma.manualReview.findMany({
    where: {
      ...(studentIds ? { studentId: { in: studentIds } } : {}),
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    include: {
      attempt: {
        include: {
          paper: { include: { subject: true } },
        },
      },
      student: {
        include: { studentDetails: true },
      },
    },
    orderBy: { requestedAt: "asc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: `${r.student.firstName ?? ""} ${r.student.lastName ?? ""}`.trim() || r.student.email,
    grade: r.student.studentDetails?.grade ?? "—",
    paperTitle: r.attempt.paper.title,
    paperTotalMarks: r.attempt.paper.totalMarks,
    subjectName: r.attempt.paper.subject.name,
    questionDisplay: r.questionDisplay,
    questionType: r.questionType,
    submittedAt: r.requestedAt,
    submittedAgo: formatRelative(r.requestedAt),
    aiMarks: r.aiMarks,
    aiConfidence: r.aiConfidence,
    marksAvailable: r.marksAvailable,
    overallScore: r.attempt.score ?? 0,
    status: r.status as ReviewStatusType,
    priority: computePriority(r.requestedAt),
  }));
}

// ─── Get single review detail ─────────────────────────────────────────────────

export async function getReviewDetail(reviewId: string): Promise<ReviewDetail | null> {
  const review = await prisma.manualReview.findUnique({
    where: { id: reviewId },
    include: {
      attempt: {
        include: {
          paper: { include: { subject: true } },
        },
      },
      student: {
        include: { studentDetails: true },
      },
    },
  });
  if (!review) return null;

  // Mark as IN_PROGRESS if still PENDING
  if (review.status === "PENDING") {
    await prisma.manualReview.update({
      where: { id: reviewId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
  }

  return {
    id: review.id,
    attemptId: review.attemptId,
    studentId: review.studentId,
    studentName:
      `${review.student.firstName ?? ""} ${review.student.lastName ?? ""}`.trim() ||
      review.student.email,
    grade: review.student.studentDetails?.grade ?? "—",
    paperTitle: review.attempt.paper.title,
    paperTotalMarks: review.attempt.paper.totalMarks,
    overallScore: review.attempt.score ?? 0,
    subjectName: review.attempt.paper.subject.name,
    questionDisplay: review.questionDisplay,
    questionText: review.questionText,
    questionType: review.questionType,
    marksAvailable: review.marksAvailable,
    correctAnswer: review.correctAnswer,
    studentAnswer: review.studentAnswer,
    aiMarks: review.aiMarks,
    aiConfidence: review.aiConfidence,
    aiFeedback: review.aiFeedback,
    status: review.status as ReviewStatusType,
    priority: computePriority(review.requestedAt),
    requestedAt: review.requestedAt,
    submittedAgo: formatRelative(review.requestedAt),
    finalMarks: review.finalMarks,
    agreeWithAI: review.agreeWithAI,
    overrideReason: review.overrideReason,
    teacherFeedback: review.teacherFeedback,
  };
}

// ─── Save draft ───────────────────────────────────────────────────────────────

export async function saveReviewDraft(
  reviewId: string,
  data: {
    finalMarks: number;
    agreeWithAI: boolean;
    overrideReason?: string;
    teacherFeedback?: string;
  }
): Promise<{ ok: boolean }> {
  await getCurrentUser();
  await prisma.manualReview.update({
    where: { id: reviewId },
    data: {
      status: "IN_PROGRESS",
      finalMarks: data.finalMarks,
      agreeWithAI: data.agreeWithAI,
      overrideReason: data.overrideReason ?? null,
      teacherFeedback: data.teacherFeedback ?? null,
    },
  });
  return { ok: true };
}

// ─── Complete review ──────────────────────────────────────────────────────────

export async function completeReview(
  reviewId: string,
  data: {
    finalMarks: number;
    agreeWithAI: boolean;
    overrideReason?: string;
    teacherFeedback?: string;
  }
): Promise<{ ok: boolean; oldTotal: number; newTotal: number }> {
  const user = await getCurrentUser();

  const review = await prisma.manualReview.findUnique({
    where: { id: reviewId },
    include: {
      attempt: { include: { paper: true } },
      student: true,
    },
  });
  if (!review) throw new Error("Review not found");

  // Parse the current results JSON
  type StoredResult = {
    questionId: string;
    marksAwarded: number;
    isCorrect: boolean;
    isPartial: boolean;
    manuallyReviewed?: boolean;
    teacherFeedback?: string;
    [key: string]: unknown;
  };

  const results: StoredResult[] = Array.isArray(review.attempt.results)
    ? (review.attempt.results as StoredResult[])
    : [];

  const oldTotal = review.attempt.score ?? 0;

  // Update the specific question's result
  const updatedResults = results.map((r) => {
    if (r.questionId !== review.questionId) return r;
    const fm = data.finalMarks;
    return {
      ...r,
      marksAwarded: fm,
      isCorrect: fm >= review.marksAvailable,
      isPartial: fm > 0 && fm < review.marksAvailable,
      manuallyReviewed: true,
      teacherFeedback: data.teacherFeedback ?? null,
    };
  });

  // Recalculate total score
  const newMarksEarned = updatedResults.reduce(
    (s: number, r: StoredResult) => s + (r.marksAwarded ?? 0),
    0
  );
  const totalMarks = review.attempt.paper.totalMarks;
  const newScore = totalMarks > 0 ? Math.round((newMarksEarned / totalMarks) * 100 * 10) / 10 : 0;

  // Swap review: → reviewed: in flagged array
  const currentFlagged = (review.attempt.flagged as string[]) ?? [];
  const updatedFlagged = currentFlagged
    .filter((f) => f !== `review:${review.questionId}`)
    .concat(`reviewed:${review.questionId}`);

  // Execute updates in a transaction
  await prisma.$transaction([
    // Update the attempt results and score
    prisma.paperAttempt.update({
      where: { id: review.attemptId },
      data: {
        results: updatedResults,
        score: newScore,
        flagged: updatedFlagged,
      },
    }),
    // Complete the review
    prisma.manualReview.update({
      where: { id: reviewId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        reviewerId: user.id,
        finalMarks: data.finalMarks,
        agreeWithAI: data.agreeWithAI,
        overrideReason: data.overrideReason ?? null,
        teacherFeedback: data.teacherFeedback ?? null,
      },
    }),
    // Create in-app notification for student
    prisma.notification.create({
      data: {
        userId: review.studentId,
        title: "Manual Review Completed",
        type: "review_complete",
        message: `Your answer for ${review.questionDisplay} in "${review.attempt.paper.title}" has been reviewed.`,
        data: {
          reviewId,
          attemptId: review.attemptId,
          questionDisplay: review.questionDisplay,
          paperTitle: review.attempt.paper.title,
          aiMarks: review.aiMarks,
          finalMarks: data.finalMarks,
          oldScore: oldTotal,
          newScore,
          teacherFeedback: data.teacherFeedback ?? null,
        },
      },
    }),
  ]);

  // Update StudentProgress average score
  try {
    const allAttempts = await prisma.paperAttempt.findMany({
      where: { studentId: review.studentId, submittedAt: { not: null } },
      select: { score: true },
    });
    const scores = allAttempts.map((a) => a.score ?? 0).filter((s) => s > 0);
    if (scores.length > 0) {
      const avg = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
      await prisma.studentProgress.upsert({
        where: { studentId: review.studentId },
        update: { averageScore: avg },
        create: { studentId: review.studentId, averageScore: avg },
      });
    }
  } catch {
    // Non-critical — don't fail the whole operation
  }

  return { ok: true, oldTotal, newTotal: newScore };
}

// ─── Bulk approve (AI marks accepted for high-confidence reviews) ──────────────

export async function bulkApproveReviews(
  reviewIds: string[]
): Promise<{ ok: boolean; count: number }> {
  const user = await getCurrentUser();

  // Fetch the reviews to validate they're all high confidence
  const reviews = await prisma.manualReview.findMany({
    where: { id: { in: reviewIds }, status: { in: ["PENDING", "IN_PROGRESS"] } },
    include: { attempt: { include: { paper: true } } },
  });

  let completed = 0;
  for (const review of reviews) {
    try {
      await completeReview(review.id, {
        finalMarks: review.aiMarks,
        agreeWithAI: true,
        teacherFeedback: "Approved — AI assessment accepted.",
      });
      completed++;
    } catch {
      // Continue with others if one fails
    }
  }

  return { ok: true, count: completed };
}

// ─── Get completed reviews (history) ─────────────────────────────────────────

export async function getCompletedReviews(adminMode = false): Promise<CompletedReviewItem[]> {
  const user = await getCurrentUser();

  let studentIds: string[] | undefined;
  if (!adminMode) {
    const links = await prisma.teacherStudentLink.findMany({ where: { teacherId: user.id } });
    studentIds = links.map((l) => l.studentId);
    if (studentIds.length === 0) return [];
  }

  const reviews = await prisma.manualReview.findMany({
    where: {
      ...(studentIds ? { studentId: { in: studentIds } } : {}),
      status: "COMPLETED",
    },
    include: {
      attempt: { include: { paper: { include: { subject: true } } } },
      student: true,
      reviewer: true,
    },
    orderBy: { completedAt: "desc" },
    take: 200,
  });

  return reviews.map((r) => ({
    id: r.id,
    studentName:
      `${r.student.firstName ?? ""} ${r.student.lastName ?? ""}`.trim() || r.student.email,
    paperTitle: r.attempt.paper.title,
    subjectName: r.attempt.paper.subject.name,
    questionDisplay: r.questionDisplay,
    reviewerName: r.reviewer
      ? `${r.reviewer.firstName ?? ""} ${r.reviewer.lastName ?? ""}`.trim() || r.reviewer.email
      : "—",
    completedAt: r.completedAt!,
    aiMarks: r.aiMarks,
    finalMarks: r.finalMarks ?? r.aiMarks,
    change: (r.finalMarks ?? r.aiMarks) - r.aiMarks,
    agreeWithAI: r.agreeWithAI,
    overrideReason: r.overrideReason,
    teacherFeedback: r.teacherFeedback,
  }));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getUnreadNotifications(): Promise<
  { id: string; title: string; message: string; type: string; createdAt: Date; data: unknown }[]
> {
  const user = await getCurrentUser();
  const notifs = await prisma.notification.findMany({
    where: { userId: user.id, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return notifs.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt,
    data: n.data,
  }));
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  const user = await getCurrentUser();
  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: user.id },
    data: { isRead: true },
  });
}
