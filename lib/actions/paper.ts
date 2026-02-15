"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { PaperTerm } from "@/lib/generated/prisma/enums";

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
}

export async function createPaper(input: CreatePaperInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

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
      status: "APPROVED",
      createdById: user.id,
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
  if (!subject) return [];

  // Map term number to PaperTerm enum
  const termMap: Record<string, PaperTerm> = {
    "1": "TERM_1",
    "2": "TERM_2",
    "3": "TERM_3",
  };
  const paperTerm = termMap[term];
  if (!paperTerm) return [];

  const papers = await prisma.paper.findMany({
    where: {
      subjectId: subject.id,
      term: paperTerm,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
  });

  return papers.map((p) => ({
    id: p.id,
    title: p.title,
    year: p.year,
    duration: p.duration,
    totalMarks: p.totalMarks,
    grade: p.grade,
    isModel: p.isModel,
  }));
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
