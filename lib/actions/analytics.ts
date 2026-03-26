"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10;
}

function avgInt(arr: number[]): number {
  return Math.round(avg(arr));
}

function getWeekLabel(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = daysBetween(date, now);
  if (diff === 0) {
    const h = date.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    const mins = date.getMinutes().toString().padStart(2, "0");
    return `Today, ${hour}:${mins} ${ampm}`;
  }
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

function computeStudentStatus(
  avgScore: number,
  lastActive: Date | null
): "Active" | "At Risk" | "Inactive" {
  if (!lastActive) return "Inactive";
  const days = daysBetween(lastActive, new Date());
  if (days > 30) return "Inactive";
  if (days > 14 || avgScore < 50) return "At Risk";
  return "Active";
}

function computeTrend(scores: number[]): "up" | "down" | "stable" {
  if (scores.length < 4) return "stable";
  const recent = avg(scores.slice(-Math.min(3, scores.length)));
  const earlier = avg(scores.slice(0, Math.max(1, scores.length - 3)));
  if (recent > earlier + 2) return "up";
  if (recent < earlier - 2) return "down";
  return "stable";
}

function topicStatus(accuracy: number): "Mastered" | "Learning" | "Needs Work" | "Weak" {
  if (accuracy >= 80) return "Mastered";
  if (accuracy >= 65) return "Learning";
  if (accuracy >= 50) return "Needs Work";
  return "Weak";
}

function topicStrength(accuracy: number): "Strong" | "Average" | "Weak" {
  if (accuracy >= 75) return "Strong";
  if (accuracy >= 55) return "Average";
  return "Weak";
}

// ─── Exported Types ──────────────────────────────────────────────────────────

export interface PerformanceDataPoint {
  date: string;
  overall: number;
  [subject: string]: string | number;
}

export interface InsightMessage {
  category: "performance" | "topic" | "time" | "comparative" | "notes";
  message: string;
}

export interface PracticeRecommendation {
  subject: string;
  topic: string;
  steps: string[];
  estimatedMinutes: number;
  expectedImprovement: string;
  priority: "high" | "medium" | "low";
}

export interface StudentDashboardData {
  stats: {
    subjectsCount: number;
    averageScore: number;
    totalAttempts: number;
    studyStreak: number;
  };
  recentAttempts: {
    subject: string;
    title: string;
    score: number;
    date: string;
  }[];
  insights: InsightMessage[];
  recommendations: PracticeRecommendation[];
}

export interface StudentProgressData {
  overviewStats: {
    papersDone: number;
    papersWeekly: number;
    averageScore: number;
    scoreTrend: number;
    studyStreak: number;
    bestStreak: number;
    rank: number;
    totalStudents: number;
    percentile: number;
  };
  scoreHistory: PerformanceDataPoint[];
  chartSubjects: string[]; // subject keys used in PerformanceDataPoint
  heatmapData: { date: string; minutes: number }[];
  subjectScores: {
    subject: string;
    yourScore: number;
    classAvg: number;
    papersAttempted: number;
  }[];
  topicMastery: {
    topic: string;
    subject: string;
    accuracy: number;
    questionsAttempted: number;
    status: "Mastered" | "Learning" | "Needs Work" | "Weak";
  }[];
  questionTypeStats: {
    type: string;
    attempted: number;
    accuracy: number;
    color: string;
  }[];
  weakAreas: {
    topic: string;
    subject: string;
    accuracy: number;
    target: number;
    gap: number;
    daysSincePracticed: number;
  }[];
  comparativeData: {
    subject: string;
    yourScore: number;
    classAvg: number;
    percentileRank: number;
  }[];
  timePerformance: { hour: string; avgScore: number }[];
  notesEngagement: {
    topic: string;
    subject: string;
    notesRead: number;
    totalNotes: number;
    timeSpentMin: number;
    completionPct: number;
    status: "complete" | "in-progress" | "not-started";
  }[];
  riskAlerts: {
    level: "critical" | "warning" | "on-track";
    title: string;
    reason: string;
    action: string;
  }[];
}

export interface TeacherDashboardData {
  stats: {
    totalStudents: number;
    classAverage: number;
    pendingReviews: number;
    recentUploads: number;
  };
  students: {
    name: string;
    grade: string;
    subjects: string[];
    avgScore: number;
    status: "Active" | "At Risk" | "Inactive";
    lastActive: string;
  }[];
  todayStats: {
    submissions: number;
    uploads: number;
  };
}

// Uses the same interfaces as teacher-mock-data.ts for component compatibility
export interface TeacherAnalyticsPayload {
  students: import("@/lib/teacher-mock-data").Student[];
  analytics: import("@/lib/teacher-mock-data").TeacherAnalyticsData;
}

// ─── 1. Student Dashboard ────────────────────────────────────────────────────

export async function getStudentDashboardData(): Promise<StudentDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [progress, paperAttempts, quizAttempts] = await Promise.all([
    prisma.studentProgress.findUnique({ where: { studentId: user.id } }),
    prisma.paperAttempt.findMany({
      where: { studentId: user.id, submittedAt: { not: null } },
      include: { paper: { include: { subject: true } } },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
    prisma.quizAttempt.findMany({
      where: { studentId: user.id, submittedAt: { not: null } },
      include: { quiz: { include: { subject: true } } },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
  ]);

  const subjectSet = new Set<string>();
  paperAttempts.forEach((a) => subjectSet.add(a.paper.subject.name));
  quizAttempts.forEach((a) => subjectSet.add(a.quiz.subject.name));

  const combined = [
    ...paperAttempts.map((a) => ({
      subject: a.paper.subject.name,
      title: a.paper.title,
      score: Math.round(a.score ?? 0),
      date: a.submittedAt!,
    })),
    ...quizAttempts.map((a) => ({
      subject: a.quiz.subject.name,
      title: a.quiz.title,
      score: Math.round(a.score ?? 0),
      date: a.submittedAt!,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map((a) => ({
      subject: a.subject,
      title: a.title,
      score: a.score,
      date: formatRelativeDate(a.date),
    }));

  const totalAttempts = (progress?.papersAttempted ?? 0) + (progress?.quizzesCompleted ?? 0);

  const insights: InsightMessage[] = [];

  if (progress && progress.averageScore > 0) {
    insights.push({
      category: "performance",
      message: `Your average score is ${Math.round(progress.averageScore)}%. Keep up the good work!`,
    });
  }

  if (progress && progress.studyStreak >= 3) {
    insights.push({
      category: "time",
      message: `You're on a ${progress.studyStreak}-day study streak! Consistent practice yields the best results.`,
    });
  } else if (!progress || progress.studyStreak === 0) {
    insights.push({
      category: "time",
      message: "You haven't been practicing daily. Let's start a new study streak today!",
    });
  }

  if (combined.length > 0) {
    const recent = combined[0];
    if (recent.score >= 80) {
      insights.push({
        category: "topic",
        message: `Outstanding score of ${recent.score}% in "${recent.title}". You've really mastered this!`,
      });
    } else if (recent.score < 50) {
      insights.push({
        category: "topic",
        message: `Your score of ${recent.score}% in "${recent.title}" suggests you could use some review. Try reading the associated study notes.`,
      });
    }
  }

  insights.push({
    category: "notes",
    message: "Students who read all study notes before testing score 15% higher on average!",
  });

  const recommendations: PracticeRecommendation[] = [];

  const topicScores = new Map<string, { subject: string, scores: number[] }>();
  for (const a of quizAttempts) {
    const key = a.quiz.topic;
    if (!topicScores.has(key)) topicScores.set(key, { subject: a.quiz.subject.name, scores: [] });
    topicScores.get(key)!.scores.push(a.score ?? 0);
  }

  for (const [topic, data] of Array.from(topicScores.entries())) {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    if (avgScore < 75) {
      recommendations.push({
        subject: data.subject,
        topic,
        steps: [`Review notes for ${topic}`, "Try a topic quiz to test your knowledge", "Review the answers carefully"],
        estimatedMinutes: 20,
        expectedImprovement: `+${Math.round(85 - avgScore)}% accuracy`,
        priority: avgScore < 50 ? "high" : "medium"
      });
    }
  }

  if (recommendations.length === 0 && paperAttempts.length > 0) {
    const lowestPaper = [...paperAttempts].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
    if ((lowestPaper.score ?? 0) < 80) {
      recommendations.push({
        subject: lowestPaper.paper.subject.name,
        topic: "General Revision",
        steps: [`Review recent past papers for ${lowestPaper.paper.subject.name}`, "Identify the specific questions you struggled with", "Read related short notes"],
        estimatedMinutes: 30,
        expectedImprovement: "Better overall score",
        priority: "medium"
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      subject: "Any Subject",
      topic: "Diagnostic Test",
      steps: ["Pick a subject you want to improve", "Take a 15-minute diagnostic quiz", "Come back here for a personalized plan!"],
      estimatedMinutes: 15,
      expectedImprovement: "Establish baseline",
      priority: "low"
    });
  }

  recommendations.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return p[b.priority] - p[a.priority];
  });

  return {
    stats: {
      subjectsCount: subjectSet.size,
      averageScore: Math.round(progress?.averageScore ?? 0),
      totalAttempts,
      studyStreak: progress?.studyStreak ?? 0,
    },
    recentAttempts: combined,
    insights,
    recommendations: recommendations.slice(0, 3),
  };
}

// ─── 2. Student Progress ─────────────────────────────────────────────────────

export async function getStudentProgressData(): Promise<StudentProgressData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [progress, paperAttempts, quizAttempts, totalStudents, leaderboard, notes] =
    await Promise.all([
      prisma.studentProgress.findUnique({ where: { studentId: user.id } }),
      prisma.paperAttempt.findMany({
        where: { studentId: user.id, submittedAt: { not: null } },
        include: { paper: { include: { subject: true } } },
        orderBy: { submittedAt: "asc" },
      }),
      prisma.quizAttempt.findMany({
        where: { studentId: user.id, submittedAt: { not: null } },
        include: { quiz: { include: { subject: true } } },
        orderBy: { submittedAt: "asc" },
      }),
      prisma.studentProgress.count(),
      prisma.studentProgress.findMany({
        orderBy: { averageScore: "desc" },
        select: { studentId: true },
      }),
      prisma.note.findMany({
        where: { status: "APPROVED" },
        include: { subject: true },
      }),
    ]);

  // ── Overview stats ──
  const papersDone = paperAttempts.length + quizAttempts.length;
  const papersWeekly =
    paperAttempts.filter((a) => a.submittedAt! >= sevenDaysAgo).length +
    quizAttempts.filter((a) => a.submittedAt! >= sevenDaysAgo).length;

  const allScores = [
    ...paperAttempts.map((a) => a.score ?? 0),
    ...quizAttempts.map((a) => a.score ?? 0),
  ];
  const recentScores = allScores.slice(-5);
  const previousScores = allScores.slice(-10, -5);
  const scoreTrend =
    recentScores.length > 0 && previousScores.length > 0
      ? Math.round((avg(recentScores) - avg(previousScores)) * 10) / 10
      : 0;

  const rankIndex = leaderboard.findIndex((l) => l.studentId === user.id);
  const rank = rankIndex === -1 ? totalStudents : rankIndex + 1;
  const percentile =
    totalStudents > 0 ? Math.round(((totalStudents - rank) / totalStudents) * 100) : 0;

  // ── Score history (last 12 weeks) ──
  const weekMap = new Map<string, { scores: number[]; bySubject: Record<string, number[]> }>();
  const allAttempts = [
    ...paperAttempts.map((a) => ({
      date: a.submittedAt!,
      score: a.score ?? 0,
      subject: a.paper.subject.name,
    })),
    ...quizAttempts.map((a) => ({
      date: a.submittedAt!,
      score: a.score ?? 0,
      subject: a.quiz.subject.name,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const a of allAttempts) {
    const week = getWeekLabel(a.date);
    if (!weekMap.has(week)) weekMap.set(week, { scores: [], bySubject: {} });
    const entry = weekMap.get(week)!;
    entry.scores.push(a.score);
    if (!entry.bySubject[a.subject]) entry.bySubject[a.subject] = [];
    entry.bySubject[a.subject].push(a.score);
  }

  const allSubjects = [...new Set(allAttempts.map((a) => a.subject))];
  const scoreHistory: PerformanceDataPoint[] = Array.from(weekMap.entries())
    .slice(-12)
    .map(([date, data]) => {
      const point: PerformanceDataPoint = {
        date,
        overall: avgInt(data.scores),
      };
      for (const subj of allSubjects) {
        const key = subj.toLowerCase().replace(/\s+/g, "_");
        point[key] = data.bySubject[subj] ? avgInt(data.bySubject[subj]) : 0;
      }
      return point;
    });

  const chartSubjects = allSubjects.map((s) => s.toLowerCase().replace(/\s+/g, "_"));

  // ── Heatmap (84 days) ──
  const heatmapMap = new Map<string, number>();
  for (const a of paperAttempts) {
    const date = a.submittedAt!.toISOString().slice(0, 10);
    heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + Math.round((a.timeTaken ?? 1800) / 60));
  }
  for (const a of quizAttempts) {
    const date = a.submittedAt!.toISOString().slice(0, 10);
    heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + 20);
  }
  const heatmapData = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (83 - i));
    const date = d.toISOString().slice(0, 10);
    return { date, minutes: heatmapMap.get(date) ?? 0 };
  });

  // ── Subject scores ──
  const mySubjectMap = new Map<string, number[]>();
  for (const a of allAttempts) {
    if (!mySubjectMap.has(a.subject)) mySubjectMap.set(a.subject, []);
    mySubjectMap.get(a.subject)!.push(a.score);
  }
  // Class avg: all completed paper attempts for each subject
  const classAttempts = await prisma.paperAttempt.findMany({
    where: { submittedAt: { not: null }, score: { not: null } },
    select: { score: true, paper: { select: { subject: { select: { name: true } } } } },
  });
  const classSubjectMap = new Map<string, number[]>();
  for (const a of classAttempts) {
    const s = a.paper.subject.name;
    if (!classSubjectMap.has(s)) classSubjectMap.set(s, []);
    classSubjectMap.get(s)!.push(a.score!);
  }

  const subjectScores = Array.from(mySubjectMap.entries()).map(([subject, scores]) => ({
    subject,
    yourScore: avgInt(scores),
    classAvg: avgInt(classSubjectMap.get(subject) ?? []),
    papersAttempted: scores.length,
  }));

  // ── Topic mastery (from quiz attempts) ──
  const topicMap = new Map<
    string,
    { scores: number[]; subject: string; lastDate: Date }
  >();
  for (const a of quizAttempts) {
    const key = `${a.quiz.topic}||${a.quiz.subject.name}`;
    if (!topicMap.has(key))
      topicMap.set(key, { scores: [], subject: a.quiz.subject.name, lastDate: a.submittedAt! });
    const entry = topicMap.get(key)!;
    entry.scores.push(a.score ?? 0);
    if (a.submittedAt! > entry.lastDate) entry.lastDate = a.submittedAt!;
  }
  const topicMastery = Array.from(topicMap.entries()).map(([key, data]) => {
    const topic = key.split("||")[0];
    const accuracy = avgInt(data.scores);
    return {
      topic,
      subject: data.subject,
      accuracy,
      questionsAttempted: data.scores.length * 10, // approximate
      status: topicStatus(accuracy),
    };
  });

  // ── Question type stats (from paper attempt results JSON) ──
  const qtMap: Record<string, { attempted: number; correct: number }> = {};
  const TYPE_COLORS: Record<string, string> = {
    MCQ: "#7c3aed",
    SHORT: "#6366f1",
    TRUE_FALSE: "#a78bfa",
    FILL_BLANK: "#2563eb",
    MATCH_COLUMN: "#10b981",
    FILL_BLANK_OPTIONS: "#f59e0b",
  };
  for (const a of paperAttempts) {
    const results = a.results as {
      questionResults?: { questionType: string; isCorrect: boolean; isPartial: boolean }[];
    } | null;
    if (results?.questionResults) {
      for (const qr of results.questionResults) {
        const t = qr.questionType ?? "MCQ";
        if (!qtMap[t]) qtMap[t] = { attempted: 0, correct: 0 };
        qtMap[t].attempted++;
        if (qr.isCorrect || qr.isPartial) qtMap[t].correct++;
      }
    }
  }
  const DISPLAY_NAMES: Record<string, string> = {
    MCQ: "MCQ",
    SHORT: "Structured",
    TRUE_FALSE: "True/False",
    FILL_BLANK: "Fill in Blanks",
    MATCH_COLUMN: "Match Columns",
    FILL_BLANK_OPTIONS: "Fill (Options)",
  };
  const questionTypeStats = Object.entries(qtMap).map(([type, data]) => ({
    type: DISPLAY_NAMES[type] ?? type,
    attempted: data.attempted,
    accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
    color: TYPE_COLORS[type] ?? "#7c3aed",
  }));

  // ── Weak areas (topics with accuracy < 65%) ──
  const weakAreas = topicMastery
    .filter((t) => t.accuracy < 65)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)
    .map((t) => {
      const entry = topicMap.get(`${t.topic}||${t.subject}`);
      const lastDate = entry?.lastDate ?? new Date(0);
      return {
        topic: t.topic,
        subject: t.subject,
        accuracy: t.accuracy,
        target: 75,
        gap: 75 - t.accuracy,
        daysSincePracticed: daysBetween(lastDate, now),
      };
    });

  // ── Comparative data (your score vs class avg + percentile per subject) ──
  const comparativeData = subjectScores.map((s) => {
    const classScores = classSubjectMap.get(s.subject) ?? [];
    const below = classScores.filter((c) => c <= s.yourScore).length;
    const pct = classScores.length > 0 ? Math.round((below / classScores.length) * 100) : 0;
    return {
      subject: s.subject,
      yourScore: s.yourScore,
      classAvg: s.classAvg,
      percentileRank: pct,
    };
  });

  // ── Time analytics (group by hour of day) ──
  const hourMap = new Map<number, number[]>();
  for (const a of allAttempts) {
    const h = a.date.getHours();
    if (!hourMap.has(h)) hourMap.set(h, []);
    hourMap.get(h)!.push(a.score);
  }
  const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const HOUR_LABELS: Record<number, string> = {
    6: "6AM", 7: "7AM", 8: "8AM", 9: "9AM", 10: "10AM", 11: "11AM",
    12: "12PM", 13: "1PM", 14: "2PM", 15: "3PM", 16: "4PM", 17: "5PM",
    18: "6PM", 19: "7PM", 20: "8PM", 21: "9PM",
  };
  const timePerformance = HOURS.map((h) => ({
    hour: HOUR_LABELS[h],
    avgScore: hourMap.has(h) ? avgInt(hourMap.get(h)!) : 0,
  })).filter((h) => h.avgScore > 0);

  // ── Notes engagement (available notes per topic) ──
  const noteTopicMap = new Map<string, { count: number; subject: string }>();
  for (const n of notes) {
    const key = `${n.topic}||${n.subject.name}`;
    if (!noteTopicMap.has(key)) noteTopicMap.set(key, { count: 0, subject: n.subject.name });
    noteTopicMap.get(key)!.count++;
  }
  // Cross-reference with quiz attempts to estimate engagement
  const attemptedTopics = new Set(quizAttempts.map((a) => `${a.quiz.topic}||${a.quiz.subject.name}`));
  const highScoreTopics = new Set(
    quizAttempts.filter((a) => (a.score ?? 0) >= 75).map((a) => `${a.quiz.topic}||${a.quiz.subject.name}`)
  );
  const notesEngagement = Array.from(noteTopicMap.entries()).map(([key, data]) => {
    const topic = key.split("||")[0];
    const hasAttempted = attemptedTopics.has(key);
    const hasHighScore = highScoreTopics.has(key);
    const status: "complete" | "in-progress" | "not-started" = hasHighScore
      ? "complete"
      : hasAttempted
        ? "in-progress"
        : "not-started";
    return {
      topic,
      subject: data.subject,
      notesRead: hasHighScore ? data.count : hasAttempted ? Math.ceil(data.count / 2) : 0,
      totalNotes: data.count,
      timeSpentMin: hasHighScore ? data.count * 12 : hasAttempted ? data.count * 6 : 0,
      completionPct: hasHighScore ? 100 : hasAttempted ? 50 : 0,
      status,
    };
  });

  // ── Risk alerts ──
  const riskAlerts: StudentProgressData["riskAlerts"] = [];

  // Critical: topics with accuracy < 50%
  for (const w of weakAreas.filter((x) => x.accuracy < 50).slice(0, 2)) {
    riskAlerts.push({
      level: "critical",
      title: `${w.topic} — ${w.subject}`,
      reason: `Only ${w.accuracy}% accuracy. ${w.daysSincePracticed} days since last practice. ${w.gap}% below target.`,
      action: "Practice Now",
    });
  }
  // Warning: topics 50–64% accuracy
  for (const w of weakAreas.filter((x) => x.accuracy >= 50 && x.accuracy < 65).slice(0, 2)) {
    riskAlerts.push({
      level: "warning",
      title: `${w.topic} — ${w.subject}`,
      reason: `${w.accuracy}% accuracy — ${w.gap}% below target. Consider reviewing notes.`,
      action: "Review Topics",
    });
  }
  // Inactive warning
  if (papersWeekly === 0 && papersDone > 0) {
    riskAlerts.push({
      level: "warning",
      title: "No activity this week",
      reason: "You haven't completed any quizzes or papers in the last 7 days.",
      action: "Start a Quiz",
    });
  }
  // On-track: topics >= 80%
  for (const t of topicMastery.filter((x) => x.accuracy >= 80).slice(0, 2)) {
    riskAlerts.push({
      level: "on-track",
      title: `${t.topic} — ${t.subject}`,
      reason: `${t.accuracy}% accuracy. Consistently performing above target.`,
      action: "Keep Going",
    });
  }
  // Score trend positive
  if (scoreTrend > 2) {
    riskAlerts.push({
      level: "on-track",
      title: "Score improving",
      reason: `Your average score has risen by ${scoreTrend}% in your recent attempts.`,
      action: "Maintain",
    });
  }

  return {
    overviewStats: {
      papersDone,
      papersWeekly,
      averageScore: Math.round(progress?.averageScore ?? avg(allScores)),
      scoreTrend,
      studyStreak: progress?.studyStreak ?? 0,
      bestStreak: progress?.studyStreak ?? 0,
      rank,
      totalStudents,
      percentile,
    },
    scoreHistory,
    chartSubjects,
    heatmapData,
    subjectScores,
    topicMastery,
    questionTypeStats,
    weakAreas,
    comparativeData,
    timePerformance,
    notesEngagement,
    riskAlerts,
  };
}

// ─── 3. Teacher Dashboard ────────────────────────────────────────────────────

export async function getTeacherDashboardData(): Promise<TeacherDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Get linked students
  const links = await prisma.teacherStudentLink.findMany({
    where: { teacherId: user.id },
    include: {
      student: {
        include: {
          studentDetails: true,
          progress: true,
          paperAttempts: {
            where: { submittedAt: { not: null } },
            orderBy: { submittedAt: "desc" },
            take: 5,
            include: { paper: { include: { subject: true } } },
          },
          quizAttempts: {
            where: { submittedAt: { not: null } },
            orderBy: { submittedAt: "desc" },
            take: 3,
            include: { quiz: { include: { subject: true } } },
          },
        },
      },
    },
  });

  // Teacher's papers & quizzes for pending reviews & uploads
  const [teacherPapers, teacherQuizzes] = await Promise.all([
    prisma.paper.findMany({
      where: { createdById: user.id },
      select: { id: true, createdAt: true },
    }),
    prisma.quiz.findMany({
      where: { createdById: user.id },
      select: { id: true, createdAt: true },
    }),
  ]);

  const paperIds = teacherPapers.map((p) => p.id);
  const recentUploads =
    teacherPapers.filter((p) => p.createdAt >= sevenDaysAgo).length +
    teacherQuizzes.filter((q) => q.createdAt >= sevenDaysAgo).length;

  // Pending reviews: paper attempts with non-empty flagged array
  const submittedAttempts = paperIds.length > 0
    ? await prisma.paperAttempt.findMany({
      where: { paperId: { in: paperIds }, submittedAt: { not: null } },
      select: { flagged: true },
    })
    : [];
  const pendingReviews = submittedAttempts.filter((a) => {
    const f = a.flagged as string[] | null;
    return Array.isArray(f) && f.length > 0;
  }).length;

  // Today's submissions
  const todaySubmissions = paperIds.length > 0
    ? await prisma.paperAttempt.count({
      where: {
        paperId: { in: paperIds },
        submittedAt: { gte: todayStart },
      },
    })
    : 0;

  const todayUploads =
    teacherPapers.filter((p) => p.createdAt >= todayStart).length +
    teacherQuizzes.filter((q) => q.createdAt >= todayStart).length;

  // Build student rows
  const studentRows = links.map((link) => {
    const s = link.student;
    const allAttempts = [
      ...s.paperAttempts.map((a) => ({
        score: a.score ?? 0,
        date: a.submittedAt!,
        subject: a.paper.subject.name,
      })),
      ...s.quizAttempts.map((a) => ({
        score: a.score ?? 0,
        date: a.submittedAt!,
        subject: a.quiz.subject.name,
      })),
    ];
    const subjects = [...new Set(allAttempts.map((a) => a.subject))];
    const avgScore = s.progress
      ? Math.round(s.progress.averageScore)
      : allAttempts.length > 0
        ? avgInt(allAttempts.map((a) => a.score))
        : 0;
    const lastAttemptDate = allAttempts.length > 0
      ? allAttempts.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
      : null;
    const status = computeStudentStatus(avgScore, lastAttemptDate);
    return {
      name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student",
      grade: s.studentDetails?.grade ?? "—",
      subjects: subjects.length > 0 ? subjects : ["—"],
      avgScore,
      status,
      lastActive: lastAttemptDate ? formatRelativeDate(lastAttemptDate) : "Never",
    };
  });

  const classAverage =
    studentRows.length > 0 ? avgInt(studentRows.map((s) => s.avgScore)) : 0;

  return {
    stats: {
      totalStudents: links.length,
      classAverage,
      pendingReviews,
      recentUploads,
    },
    students: studentRows,
    todayStats: {
      submissions: todaySubmissions,
      uploads: todayUploads,
    },
  };
}

// ─── 4. Teacher Analytics ────────────────────────────────────────────────────

export async function getTeacherAnalyticsData(): Promise<TeacherAnalyticsPayload | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all linked students with full data
  const links = await prisma.teacherStudentLink.findMany({
    where: { teacherId: user.id },
    include: {
      student: {
        include: {
          studentDetails: true,
          progress: true,
          paperAttempts: {
            where: { submittedAt: { not: null } },
            orderBy: { submittedAt: "desc" },
            take: 30,
            include: { paper: { include: { subject: true } } },
          },
          quizAttempts: {
            where: { submittedAt: { not: null } },
            orderBy: { submittedAt: "desc" },
            take: 20,
            include: { quiz: { include: { subject: true } } },
          },
          studentParents: {
            take: 1,
            include: { parent: { select: { email: true } } },
          },
        },
      },
    },
  });

  if (links.length === 0) {
    return {
      students: [],
      analytics: {
        overviewStats: {
          totalStudents: 0,
          activeThisWeek: 0,
          classAverage: 0,
          papersCompletedThisWeek: 0,
          pendingReviews: 0,
          studentsAtRisk: 0,
        },
        scoreDistribution: [],
        subjectPerformance: [],
        topPerformers: [],
        weeklyActivity: [],
        topicDifficulty: [],
        studyTimeStats: { myClassAvg: 0, platformAvg: 0, highEngagement: 0, mediumEngagement: 0, lowEngagement: 0 },
      },
    };
  }

  // Pending reviews
  const teacherPaperIds = (
    await prisma.paper.findMany({
      where: { createdById: user.id },
      select: { id: true },
    })
  ).map((p) => p.id);

  const allSubmittedAttempts = teacherPaperIds.length > 0
    ? await prisma.paperAttempt.findMany({
      where: { paperId: { in: teacherPaperIds }, submittedAt: { not: null } },
      select: { flagged: true },
    })
    : [];
  const pendingReviews = allSubmittedAttempts.filter((a) => {
    const f = a.flagged as string[] | null;
    return Array.isArray(f) && f.length > 0;
  }).length;

  // Build per-student data
  type StudentData = {
    id: number;
    uuid: string;
    name: string;
    grade: "Grade 9" | "Grade 10" | "Grade 11";
    subjects: string[];
    avgScore: number;
    trend: "up" | "down" | "stable";
    papersCompleted: number;
    lastActiveDate: Date | null;
    lastActive: string;
    status: "Active" | "At Risk" | "Inactive";
    parentEmail: string;
    enrollmentDate: string;
    allScores: number[];
    allAttempts: { score: number; date: Date; subject: string; title: string; type: "paper" | "quiz" }[];
    quizTopics: { topic: string; subject: string; score: number; date: Date }[];
    studyMinutes: number;
  };

  const studentsData: StudentData[] = links.map((link, idx) => {
    const s = link.student;
    const paperAttempts = s.paperAttempts.map((a) => ({
      score: Math.round(a.score ?? 0),
      date: a.submittedAt!,
      subject: a.paper.subject.name,
      title: a.paper.title,
      type: "paper" as const,
      timeTaken: a.timeTaken ?? 0,
    }));
    const quizAttempts = s.quizAttempts.map((a) => ({
      score: Math.round(a.score ?? 0),
      date: a.submittedAt!,
      subject: a.quiz.subject.name,
      title: a.quiz.title,
      type: "quiz" as const,
      timeTaken: 0,
      topic: a.quiz.topic,
    }));

    const allAttempts = [...paperAttempts, ...quizAttempts].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    const allScores = allAttempts.map((a) => a.score);
    const subjects = [...new Set(allAttempts.map((a) => a.subject))];
    const avgScore = s.progress
      ? Math.round(s.progress.averageScore)
      : allScores.length > 0
        ? avgInt(allScores)
        : 0;
    const lastActiveDate = allAttempts.length > 0 ? allAttempts[0].date : null;
    const status = computeStudentStatus(avgScore, lastActiveDate);
    const trend = computeTrend(
      [...paperAttempts, ...quizAttempts]
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((a) => a.score)
    );
    const studyMinutes = paperAttempts.reduce((sum, a) => sum + Math.round(a.timeTaken / 60), 0) +
      quizAttempts.length * 20;
    const gradeRaw = s.studentDetails?.grade ?? "Grade 10";
    const grade = (["Grade 9", "Grade 10", "Grade 11"].includes(gradeRaw)
      ? gradeRaw
      : "Grade 10") as "Grade 9" | "Grade 10" | "Grade 11";

    return {
      id: idx + 1,
      uuid: s.id,
      name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Student",
      grade,
      subjects: subjects.length > 0 ? subjects : ["—"],
      avgScore,
      trend,
      papersCompleted: allAttempts.length,
      lastActiveDate,
      lastActive: lastActiveDate ? formatRelativeDate(lastActiveDate) : "Never",
      status,
      parentEmail: s.studentParents[0]?.parent.email ?? "—",
      enrollmentDate: s.createdAt
        ? s.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "—",
      allScores,
      allAttempts,
      quizTopics: quizAttempts.map((a) => ({
        topic: a.topic,
        subject: a.subject,
        score: a.score,
        date: a.date,
      })),
      studyMinutes,
    };
  });

  // Sort by avgScore for ranking
  const sorted = [...studentsData].sort((a, b) => b.avgScore - a.avgScore);
  const rankMap = new Map(sorted.map((s, i) => [s.uuid, i + 1]));

  // Build Student[] for teacher-mock-data.ts interface
  const students: import("@/lib/teacher-mock-data").Student[] = studentsData.map((sd) => {
    const rank = rankMap.get(sd.uuid) ?? sd.id;

    // Subject scores
    const subjectScoreMap = new Map<string, number[]>();
    for (const a of sd.allAttempts) {
      if (!subjectScoreMap.has(a.subject)) subjectScoreMap.set(a.subject, []);
      subjectScoreMap.get(a.subject)!.push(a.score);
    }
    const subjectScores: import("@/lib/teacher-mock-data").SubjectScore[] = Array.from(
      subjectScoreMap.entries()
    ).map(([subject, scores]) => ({ subject, score: avgInt(scores) }));

    const strongSubject =
      subjectScores.length > 0
        ? subjectScores.reduce((best, s) => (s.score > best.score ? s : best)).subject
        : "—";

    // Score history (by month)
    const monthMap = new Map<string, number[]>();
    for (const a of sd.allAttempts) {
      const m = getMonthLabel(a.date);
      if (!monthMap.has(m)) monthMap.set(m, []);
      monthMap.get(m)!.push(a.score);
    }
    const scoreHistory: import("@/lib/teacher-mock-data").ScoreHistoryPoint[] = Array.from(
      monthMap.entries()
    )
      .slice(-3)
      .map(([month, scores]) => ({ month, score: avgInt(scores) }));

    // Recent activity
    const recentActivity: import("@/lib/teacher-mock-data").StudentActivityItem[] =
      sd.allAttempts.slice(0, 5).map((a, i) => ({
        id: String(i + 1),
        type: a.type,
        title: a.title,
        score: a.score,
        timestamp: formatRelativeDate(a.date),
        subject: a.subject,
      }));

    // Topic performance (from quiz attempts)
    const topicPerf = new Map<string, { scores: number[]; subject: string }>();
    for (const qt of sd.quizTopics) {
      const key = `${qt.topic}||${qt.subject}`;
      if (!topicPerf.has(key)) topicPerf.set(key, { scores: [], subject: qt.subject });
      topicPerf.get(key)!.scores.push(qt.score);
    }
    const topicPerformance: import("@/lib/teacher-mock-data").TopicPerformance[] = Array.from(
      topicPerf.entries()
    ).map(([key, data]) => {
      const accuracy = avgInt(data.scores);
      return {
        topic: key.split("||")[0],
        subject: data.subject,
        accuracy,
        status: topicStrength(accuracy),
      };
    });

    // Risk signals
    const riskSignals: import("@/lib/teacher-mock-data").RiskSignal[] = [];
    if (sd.avgScore < 50) {
      riskSignals.push({
        label: "Low Average Score",
        severity: "high",
        detail: `Average score is ${sd.avgScore}% — below pass threshold`,
      });
    }
    if (sd.lastActiveDate && daysBetween(sd.lastActiveDate, new Date()) > 10) {
      const days = daysBetween(sd.lastActiveDate!, new Date());
      riskSignals.push({
        label: `Inactive ${days}+ Days`,
        severity: days > 14 ? "high" : "medium",
        detail: `No activity recorded in the last ${days} days`,
      });
    }
    if (sd.allScores.length >= 4) {
      const trend = computeTrend(sd.allScores);
      if (trend === "down") {
        const drop = sd.allScores[0] - sd.allScores[sd.allScores.length - 1];
        riskSignals.push({
          label: "Score Declining",
          severity: drop > 10 ? "high" : "medium",
          detail: `Score dropped approximately ${Math.abs(Math.round(drop))}% over recent attempts`,
        });
      }
    }

    return {
      id: sd.id,
      uuid: sd.uuid,
      name: sd.name,
      grade: sd.grade,
      subjects: sd.subjects,
      avgScore: sd.avgScore,
      trend: sd.trend,
      papersCompleted: sd.papersCompleted,
      lastActive: sd.lastActive,
      status: sd.status,
      parentEmail: sd.parentEmail,
      enrollmentDate: sd.enrollmentDate,
      subjectScores,
      scoreHistory,
      recentActivity,
      topicPerformance,
      riskSignals,
      strongSubject,
      rank,
    };
  });

  // ── Overview stats ──
  const activeThisWeek = studentsData.filter(
    (s) => s.lastActiveDate && s.lastActiveDate >= sevenDaysAgo
  ).length;
  const classAverage = studentsData.length > 0 ? avgInt(studentsData.map((s) => s.avgScore)) : 0;
  const papersCompletedThisWeek = studentsData.reduce(
    (sum, s) =>
      sum +
      s.allAttempts.filter((a) => a.date >= sevenDaysAgo).length,
    0
  );
  const studentsAtRisk = studentsData.filter((s) => s.status !== "Active").length;

  // ── Score distribution ──
  const buckets = [
    { range: "0–50%", min: 0, max: 50 },
    { range: "50–60%", min: 50, max: 60 },
    { range: "60–70%", min: 60, max: 70 },
    { range: "70–80%", min: 70, max: 80 },
    { range: "80–90%", min: 80, max: 90 },
    { range: "90–100%", min: 90, max: 101 },
  ];
  const scoreDistribution: import("@/lib/teacher-mock-data").ScoreDistributionBucket[] =
    buckets.map((b) => ({
      range: b.range,
      count: studentsData.filter((s) => s.avgScore >= b.min && s.avgScore < b.max).length,
    }));

  // ── Subject performance ──
  const classSubjectMap = new Map<string, number[]>();
  for (const sd of studentsData) {
    for (const a of sd.allAttempts) {
      if (!classSubjectMap.has(a.subject)) classSubjectMap.set(a.subject, []);
      classSubjectMap.get(a.subject)!.push(a.score);
    }
  }
  const subjectPerformance: import("@/lib/teacher-mock-data").SubjectPerformanceSummary[] =
    Array.from(classSubjectMap.entries()).map(([subject, scores]) => ({
      subject,
      classAvg: avgInt(scores),
      studentsCount: new Set(
        studentsData
          .filter((s) => s.allAttempts.some((a) => a.subject === subject))
          .map((s) => s.id)
      ).size,
    }));

  // ── Top performers ──
  const topPerformers: import("@/lib/teacher-mock-data").TopPerformer[] = sorted
    .slice(0, 10)
    .map((s, i) => {
      const subjectScoreMap = new Map<string, number[]>();
      for (const a of s.allAttempts) {
        if (!subjectScoreMap.has(a.subject)) subjectScoreMap.set(a.subject, []);
        subjectScoreMap.get(a.subject)!.push(a.score);
      }
      const strongSubjectEntry =
        subjectScoreMap.size > 0
          ? Array.from(subjectScoreMap.entries()).reduce((best, [subj, scores]) => {
            const a = avgInt(scores);
            return a > best.score ? { subject: subj, score: a } : best;
          }, { subject: "—", score: 0 })
          : { subject: "—", score: 0 };
      return {
        rank: i + 1,
        studentId: s.id,
        name: s.name,
        avgScore: s.avgScore,
        papersCompleted: s.papersCompleted,
        strongSubject: strongSubjectEntry.subject,
      };
    });

  // ── Weekly activity (last 4 weeks) ──
  const weeklyActivity: import("@/lib/teacher-mock-data").WeeklyActivityPoint[] = Array.from(
    { length: 4 },
    (_, i) => {
      const weekStart = new Date(Date.now() - (3 - i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      const label = `Week ${i + 1}`;
      let totalMinutes = 0;
      let papersCompleted = 0;
      let activeStudents = 0;
      for (const sd of studentsData) {
        const weekAttempts = sd.allAttempts.filter(
          (a) => a.date >= weekStart && a.date < weekEnd
        );
        if (weekAttempts.length > 0) activeStudents++;
        papersCompleted += weekAttempts.length;
        totalMinutes += sd.studyMinutes / 4; // rough weekly estimate
      }
      return {
        week: label,
        studyHours: Math.round(totalMinutes / 60),
        papersCompleted,
        avgEngagement:
          studentsData.length > 0
            ? Math.round((activeStudents / studentsData.length) * 100)
            : 0,
      };
    }
  );

  // ── Topic difficulty (from quiz attempts across all students) ──
  const topicDiffMap = new Map<
    string,
    { subject: string; scores: number[]; studentIds: Set<number> }
  >();
  for (const sd of studentsData) {
    for (const qt of sd.quizTopics) {
      const key = `${qt.topic}||${qt.subject}`;
      if (!topicDiffMap.has(key))
        topicDiffMap.set(key, { subject: qt.subject, scores: [], studentIds: new Set() });
      const entry = topicDiffMap.get(key)!;
      entry.scores.push(qt.score);
      entry.studentIds.add(sd.id);
    }
  }
  const topicDifficulty: import("@/lib/teacher-mock-data").TopicDifficultyRow[] = Array.from(
    topicDiffMap.entries()
  )
    .map(([key, data]) => {
      const topic = key.split("||")[0];
      const accInt = avgInt(data.scores);
      const strugglingIds = studentsData
        .filter((sd) =>
          sd.quizTopics.some((qt) => qt.topic === topic && qt.score < 60)
        )
        .map((sd) => sd.id);
      return {
        topic,
        subject: data.subject,
        avgAccuracy: accInt,
        studentsAttempted: data.studentIds.size,
        studentsStruggling: strugglingIds.length,
        status: (accInt >= 80 ? "Easy" : accInt >= 65 ? "Medium" : "Hard") as
          | "Easy"
          | "Medium"
          | "Hard",
        strugglingStudentIds: strugglingIds,
      };
    })
    .sort((a, b) => a.avgAccuracy - b.avgAccuracy)
    .slice(0, 10);

  // ── Study time stats ──
  const studyHoursPerStudent = studentsData.map((s) => s.studyMinutes / 60);
  const myClassAvg =
    studyHoursPerStudent.length > 0
      ? Math.round((avg(studyHoursPerStudent) / 4) * 10) / 10 // weekly avg
      : 0;
  const HIGH_CUTOFF = 5;
  const LOW_CUTOFF = 2;
  const highEngagement = studyHoursPerStudent.filter((h) => h / 4 >= HIGH_CUTOFF).length;
  const lowEngagement = studyHoursPerStudent.filter((h) => h / 4 < LOW_CUTOFF).length;
  const mediumEngagement = studentsData.length - highEngagement - lowEngagement;
  const studyTimeStats: import("@/lib/teacher-mock-data").StudyTimeStats = {
    myClassAvg,
    platformAvg: 3.8, // platform-wide constant
    highEngagement,
    mediumEngagement,
    lowEngagement,
  };

  return {
    students,
    analytics: {
      overviewStats: {
        totalStudents: studentsData.length,
        activeThisWeek,
        classAverage,
        papersCompletedThisWeek,
        pendingReviews,
        studentsAtRisk,
      },
      scoreDistribution,
      subjectPerformance,
      topPerformers,
      weeklyActivity,
      topicDifficulty,
      studyTimeStats,
    },
  };
}

// ─── 5. Leaderboard ──────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  totalPoints: number;
  averageScore: number;
  studyStreak: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  currentUserPoints: number;
  firstPlacePoints: number;
  currentUserName: string;
  totalStudents: number;
}

export async function getLeaderboardData(): Promise<LeaderboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const allProgress = await prisma.studentProgress.findMany({
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { totalPoints: "desc" },
  });

  if (allProgress.length === 0) {
    return {
      entries: [],
      currentUserRank: 0,
      currentUserPoints: 0,
      firstPlacePoints: 0,
      currentUserName: "",
      totalStudents: 0,
    };
  }

  const entries: LeaderboardEntry[] = allProgress.map((p, idx) => ({
    rank: idx + 1,
    studentId: p.studentId,
    name:
      `${p.student.firstName ?? ""} ${p.student.lastName ?? ""}`.trim() ||
      "Student",
    totalPoints: p.totalPoints,
    averageScore: Math.round(p.averageScore),
    studyStreak: p.studyStreak,
    isCurrentUser: p.studentId === user.id,
  }));

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank ?? entries.length + 1;
  const currentUserPoints = currentUserEntry?.totalPoints ?? 0;
  const currentUserName = currentUserEntry?.name ?? "";
  const firstPlacePoints = entries[0]?.totalPoints ?? 0;

  return {
    entries,
    currentUserRank,
    currentUserPoints,
    firstPlacePoints,
    currentUserName,
    totalStudents: allProgress.length,
  };
}