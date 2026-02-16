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
  questions: {
    text: string;
    type: QuestionType;
    points: number;
    options: string[];
    correctAnswer: string;
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
    if (teacherDetails.subject !== input.subject) {
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
        })),
      },
    },
  });

  return { id: quiz.id };
}

export async function getQuizzesBySubject(subjectName: string) {
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return [];

  const quizzes = await prisma.quiz.findMany({
    where: {
      subjectId: subject.id,
      status: "APPROVED",
    },
    include: {
      _count: { select: { questions: true } },
      createdBy: { select: { firstName: true, lastName: true } },
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

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    topic: q.topic,
    type: q.type,
    duration: q.duration,
    questionCount: q._count.questions,
    createdBy: `${q.createdBy.firstName ?? ""} ${q.createdBy.lastName ?? ""}`.trim() || "Teacher",
    completed: attemptMap.has(q.id),
    score: attemptMap.get(q.id) ?? null,
  }));
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
