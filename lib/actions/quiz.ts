"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { QuizType, QuestionType } from "@/lib/generated/prisma/enums";

interface CreateQuizInput {
  title: string;
  subject: string;
  topic: string;
  type: QuizType;
  duration: number;
  visibility?: string;
  questions: {
    text: string;
    type: QuestionType;
    points: number;
    options: string[];
    correctAnswer: string;
    imageUrl?: string;
  }[];
}

export async function createQuiz(input: CreateQuizInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Teacher subject restriction
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role === "TEACHER") {
    const teacherDetails = await prisma.teacherDetails.findUnique({
      where: { id: user.id },
    });
    if (!teacherDetails) throw new Error("Teacher details not found");
    const allowedSubjects = teacherDetails.subject.split(',').map(s => s.trim().toLowerCase());
    if (!allowedSubjects.includes(input.subject.trim().toLowerCase())) {
      throw new Error(`You are not authorized to upload content for "${input.subject}".`);
    }
  }

  // Find subject by name
  const subject = await prisma.subject.findUnique({
    where: { name: input.subject },
  });
  if (!subject) throw new Error(`Subject "${input.subject}" not found`);

  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      topic: input.topic,
      type: input.type,
      duration: input.duration,
      visibility: profile?.role === "ADMIN" ? "PUBLIC" : (input.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY"),
      status: "APPROVED",
      createdById: user.id,
      questions: {
        create: input.questions.map((q, index) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options.filter((o) => o.trim() !== ""),
          correctAnswer: q.correctAnswer,
          order: index,
          imageUrl: q.imageUrl ?? null,
        })),
      },
    },
  });

  return { id: quiz.id };
}

export async function updateQuiz(
  id: string,
  input: {
    title: string;
    topic: string;
    duration: number;
    visibility: string;
    questions: { text: string; type: QuestionType; points: number; options: string[]; correctAnswer: string }[];
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { createdById: true } });
  if (!quiz) throw new Error("Not found");
  if (quiz.createdById !== user.id) throw new Error("Forbidden");

  // Delete old questions and recreate
  await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
  await prisma.quiz.update({
    where: { id },
    data: {
      title: input.title,
      topic: input.topic,
      duration: input.duration,
      visibility: input.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY",
      questions: {
        create: input.questions.map((q, i) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: i,
        })),
      },
    },
  });
  return { ok: true };
}

export async function deleteQuiz(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { role: true } });
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { createdById: true } });
  if (!quiz) throw new Error("Not found");
  if (quiz.createdById !== user.id && profile?.role !== "ADMIN") throw new Error("Forbidden");

  await prisma.quiz.delete({ where: { id } });
  return { ok: true };
}

export async function getQuizzesBySubject(subjectName: string) {
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return { adminContent: [], teacherContent: [] };

  const quizzes = await prisma.quiz.findMany({
    where: {
      subjectId: subject.id,
      status: "APPROVED",
    },
    include: {
      _count: { select: { questions: true } },
      createdBy: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get current user's attempts
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let attempts: { quizId: string; score: number | null }[] = [];
  if (user) {
    attempts = await prisma.quizAttempt.findMany({
      where: { studentId: user.id },
      select: { quizId: true, score: true },
    });
  }

  const attemptMap = new Map(attempts.map((a) => [a.quizId, a.score]));

  const mapQuiz = (q: typeof quizzes[0]) => ({
    id: q.id,
    title: q.title,
    topic: q.topic,
    type: q.type,
    duration: q.duration,
    questionCount: q._count.questions,
    createdBy: `${q.createdBy.firstName ?? ""} ${q.createdBy.lastName ?? ""}`.trim() || "Teacher",
    completed: attemptMap.has(q.id),
    score: attemptMap.get(q.id) ?? null,
  });

  const adminContent = quizzes.filter((q) => q.createdBy.role === "ADMIN").map(mapQuiz);
  const teacherContent = quizzes.filter((q) => q.createdBy.role === "TEACHER").map(mapQuiz);

  return { adminContent, teacherContent };
}

export async function getQuizById(id: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: { select: { name: true } },
    },
  });

  if (!quiz) return null;

  return {
    id: quiz.id,
    title: quiz.title,
    subject: quiz.subject.name,
    topic: quiz.topic,
    duration: quiz.duration,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type === "MCQ" ? ("mc" as const) : ("short" as const),
      points: q.points,
      options: q.options,
      // Don't send correct answer to client during quiz-taking
    })),
  };
}

export async function getQuizDetails(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: { select: { name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } }
    },
  });

  if (!quiz) return null;

  // Check permissions: Owner or Admin
  // (Assuming caller handles redirect if null, or we could throw)
  
  // For now, let's return it. Logic suggests only owner/admin calls this via protected routes.
  // Ideally we double check here.
  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { role: true } });
  
  if (quiz.createdById !== user.id && profile?.role !== "ADMIN") {
      return null;
  }

  return {
    id: quiz.id,
    title: quiz.title,
    subject: quiz.subject.name,
    topic: quiz.topic,
    duration: quiz.duration,
    createdById: quiz.createdById, // to show "You" vs others
    createdBy: `${quiz.createdBy.firstName ?? ""} ${quiz.createdBy.lastName ?? ""}`.trim() || "Teacher",
    createdAt: quiz.createdAt, // Added
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type === "MCQ" ? ("mc" as const) : ("short" as const),
      points: q.points,
      options: q.options,
      correctAnswer: q.correctAnswer, // INCLUDE ANSWER
    })),
  };
}

