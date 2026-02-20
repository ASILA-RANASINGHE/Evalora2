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
