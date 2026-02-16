"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface CreateShortNoteInput {
  title: string;
  subject: string;
  topic: string;
  content: string;
}

export async function createShortNote(input: CreateShortNoteInput) {
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
      throw new Error(
        `You are not authorized to upload content for "${input.subject}". Your assigned subject is "${teacherDetails.subject}".`
      );
    }
  }

  const subject = await prisma.subject.findUnique({
    where: { name: input.subject },
  });
  if (!subject) throw new Error(`Subject "${input.subject}" not found`);

  const shortNote = await prisma.shortNote.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      topic: input.topic,
      content: input.content,
      status: "APPROVED",
      createdById: user.id,
    },
  });

  return { id: shortNote.id };
}

export async function getShortNotesBySubject(subjectName: string) {
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return { adminContent: [], teacherContent: [] };

  const shortNotes = await prisma.shortNote.findMany({
    where: {
      subjectId: subject.id,
      status: "APPROVED",
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapShortNote = (n: typeof shortNotes[0]) => ({
    id: n.id,
    title: n.title,
    topic: n.topic,
    author:
      `${n.createdBy.firstName ?? ""} ${n.createdBy.lastName ?? ""}`.trim() ||
      "Teacher",
    createdAt: n.createdAt,
    contentLength: n.content.length,
  });

  const adminContent = shortNotes.filter((n) => n.createdBy.role === "ADMIN").map(mapShortNote);
  const teacherContent = shortNotes.filter((n) => n.createdBy.role === "TEACHER").map(mapShortNote);

  return { adminContent, teacherContent };
}

export async function getShortNoteById(id: string) {
  const shortNote = await prisma.shortNote.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!shortNote) return null;

  return {
    id: shortNote.id,
    title: shortNote.title,
    subject: shortNote.subject.name,
    topic: shortNote.topic,
    content: shortNote.content,
    author:
      `${shortNote.createdBy.firstName ?? ""} ${shortNote.createdBy.lastName ?? ""}`.trim() ||
      "Teacher",
    createdAt: shortNote.createdAt,
  };
}
