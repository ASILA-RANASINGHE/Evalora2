"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/generated/prisma/enums";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return profile?.role === "ADMIN" ? user.id : null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AdminDashboardData {
  userCounts: { STUDENT: number; TEACHER: number; PARENT: number; ADMIN: number };
  contentCounts: { notes: number; quizzes: number; papers: number };
  pendingContent: number;
  pendingReviews: number;
  totalAttempts: number;
  recentActivity: {
    type: "user_joined" | "content_uploaded";
    title: string;
    time: string;
  }[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData | null> {
  const adminId = await requireAdmin();
  if (!adminId) return null;

  const [
    profileGroups,
    noteCount,
    quizCount,
    paperCount,
    pendingNotes,
    pendingQuizzes,
    pendingPapers,
    pendingReviews,
    paperAttempts,
    quizAttempts,
    recentUsers,
    recentNotes,
    recentQuizzes,
    recentPapers,
  ] = await Promise.all([
    prisma.profile.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.note.count({ where: { status: "APPROVED" } }),
    prisma.quiz.count({ where: { status: "APPROVED" } }),
    prisma.paper.count({ where: { status: "APPROVED" } }),
    prisma.note.count({ where: { status: "PENDING" } }),
    prisma.quiz.count({ where: { status: "PENDING" } }),
    prisma.paper.count({ where: { status: "PENDING" } }),
    prisma.manualReview.count({ where: { status: "PENDING" } }),
    prisma.paperAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { firstName: true, lastName: true, createdAt: true, role: true },
    }),
    prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true },
    }),
    prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true },
    }),
    prisma.paper.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true },
    }),
  ]);

  const userCounts = { STUDENT: 0, TEACHER: 0, PARENT: 0, ADMIN: 0 };
  for (const g of profileGroups) {
    userCounts[g.role as keyof typeof userCounts] = g._count.id;
  }

  const activity: AdminDashboardData["recentActivity"] = [
    ...recentUsers.map((u) => ({
      type: "user_joined" as const,
      title: `${`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "New user"} joined as ${u.role.toLowerCase()}`,
      time: formatAgo(u.createdAt),
    })),
    ...recentNotes.map((n) => ({
      type: "content_uploaded" as const,
      title: `Note uploaded: "${n.title}"`,
      time: formatAgo(n.createdAt),
    })),
    ...recentQuizzes.map((q) => ({
      type: "content_uploaded" as const,
      title: `Quiz uploaded: "${q.title}"`,
      time: formatAgo(q.createdAt),
    })),
    ...recentPapers.map((p) => ({
      type: "content_uploaded" as const,
      title: `Paper uploaded: "${p.title}"`,
      time: formatAgo(p.createdAt),
    })),
  ]
    .sort((a, b) => 0)
    .slice(0, 8);

  return {
    userCounts,
    contentCounts: { notes: noteCount, quizzes: quizCount, papers: paperCount },
    pendingContent: pendingNotes + pendingQuizzes + pendingPapers,
    pendingReviews,
    totalAttempts: paperAttempts + quizAttempts,
    recentActivity: activity,
  };
}

// ─── Admin Profile ────────────────────────────────────────────────────────────

export interface AdminProfileData {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: string;
}

export async function getAdminProfile(): Promise<AdminProfileData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: { adminDetails: true },
  });
  if (!profile) return null;

  const name =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Admin";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: profile.id,
    name,
    initials,
    email: profile.email,
    role: profile.role,
    department: profile.adminDetails?.department ?? null,
    createdAt: profile.createdAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  grade?: string;
  subject?: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const adminId = await requireAdmin();
  if (!adminId) return [];

  const profiles = await prisma.profile.findMany({
    include: {
      studentDetails: { select: { grade: true } },
      teacherDetails: { select: { subject: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return profiles.map((p) => ({
    id: p.id,
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    email: p.email,
    role: p.role,
    createdAt: p.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    grade: p.studentDetails?.grade,
    subject: p.teacherDetails?.subject,
  }));
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) return { success: false, error: "Unauthorized" };

  await prisma.profile.update({ where: { id: userId }, data: { role: newRole } });
  return { success: true };
}

// ─── Content ──────────────────────────────────────────────────────────────────

export interface AdminContentItem {
  id: string;
  type: "note" | "quiz" | "paper";
  title: string;
  subject: string;
  author: string;
  status: "APPROVED" | "PENDING" | "FLAGGED" | "DRAFT";
  visibility: "PUBLIC" | "PRIVATE" | "STUDENTS_ONLY";
  createdAt: string;
}

export async function getAdminContent(): Promise<AdminContentItem[]> {
  const adminId = await requireAdmin();
  if (!adminId) return [];

  const [notes, quizzes, papers] = await Promise.all([
    prisma.note.findMany({
      include: {
        subject: true,
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quiz.findMany({
      include: {
        subject: true,
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.paper.findMany({
      include: {
        subject: true,
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    ...notes.map((n) => ({
      id: n.id,
      type: "note" as const,
      title: n.title,
      subject: n.subject.name,
      author:
        `${n.createdBy.firstName ?? ""} ${n.createdBy.lastName ?? ""}`.trim() ||
        "Unknown",
      status: n.status,
      visibility: n.visibility,
      createdAt: n.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      type: "quiz" as const,
      title: q.title,
      subject: q.subject.name,
      author:
        `${q.createdBy.firstName ?? ""} ${q.createdBy.lastName ?? ""}`.trim() ||
        "Unknown",
      status: q.status,
      visibility: q.visibility,
      createdAt: q.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
    ...papers.map((p) => ({
      id: p.id,
      type: "paper" as const,
      title: p.title,
      subject: p.subject.name,
      author:
        `${p.createdBy.firstName ?? ""} ${p.createdBy.lastName ?? ""}`.trim() ||
        "Unknown",
      status: p.status,
      visibility: p.visibility,
      createdAt: p.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function approveContent(
  id: string,
  type: "note" | "quiz" | "paper"
): Promise<{ success: boolean }> {
  const adminId = await requireAdmin();
  if (!adminId) return { success: false };

  if (type === "note")
    await prisma.note.update({ where: { id }, data: { status: "APPROVED" } });
  else if (type === "quiz")
    await prisma.quiz.update({ where: { id }, data: { status: "APPROVED" } });
  else
    await prisma.paper.update({ where: { id }, data: { status: "APPROVED" } });

  return { success: true };
}

export async function flagContent(
  id: string,
  type: "note" | "quiz" | "paper"
): Promise<{ success: boolean }> {
  const adminId = await requireAdmin();
  if (!adminId) return { success: false };

  if (type === "note")
    await prisma.note.update({ where: { id }, data: { status: "FLAGGED" } });
  else if (type === "quiz")
    await prisma.quiz.update({ where: { id }, data: { status: "FLAGGED" } });
  else
    await prisma.paper.update({ where: { id }, data: { status: "FLAGGED" } });

  return { success: true };
}

export async function updateContentVisibility(
  id: string,
  type: "note" | "quiz" | "paper",
  visibility: "PUBLIC" | "PRIVATE" | "STUDENTS_ONLY"
): Promise<{ success: boolean }> {
  const adminId = await requireAdmin();
  if (!adminId) return { success: false };

  if (type === "note")
    await prisma.note.update({ where: { id }, data: { visibility } });
  else if (type === "quiz")
    await prisma.quiz.update({ where: { id }, data: { visibility } });
  else await prisma.paper.update({ where: { id }, data: { visibility } });

  return { success: true };
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface AdminReportData {
  totals: {
    users: number;
    content: number;
    attempts: number;
    pendingReviews: number;
  };
  usersByRole: { role: string; count: number; fill: string }[];
  contentByType: { type: string; count: number; fill: string }[];
  contentBySubject: { subject: string; count: number }[];
  registrationsByMonth: { month: string; count: number }[];
  attemptsByMonth: { month: string; count: number }[];
  topStudents: { name: string; avgScore: number; attempts: number }[];
}

export async function getAdminReportData(): Promise<AdminReportData | null> {
  const adminId = await requireAdmin();
  if (!adminId) return null;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    profileGroups,
    noteCount,
    quizCount,
    paperCount,
    paperAttemptCount,
    quizAttemptCount,
    pendingReviews,
    recentProfiles,
    recentPaperAttempts,
    recentQuizAttempts,
    subjectNotes,
    subjectQuizzes,
    subjectPapers,
    topProgress,
  ] = await Promise.all([
    prisma.profile.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.note.count(),
    prisma.quiz.count(),
    prisma.paper.count(),
    prisma.paperAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.manualReview.count({ where: { status: "PENDING" } }),
    prisma.profile.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.paperAttempt.findMany({
      where: { submittedAt: { gte: sixMonthsAgo, not: null } },
      select: { submittedAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { submittedAt: { gte: sixMonthsAgo, not: null } },
      select: { submittedAt: true },
    }),
    prisma.note.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    }),
    prisma.quiz.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    }),
    prisma.paper.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    }),
    prisma.studentProgress.findMany({
      orderBy: { averageScore: "desc" },
      take: 10,
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  // Fetch subject names for the IDs we found
  const allSubjectIds = [
    ...new Set([
      ...subjectNotes.map((s) => s.subjectId),
      ...subjectQuizzes.map((s) => s.subjectId),
      ...subjectPapers.map((s) => s.subjectId),
    ]),
  ];
  const subjects = await prisma.subject.findMany({
    where: { id: { in: allSubjectIds } },
    select: { id: true, name: true },
  });
  const subjectNameMap = new Map(subjects.map((s) => [s.id, s.name]));

  // Build per-subject content count
  const subjectContentMap = new Map<string, number>();
  for (const sn of subjectNotes) {
    const name = subjectNameMap.get(sn.subjectId) ?? sn.subjectId;
    subjectContentMap.set(name, (subjectContentMap.get(name) ?? 0) + sn._count.id);
  }
  for (const sq of subjectQuizzes) {
    const name = subjectNameMap.get(sq.subjectId) ?? sq.subjectId;
    subjectContentMap.set(name, (subjectContentMap.get(name) ?? 0) + sq._count.id);
  }
  for (const sp of subjectPapers) {
    const name = subjectNameMap.get(sp.subjectId) ?? sp.subjectId;
    subjectContentMap.set(name, (subjectContentMap.get(name) ?? 0) + sp._count.id);
  }
  const contentBySubject = Array.from(subjectContentMap.entries())
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  // Build monthly trend buckets (last 6 months)
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(monthLabel(d));
  }

  function bucketByMonth(dates: (Date | null)[]): { month: string; count: number }[] {
    const map = new Map<string, number>(months.map((m) => [m, 0]));
    for (const d of dates) {
      if (!d) continue;
      const label = monthLabel(d);
      if (map.has(label)) map.set(label, (map.get(label) ?? 0) + 1);
    }
    return months.map((month) => ({ month, count: map.get(month) ?? 0 }));
  }

  const registrationsByMonth = bucketByMonth(recentProfiles.map((p) => p.createdAt));
  const attemptDates = [
    ...recentPaperAttempts.map((a) => a.submittedAt),
    ...recentQuizAttempts.map((a) => a.submittedAt),
  ];
  const attemptsByMonth = bucketByMonth(attemptDates);

  // Users by role
  const ROLE_FILLS: Record<string, string> = {
    STUDENT: "#4D2FB2",
    TEACHER: "#10b981",
    PARENT: "#f59e0b",
    ADMIN: "#6366f1",
  };
  const usersByRole = profileGroups.map((g) => ({
    role: g.role.charAt(0) + g.role.slice(1).toLowerCase(),
    count: g._count.id,
    fill: ROLE_FILLS[g.role] ?? "#94a3b8",
  }));

  // Top students
  const topStudents = topProgress.map((p) => ({
    name:
      `${p.student.firstName ?? ""} ${p.student.lastName ?? ""}`.trim() ||
      "Student",
    avgScore: Math.round(p.averageScore),
    attempts: p.papersAttempted + p.quizzesCompleted,
  }));

  return {
    totals: {
      users: profileGroups.reduce((s, g) => s + g._count.id, 0),
      content: noteCount + quizCount + paperCount,
      attempts: paperAttemptCount + quizAttemptCount,
      pendingReviews,
    },
    usersByRole,
    contentByType: [
      { type: "Notes", count: noteCount, fill: "#4D2FB2" },
      { type: "Quizzes", count: quizCount, fill: "#10b981" },
      { type: "Papers", count: paperCount, fill: "#f59e0b" },
    ],
    contentBySubject,
    registrationsByMonth,
    attemptsByMonth,
    topStudents,
  };
}
