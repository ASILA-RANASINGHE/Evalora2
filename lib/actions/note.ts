"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface CreateNoteInput {
  title: string;
  subject: string;
  topic: string;
  content: string;
}

export async function createNote(input: CreateNoteInput) {
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

  const note = await prisma.note.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      topic: input.topic,
      content: input.content,
      visibility: "STUDENTS_ONLY",
      status: "APPROVED",
      createdById: user.id,
    },
  });

  return { id: note.id };
}

export async function getNotesBySubject(subjectName: string) {
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return { adminContent: [], teacherContent: [] };

  const notes = await prisma.note.findMany({
    where: {
      subjectId: subject.id,
      status: "APPROVED",
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapNote = (n: typeof notes[0]) => ({
    id: n.id,
    title: n.title,
    topic: n.topic,
    author: `${n.createdBy.firstName ?? ""} ${n.createdBy.lastName ?? ""}`.trim() || "Teacher",
    createdAt: n.createdAt,
    contentLength: n.content.length,
  });

  const adminContent = notes.filter((n) => n.createdBy.role === "ADMIN").map(mapNote);
  const teacherContent = notes.filter((n) => n.createdBy.role === "TEACHER").map(mapNote);

  return { adminContent, teacherContent };
}

export async function getNoteById(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      attachments: true,
    },
  });

  if (!note) return null;

  return {
    id: note.id,
    title: note.title,
    subject: note.subject.name,
    topic: note.topic,
    content: note.content,
    author: `${note.createdBy.firstName ?? ""} ${note.createdBy.lastName ?? ""}`.trim() || "Teacher",
    createdAt: note.createdAt,
    attachments: note.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      size: a.size,
      type: a.type,
    })),
  };
}
