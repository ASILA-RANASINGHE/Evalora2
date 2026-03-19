"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { PaperTerm, QuestionType } from "@/lib/generated/prisma/enums";

interface PaperQuestionInput {
  text: string;
  type: QuestionType;
  points: number;
  options: string[];
  correctAnswer: string;
  order: number;
  // Structured question hierarchy
  questionNumber?: number;
  subLabel?: string;
  subSubLabel?: string;
  description?: string;
  imageUrl?: string;
}

export interface SelectionRule {
  id: number;
  label?: string;
  questionNumbers: number[]; // which main question numbers are in this group
  required: number;          // how many must be answered
}

interface CreatePaperInput {
  title: string;
  subject: string;
  term: PaperTerm;
  grade: string;
  year?: number;
  duration: number;
  isModel: boolean;
  mcqCount: number;
  mcqMarks: number;
  essayCount: number;
  essayMarks: number;
  totalMarks: number;
  passPercentage: number;
  instructions?: string;
  visibility?: string;
  selectionRules?: SelectionRule[];
  questions?: PaperQuestionInput[];
}

export async function createPaper(input: CreatePaperInput) {
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

  const subject = await prisma.subject.findUnique({
    where: { name: input.subject },
  });
  if (!subject) throw new Error(`Subject "${input.subject}" not found`);

  const paper = await prisma.paper.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      term: input.term,
      grade: input.grade,
      year: input.year,
      duration: input.duration,
      isModel: input.isModel,
      mcqCount: input.mcqCount,
      mcqMarks: input.mcqMarks,
      essayCount: input.essayCount,
      essayMarks: input.essayMarks,
      totalMarks: input.totalMarks,
      passPercentage: input.passPercentage,
      instructions: input.instructions,
      selectionRules: input.selectionRules && input.selectionRules.length > 0
        ? (input.selectionRules as object[])
        : undefined,
      visibility: profile?.role === "ADMIN" ? "PUBLIC" : (input.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY"),
      status: "APPROVED",
      createdById: user.id,
      ...(input.questions && input.questions.length > 0 && {
        questions: {
          create: input.questions.map((q, i) => ({
            text: q.text,
            type: q.type,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: q.order ?? i,
            questionNumber: q.questionNumber ?? null,
            subLabel: q.subLabel ?? null,
            subSubLabel: q.subSubLabel ?? null,
            description: q.description ?? null,
            imageUrl: q.imageUrl ?? null,
          })),
        },
      }),
    },
  });

  return { id: paper.id };
}

