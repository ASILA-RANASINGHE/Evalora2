"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getMyContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [notes, shortNotes, quizzes, papers] = await Promise.all([
    prisma.note.findMany({
      where: { createdById: user.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shortNote.findMany({
      where: { createdById: user.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quiz.findMany({
      where: { createdById: user.id },
      include: {
        subject: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.paper.findMany({
      where: { createdById: user.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      subject: n.subject.name,
      topic: n.topic,
      status: n.status,
      createdAt: n.createdAt,
    })),
    shortNotes: shortNotes.map((n) => ({
      id: n.id,
      title: n.title,
      subject: n.subject.name,
      topic: n.topic,
      status: n.status,
      createdAt: n.createdAt,
    })),
    quizzes: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject.name,
      topic: q.topic,
      status: q.status,
      questionCount: q._count.questions,
      createdAt: q.createdAt,
    })),
    papers: papers.map((p) => ({
      id: p.id,
      title: p.title,
      subject: p.subject.name,
      grade: p.grade,
      term: p.term,
      status: p.status,
      totalMarks: p.totalMarks,
      createdAt: p.createdAt,
    })),
  };
}