// ─── Quiz Dashboard Data ──────────────────────────────────────────────────────

export interface QuizDashboardStats {
  quizzesTaken: number;
  avgScore: number;
  timeSpentHours: number;
  timeSpentMins: number;
  timeThisWeekMin: number;
  improvement: number; // percentage point change, recent 5 vs previous 5
  percentileLabel: string;
}

export interface QuizSubjectCard {
  subjectName: string;
  slug: string;
  totalQuizzes: number;
  completedQuizzes: number;
  topicCount: number;
}

export interface RecommendedQuiz {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: number;
  questionCount: number;
  reason: string;
  reasonType: "weak" | "stale" | "new" | "practice_assigned";
}

export interface QuizDashboardData {
  stats: QuizDashboardStats;
  availableSubjects: QuizSubjectCard[];
  comingSoonSubjects: string[];
  recommended: RecommendedQuiz[];
}

// Predefined Sri Lankan school subject list
const ALL_KNOWN_SUBJECTS = [
  "Sinhala", "Mathematics", "Science", "Buddhism", "ICT",
  "Commerce", "PTS", "Art", "Music", "Drama", "Tamil",
  "Islam", "Hinduism", "Agriculture", "Technical Drawing",
];

export async function getQuizDashboardData(): Promise<QuizDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [allAttempts, allQuizzes, totalAttemptors, notifications] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { studentId: user.id, submittedAt: { not: null } },
      include: { quiz: { include: { subject: true } } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.quiz.findMany({
      where: { status: "APPROVED" },
      include: {
        subject: true,
        _count: { select: { questions: true } },
        attempts: {
          where: { studentId: user.id, submittedAt: { not: null } },
          select: { score: true, submittedAt: true },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quizAttempt.groupBy({
      by: ["studentId"],
      where: { submittedAt: { not: null } },
      _count: { studentId: true },
      orderBy: { _count: { studentId: "desc" } },
    }),
    prisma.notification.findMany({
      where: { userId: user.id, type: "practice_assigned", isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // ── Stats ──
  const quizzesTaken = allAttempts.length;
  const scores = allAttempts.map((a) => a.score ?? 0);
  const avgScore = quizzesTaken > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

  const timeSpentMin = allAttempts.reduce((sum, a) => sum + (a.quiz.duration ?? 0), 0);
  const timeSpentHours = Math.floor(timeSpentMin / 60);
  const timeSpentMins = timeSpentMin % 60;
  const timeThisWeekMin = allAttempts
    .filter((a) => a.submittedAt! >= sevenDaysAgo)
    .reduce((sum, a) => sum + (a.quiz.duration ?? 0), 0);

  const sortedByDate = [...allAttempts].sort((a, b) => a.submittedAt!.getTime() - b.submittedAt!.getTime());
  const recentScores = sortedByDate.slice(-5).map((a) => a.score ?? 0);
  const prevScores = sortedByDate.slice(-10, -5).map((a) => a.score ?? 0);
  const improvement =
    recentScores.length > 0 && prevScores.length > 0
      ? Math.round(
          (recentScores.reduce((s, v) => s + v, 0) / recentScores.length -
            prevScores.reduce((s, v) => s + v, 0) / prevScores.length) * 10
        ) / 10
      : 0;

  // Percentile among all students by quiz count
  const myRank = totalAttemptors.findIndex((r) => r.studentId === user.id);
  const percentileLabel =
    totalAttemptors.length > 1 && myRank !== -1
      ? `Top ${Math.max(1, Math.round(((myRank + 1) / totalAttemptors.length) * 100))}% of class`
      : quizzesTaken > 0
      ? "Keep going!"
      : "Start your first quiz";

  // ── Available subjects ──
  const subjectMap = new Map<
    string,
    { totalQuizzes: number; completedQuizzes: number; topics: Set<string> }
  >();
  for (const quiz of allQuizzes) {
    const name = quiz.subject.name;
    if (!subjectMap.has(name)) subjectMap.set(name, { totalQuizzes: 0, completedQuizzes: 0, topics: new Set() });
    const entry = subjectMap.get(name)!;
    entry.totalQuizzes++;
    if (quiz.attempts.length > 0) entry.completedQuizzes++;
    entry.topics.add(quiz.topic);
  }

  const availableSubjects: QuizSubjectCard[] = Array.from(subjectMap.entries()).map(([name, data]) => ({
    subjectName: name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    totalQuizzes: data.totalQuizzes,
    completedQuizzes: data.completedQuizzes,
    topicCount: data.topics.size,
  }));

  const availableSubjectNames = new Set(availableSubjects.map((s) => s.subjectName.toLowerCase()));
  const comingSoonSubjects = ALL_KNOWN_SUBJECTS.filter(
    (s) => !availableSubjectNames.has(s.toLowerCase())
  );

  // ── Recommended quizzes ──
  const attemptedQuizIds = new Set(allAttempts.map((a) => a.quizId));
  const topicScores = new Map<string, { scores: number[]; subjectName: string; lastDate: Date }>();
  for (const a of allAttempts) {
    const key = `${a.quiz.topic}||${a.quiz.subject.name}`;
    if (!topicScores.has(key))
      topicScores.set(key, { scores: [], subjectName: a.quiz.subject.name, lastDate: a.submittedAt! });
    const entry = topicScores.get(key)!;
    entry.scores.push(a.score ?? 0);
    if (a.submittedAt! > entry.lastDate) entry.lastDate = a.submittedAt!;
  }

  const recommended: RecommendedQuiz[] = [];
  const addedIds = new Set<string>();

  // Priority 0: teacher-assigned practice topics
  for (const notif of notifications) {
    const data = notif.data as { topic?: string; subject?: string } | null;
    if (!data?.topic) continue;
    const match = allQuizzes.find(
      (q) =>
        q.topic.toLowerCase().includes(data.topic!.toLowerCase()) &&
        !attemptedQuizIds.has(q.id) &&
        !addedIds.has(q.id)
    );
    if (match) {
      recommended.push({
        id: match.id,
        title: match.title,
        subject: match.subject.name,
        topic: match.topic,
        duration: match.duration,
        questionCount: match._count.questions,
        reason: `Assigned by your teacher`,
        reasonType: "practice_assigned",
      });
      addedIds.add(match.id);
      if (recommended.length >= 3) break;
    }
  }

  // Priority 1: weak topics (avg score < 65%)
  if (recommended.length < 3) {
    const weakTopics = Array.from(topicScores.entries())
      .map(([key, v]) => ({
        topic: key.split("||")[0],
        subject: v.subjectName,
        avgScore: Math.round(v.scores.reduce((s, x) => s + x, 0) / v.scores.length),
      }))
      .filter((t) => t.avgScore < 65)
      .sort((a, b) => a.avgScore - b.avgScore);

    for (const weak of weakTopics) {
      const quiz = allQuizzes.find(
        (q) =>
          q.topic === weak.topic &&
          q.subject.name === weak.subject &&
          !attemptedQuizIds.has(q.id) &&
          !addedIds.has(q.id)
      );
      if (quiz) {
        recommended.push({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject.name,
          topic: quiz.topic,
          duration: quiz.duration,
          questionCount: quiz._count.questions,
          reason: `Weak area — ${weak.avgScore}% average score`,
          reasonType: "weak",
        });
        addedIds.add(quiz.id);
        if (recommended.length >= 3) break;
      }
    }
  }

  // Priority 2: topics not practiced in >7 days
  if (recommended.length < 3) {
    for (const [key, v] of topicScores) {
      const daysSince = Math.floor((Date.now() - v.lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= 7) continue;
      const topic = key.split("||")[0];
      const quiz = allQuizzes.find(
        (q) => q.topic === topic && !attemptedQuizIds.has(q.id) && !addedIds.has(q.id)
      );
      if (quiz) {
        recommended.push({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject.name,
          topic: quiz.topic,
          duration: quiz.duration,
          questionCount: quiz._count.questions,
          reason: `Not practiced in ${daysSince} day${daysSince !== 1 ? "s" : ""}`,
          reasonType: "stale",
        });
        addedIds.add(quiz.id);
        if (recommended.length >= 3) break;
      }
    }
  }

  // Priority 3: any unattempted quiz
  if (recommended.length < 3) {
    for (const quiz of allQuizzes) {
      if (!attemptedQuizIds.has(quiz.id) && !addedIds.has(quiz.id)) {
        recommended.push({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject.name,
          topic: quiz.topic,
          duration: quiz.duration,
          questionCount: quiz._count.questions,
          reason: "New quiz available",
          reasonType: "new",
        });
        addedIds.add(quiz.id);
        if (recommended.length >= 3) break;
      }
    }
  }

  return {
    stats: {
      quizzesTaken,
      avgScore,
      timeSpentHours,
      timeSpentMins,
      timeThisWeekMin,
      improvement,
      percentileLabel,
    },
    availableSubjects,
    comingSoonSubjects,
    recommended,
  };
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch quiz questions to grade
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) throw new Error("Quiz not found");

  // Auto-grade
  let earnedPoints = 0;
  let totalPoints = 0;
  const results: { questionId: string; correct: boolean; correctAnswer: string }[] = [];

  for (const q of quiz.questions) {
    totalPoints += q.points;
    const userAnswer = answers[q.id]?.trim().toLowerCase() ?? "";
    const correctAnswer = q.correctAnswer.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) earnedPoints += q.points;
    results.push({
      questionId: q.id,
      correct: isCorrect,
      correctAnswer: q.correctAnswer,
    });
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  // Save attempt
  await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId: user.id,
      answers: answers,
      score,
      submittedAt: new Date(),
    },
  });

  return { score: Math.round(score), results };
}