export async function getPapersBySubjectAndTerm(
  subjectName: string,
  term: string
) {
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return { adminContent: [], teacherContent: [] };

  // Map term number to PaperTerm enum
  const termMap: Record<string, PaperTerm> = {
    "1": "TERM_1",
    "2": "TERM_2",
    "3": "TERM_3",
  };
  const paperTerm = termMap[term];
  if (!paperTerm) return { adminContent: [], teacherContent: [] };

  const papers = await prisma.paper.findMany({
    where: {
      subjectId: subject.id,
      term: paperTerm,
      status: "APPROVED",
    },
    include: {
      createdBy: { select: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapPaper = (p: typeof papers[0]) => ({
    id: p.id,
    title: p.title,
    year: p.year,
    duration: p.duration,
    totalMarks: p.totalMarks,
    grade: p.grade,
    isModel: p.isModel,
  });

  const adminContent = papers.filter((p) => p.createdBy.role === "ADMIN").map(mapPaper);
  const teacherContent = papers.filter((p) => p.createdBy.role === "TEACHER").map(mapPaper);

  return { adminContent, teacherContent };
}

export async function getPaperById(id: string) {
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!paper) return null;

  return {
    id: paper.id,
    title: paper.title,
    subject: paper.subject.name,
    term: paper.term,
    grade: paper.grade,
    year: paper.year,
    duration: paper.duration,
    isModel: paper.isModel,
    mcqCount: paper.mcqCount,
    mcqMarks: paper.mcqMarks,
    essayCount: paper.essayCount,
    essayMarks: paper.essayMarks,
    totalMarks: paper.totalMarks,
    passPercentage: paper.passPercentage,
    instructions: paper.instructions,
    createdBy: `${paper.createdBy.firstName ?? ""} ${paper.createdBy.lastName ?? ""}`.trim() || "Teacher",
  };
}

// ─── Exam Attempt Actions ──────────────────────────────────────────────────

export interface ExamQuestion {
  id: string;
  number: number;
  text: string;
  type: "MCQ" | "SHORT";
  points: number;
  options: string[];
  // Structured question hierarchy
  questionNumber?: number | null;
  subLabel?: string | null;
  subSubLabel?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

export interface ExamPaperData {
  id: string;
  title: string;
  subject: string;
  term: string;
  grade: string;
  year: number | null;
  duration: number; // minutes
  totalMarks: number;
  mcqCount: number;
  mcqMarks: number;
  essayCount: number;
  essayMarks: number;
  passPercentage: number;
  instructions: string | null;
  selectionRules: SelectionRule[] | null;
  questions: ExamQuestion[];
}

export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  isCorrect: boolean;
  isPartial: boolean;
  marksAwarded: number;
  marksAvailable: number;
  aiFeedback: string;
  aiConfidence: number;
  correctAnswer: string;
  studentAnswer: string;
  requiresManualReview: boolean;
  questionText: string;
  questionType: "MCQ" | "SHORT";
  options: string[];
  // Structured hierarchy fields
  mainQuestionNumber?: number | null;
  subLabel?: string | null;
  subSubLabel?: string | null;
  description?: string | null;
}

export interface ExamResults {
  attemptId: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeTaken: number; // seconds
  selectionRules?: SelectionRule[] | null;
  sectionBreakdown: {
    section: string;
    type: string;
    questions: number;
    correct: number;
    incorrect: number;
    partial: number;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
  }[];
  questionResults: QuestionResult[];
}

function calculateGrade(percentage: number): string {
  if (percentage >= 75) return "A+";
  if (percentage >= 65) return "A";
  if (percentage >= 55) return "B+";
  if (percentage >= 50) return "B";
  if (percentage >= 45) return "C";
  if (percentage >= 35) return "S";
  return "F";
}

function gradeStructuredQuestion(
  studentAnswer: string,
  correctAnswer: string,
  points: number
): { marksAwarded: number; isCorrect: boolean; isPartial: boolean; aiFeedback: string; aiConfidence: number } {
  if (!studentAnswer?.trim()) {
    return { marksAwarded: 0, isCorrect: false, isPartial: false, aiFeedback: "No answer was provided for this question.", aiConfidence: 99 };
  }
  const studentLower = studentAnswer.toLowerCase();
  const correctLower = correctAnswer.toLowerCase();

  // Extract meaningful keywords from model answer
  const stopWords = new Set(["this", "that", "with", "from", "they", "them", "have", "been", "were", "will", "when", "what", "which", "where", "then", "than", "also", "into", "some", "more", "very", "such", "even", "most", "each", "other", "used", "make", "made", "does", "just", "like", "both", "here", "many", "much", "same", "well", "over", "only", "back", "after", "before"]);
  const keywords = correctLower
    .split(/[\s,.:;!?()\[\]"']+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const matched = keywords.filter((kw) => studentLower.includes(kw));
  const ratio = keywords.length > 0 ? matched.length / keywords.length : 0;

  // Round to nearest 0.5
  const raw = ratio * points;
  const marksAwarded = Math.min(Math.round(raw * 2) / 2, points);
  const isCorrect = ratio >= 0.8;
  const isPartial = ratio >= 0.3 && ratio < 0.8;
  const aiConfidence = Math.min(95, 60 + Math.round(ratio * 30));

  let aiFeedback = "";
  if (isCorrect) {
    aiFeedback = `Excellent answer! You correctly identified ${matched.length} out of ${keywords.length} key concepts. Your response demonstrates a strong understanding of the topic.`;
  } else if (isPartial) {
    const missing = keywords.filter((kw) => !studentLower.includes(kw)).slice(0, 4);
    aiFeedback = `Partial credit awarded. Your answer covers some key concepts but is missing important elements. Consider elaborating on: ${missing.join(", ")}. Review the model answer for a more complete response.`;
  } else {
    const sample = correctAnswer.substring(0, 120);
    aiFeedback = `Your answer does not sufficiently address the key concepts required. The model answer focuses on: "${sample}...". Review your notes and try to include the main points.`;
  }

  return { marksAwarded, isCorrect, isPartial, aiFeedback, aiConfidence };
}

/** Start a new paper attempt or resume an incomplete one */
export async function startPaperAttempt(paperId: string): Promise<{
  attemptId: string;
  paper: ExamPaperData;
  existingAnswers: Record<string, string>;
  existingFlagged: string[];
  isResuming: boolean;
  timeElapsed: number; // seconds already used
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const paper = await prisma.paper.findUnique({
    where: { id: paperId, status: "APPROVED" },
    include: {
      subject: { select: { name: true } },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!paper) throw new Error("Paper not found");

  // Check for incomplete attempt
  const existing = await prisma.paperAttempt.findFirst({
    where: { paperId, studentId: user.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
  });

  let attemptId: string;
  let existingAnswers: Record<string, string> = {};
  let existingFlagged: string[] = [];
  let isResuming = false;
  let timeElapsed = 0;

  if (existing) {
    attemptId = existing.id;
    existingAnswers = (existing.answers as Record<string, string>) ?? {};
    existingFlagged = (existing.flagged as string[]) ?? [];
    isResuming = true;
    timeElapsed = Math.floor((Date.now() - existing.startedAt.getTime()) / 1000);
  } else {
    const attempt = await prisma.paperAttempt.create({
      data: { paperId, studentId: user.id },
    });
    attemptId = attempt.id;
  }

  const examPaper: ExamPaperData = {
    id: paper.id,
    title: paper.title,
    subject: paper.subject.name,
    term: paper.term,
    grade: paper.grade,
    year: paper.year,
    duration: paper.duration,
    totalMarks: paper.totalMarks,
    mcqCount: paper.mcqCount,
    mcqMarks: paper.mcqMarks,
    essayCount: paper.essayCount,
    essayMarks: paper.essayMarks,
    passPercentage: paper.passPercentage,
    instructions: paper.instructions,
    selectionRules: paper.selectionRules
      ? (paper.selectionRules as unknown as SelectionRule[])
      : null,
    questions: paper.questions.map((q, i) => ({
      id: q.id,
      number: i + 1,
      text: q.text,
      type: q.type as "MCQ" | "SHORT",
      points: q.points,
      options: q.options,
      questionNumber: q.questionNumber,
      subLabel: q.subLabel,
      subSubLabel: q.subSubLabel,
      description: q.description,
      imageUrl: q.imageUrl,
      // correctAnswer is NOT sent to client
    })),
  };

  return { attemptId, paper: examPaper, existingAnswers, existingFlagged, isResuming, timeElapsed };
}

/** Auto-save answers during the exam */
export async function autoSavePaperAnswers(
  attemptId: string,
  answers: Record<string, string>,
  flagged: string[]
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.paperAttempt.updateMany({
    where: { id: attemptId, studentId: user.id, submittedAt: null },
    data: { answers, flagged },
  });

  return { ok: true };
}

/** Final submission - grades paper and stores results */
export async function submitPaperAttempt(
  attemptId: string,
  answers: Record<string, string>,
  flagged: string[],
  timeTaken: number
): Promise<ExamResults> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const attempt = await prisma.paperAttempt.findUnique({
    where: { id: attemptId, studentId: user.id },
    include: {
      paper: {
        include: {
          questions: { orderBy: { order: "asc" } },
          subject: { select: { name: true } },
        },
      },
    },
  });
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) throw new Error("Already submitted");

  const questions = attempt.paper.questions;
  const questionResults: QuestionResult[] = [];
  let totalEarned = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const studentAnswer = answers[q.id]?.trim() ?? "";
    let marksAwarded = 0;
    let isCorrect = false;
    let isPartial = false;
    let aiFeedback = "";
    let aiConfidence = 99;

    if (q.type === "MCQ") {
      isCorrect = studentAnswer.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      marksAwarded = isCorrect ? q.points : 0;
      aiFeedback = isCorrect
        ? "Correct! You selected the right answer."
        : `Incorrect. The correct answer is: ${q.correctAnswer}. Review this topic to understand why.`;
      aiConfidence = 99;
    } else {
      const result = gradeStructuredQuestion(studentAnswer, q.correctAnswer, q.points);
      marksAwarded = result.marksAwarded;
      isCorrect = result.isCorrect;
      isPartial = result.isPartial;
      aiFeedback = result.aiFeedback;
      aiConfidence = result.aiConfidence;
    }

    questionResults.push({
      questionId: q.id,
      questionNumber: i + 1,
      isCorrect,
      isPartial,
      marksAwarded,
      marksAvailable: q.points,
      aiFeedback,
      aiConfidence,
      correctAnswer: q.correctAnswer,
      studentAnswer,
      requiresManualReview: q.type === "SHORT" && aiConfidence < 80,
      questionText: q.text,
      questionType: q.type as "MCQ" | "SHORT",
      options: q.options,
      mainQuestionNumber: q.questionNumber,
      subLabel: q.subLabel,
      subSubLabel: q.subSubLabel,
      description: q.description,
    });
  }

  // ── Apply selection-group rules ──────────────────────────────────────────────
  // For each selective group, if the student answered more than required,
  // zero out the lowest-scoring extras so only the best `required` count.
  const selectionRules = attempt.paper.selectionRules
    ? (attempt.paper.selectionRules as unknown as SelectionRule[])
    : [];

  for (const rule of selectionRules) {
    // All sub-question results whose mainQuestionNumber belongs to this group
    const groupResults = questionResults.filter(
      (r) => r.mainQuestionNumber != null && rule.questionNumbers.includes(r.mainQuestionNumber)
    );

    // Determine which main-question numbers were actually answered (at least one sub answered)
    const answeredMainNums = [...new Set(
      groupResults
        .filter((r) => r.studentAnswer.trim().length > 0)
        .map((r) => r.mainQuestionNumber!)
    )];

    if (answeredMainNums.length > rule.required) {
      // Grade each answered main question by summing its sub-question marks
      const mainScores = answeredMainNums.map((num) => ({
        num,
        score: groupResults
          .filter((r) => r.mainQuestionNumber === num)
          .reduce((s, r) => s + r.marksAwarded, 0),
      }));
      // Sort ascending — lowest scores get zeroed first
      mainScores.sort((a, b) => a.score - b.score);
      const toExclude = mainScores.slice(0, mainScores.length - rule.required).map((m) => m.num);

      for (const excludedNum of toExclude) {
        groupResults
          .filter((r) => r.mainQuestionNumber === excludedNum)
          .forEach((r) => {
            r.marksAwarded = 0;
            r.isCorrect = false;
            r.isPartial = false;
            r.aiFeedback = `Question ${excludedNum} was not counted — you answered more than the required ${rule.required} question(s) in this group. Your ${rule.required} best-answered question(s) were counted instead.`;
          });
      }
    }
  }

  // Sum marks after selection-rule adjustments
  totalEarned = questionResults.reduce((s, r) => s + r.marksAwarded, 0);

  const totalMarks = attempt.paper.totalMarks;
  const percentage = totalMarks > 0 ? Math.round((totalEarned / totalMarks) * 100) : 0;
  const grade = calculateGrade(percentage);

  // Section breakdown
  const mcqResults = questionResults.filter((r) => r.questionType === "MCQ");
  const shortResults = questionResults.filter((r) => r.questionType === "SHORT");
  const sectionBreakdown = [];

  if (mcqResults.length > 0) {
    const mcqMarks = mcqResults.reduce((s, r) => s + r.marksAvailable, 0);
    const mcqEarned = mcqResults.reduce((s, r) => s + r.marksAwarded, 0);
    sectionBreakdown.push({
      section: "Section A",
      type: "MCQ",
      questions: mcqResults.length,
      correct: mcqResults.filter((r) => r.isCorrect).length,
      incorrect: mcqResults.filter((r) => !r.isCorrect && !r.isPartial).length,
      partial: mcqResults.filter((r) => r.isPartial).length,
      marksObtained: mcqEarned,
      totalMarks: mcqMarks,
      percentage: mcqMarks > 0 ? Math.round((mcqEarned / mcqMarks) * 100) : 0,
    });
  }

  if (shortResults.length > 0) {
    const shortMarks = shortResults.reduce((s, r) => s + r.marksAvailable, 0);
    const shortEarned = shortResults.reduce((s, r) => s + r.marksAwarded, 0);
    sectionBreakdown.push({
      section: "Section B",
      type: "Structured",
      questions: shortResults.length,
      correct: shortResults.filter((r) => r.isCorrect).length,
      incorrect: shortResults.filter((r) => !r.isCorrect && !r.isPartial).length,
      partial: shortResults.filter((r) => r.isPartial).length,
      marksObtained: shortEarned,
      totalMarks: shortMarks,
      percentage: shortMarks > 0 ? Math.round((shortEarned / shortMarks) * 100) : 0,
    });
  }

  const results: ExamResults = {
    attemptId,
    totalScore: totalEarned,
    totalMarks,
    percentage,
    grade,
    timeTaken,
    selectionRules: selectionRules.length > 0 ? selectionRules : null,
    sectionBreakdown,
    questionResults,
  };

  await prisma.paperAttempt.update({
    where: { id: attemptId },
    data: {
      score: percentage,
      timeTaken,
      answers,
      flagged,
      results: results as object,
      submittedAt: new Date(),
    },
  });

  // Update student progress
  await prisma.studentProgress.upsert({
    where: { studentId: user.id },
    create: { studentId: user.id, papersAttempted: 1, averageScore: percentage },
    update: {
      papersAttempted: { increment: 1 },
      totalLearningMin: { increment: Math.ceil(timeTaken / 60) },
    },
  });

  return results;
}

/** Get results for a completed attempt (for revisiting results page) */
export async function getPaperAttemptResult(attemptId: string): Promise<ExamResults | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const attempt = await prisma.paperAttempt.findUnique({
    where: { id: attemptId, studentId: user.id },
  });
  if (!attempt || !attempt.submittedAt || !attempt.results) return null;

  return attempt.results as unknown as ExamResults;
}

/** Get incomplete attempt for a paper (for resume detection) */
export async function getIncompleteAttempt(paperId: string): Promise<{ attemptId: string; startedAt: Date } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const attempt = await prisma.paperAttempt.findFirst({
    where: { paperId, studentId: user.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true, startedAt: true },
  });

  return attempt ? { attemptId: attempt.id, startedAt: attempt.startedAt } : null;
}

/** Flag a question for teacher manual review */
export async function requestManualReview(attemptId: string, questionId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const attempt = await prisma.paperAttempt.findUnique({
    where: { id: attemptId, studentId: user.id },
  });
  if (!attempt) throw new Error("Attempt not found");

  // We store review requests as flagged questions (reuse flagged field with a prefix marker)
  const currentFlagged = (attempt.flagged as string[]) ?? [];
  const reviewKey = `review:${questionId}`;
  if (!currentFlagged.includes(reviewKey)) {
    await prisma.paperAttempt.update({
      where: { id: attemptId },
      data: { flagged: [...currentFlagged, reviewKey] },
    });
  }

  return { ok: true };
}
