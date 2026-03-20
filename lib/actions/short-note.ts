"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface AttachmentInput {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface CreateShortNoteInput {
  title: string;
  subject: string;
  grade?: string;
  topic: string;
  content: string;
  visibility?: string;
  attachments?: AttachmentInput[];
}

export async function createShortNote(input: CreateShortNoteInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const EXTRA_SUBJECTS = ["Geography", "Health"];

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role === "TEACHER") {
    const teacherDetails = await prisma.teacherDetails.findUnique({
      where: { id: user.id },
    });
    if (!teacherDetails) throw new Error("Teacher details not found");
    if (teacherDetails.subject !== input.subject && !EXTRA_SUBJECTS.includes(input.subject)) {
      throw new Error(
        `You are not authorized to upload content for "${input.subject}". Your assigned subject is "${teacherDetails.subject}".`
      );
    }
  }

  const subjectCode = input.subject.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || input.subject.slice(0, 8).toUpperCase();
  const subject = await prisma.subject.upsert({
    where: { name: input.subject },
    create: { name: input.subject, code: subjectCode },
    update: {},
  });

  const shortNote = await prisma.shortNote.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      grade: input.grade || null,
      topic: input.topic,
      content: input.content,
      status: "APPROVED",
      visibility: profile?.role === "ADMIN" ? "PUBLIC" : (input.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY"),
      createdById: user.id,
      attachments: input.attachments?.length
        ? { create: input.attachments.map((a) => ({ name: a.name, url: a.url, size: a.size, type: a.type })) }
        : undefined,
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
      attachments: true,
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
    attachments: shortNote.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      size: a.size,
      type: a.type,
    })),
  };
}
