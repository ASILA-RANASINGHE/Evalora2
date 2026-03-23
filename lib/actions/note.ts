"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface AttachmentInput {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface CreateNoteInput {
  title: string;
  subject: string;
  grade?: string;
  topic: string;
  content: string;
  visibility?: string;
  attachments?: AttachmentInput[];
}

export async function createNote(input: CreateNoteInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const EXTRA_SUBJECTS = ["English", "Geography", "Civic Education", "Health"];

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
    if (!allowedSubjects.includes(input.subject.trim().toLowerCase()) && !EXTRA_SUBJECTS.includes(input.subject)) {
      throw new Error(`You are not authorized to upload content for "${input.subject}".`);
    }
  }

  const subjectCode = input.subject.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || input.subject.slice(0, 8).toUpperCase();
  const subject = await prisma.subject.upsert({
    where: { name: input.subject },
    create: { name: input.subject, code: subjectCode },
    update: {},
  });

  const note = await prisma.note.create({
    data: {
      title: input.title,
      subjectId: subject.id,
      grade: input.grade || null,
      topic: input.topic,
      content: input.content,
      visibility: profile?.role === "ADMIN" ? "PUBLIC" : (input.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY"),
      status: "APPROVED",
      createdById: user.id,
      attachments: input.attachments?.length
        ? { create: input.attachments.map((a) => ({ name: a.name, url: a.url, size: a.size, type: a.type })) }
        : undefined,
    },
  });

  return { id: note.id };
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { role: true } });
  const note = await prisma.note.findUnique({ where: { id }, select: { createdById: true } });
  if (!note) throw new Error("Not found");
  if (note.createdById !== user.id && profile?.role !== "ADMIN") throw new Error("Forbidden");

  await prisma.note.delete({ where: { id } });
  return { ok: true };
}

export async function updateNote(id: string, input: { title: string; topic: string; grade?: string; content: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { role: true } });
  const note = await prisma.note.findUnique({ where: { id }, select: { createdById: true } });
  if (!note) throw new Error("Not found");
  if (note.createdById !== user.id && profile?.role !== "ADMIN") throw new Error("Forbidden");

  await prisma.note.update({ where: { id }, data: { title: input.title, topic: input.topic, grade: input.grade || null, content: input.content } });
  return { ok: true };
}

export async function getNotesBySubject(subjectName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { adminContent: [], teacherContent: [] };

  const [studentDetails, teacherLinks] = await Promise.all([
    prisma.studentDetails.findUnique({ where: { id: user.id }, select: { grade: true } }),
    prisma.teacherStudentLink.findMany({ where: { studentId: user.id }, select: { teacherId: true } }),
  ]);

  const studentGrade = studentDetails?.grade ?? null;
  // Normalize: StudentDetails stores grade as "6", content uses "Grade 6"
  const normalizedGrade = studentGrade
    ? (/^\d+$/.test(studentGrade) ? `Grade ${studentGrade}` : studentGrade)
    : null;
  const assignedTeacherIds = teacherLinks.map((l) => l.teacherId);

  const subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName, mode: "insensitive" } },
  });
  if (!subject) return { adminContent: [], teacherContent: [] };

  const notes = await prisma.note.findMany({
    where: {
      subjectId: subject.id,
      status: "APPROVED",
      AND: [
        // Grade filter: match student's grade or notes with no grade restriction
        normalizedGrade
          ? { OR: [{ grade: null }, { grade: normalizedGrade }] }
          : {},
        // Visibility filter: PUBLIC or STUDENTS_ONLY from a linked teacher
        assignedTeacherIds.length > 0
          ? { OR: [
              { visibility: "PUBLIC" },
              { visibility: "STUDENTS_ONLY", createdById: { in: assignedTeacherIds } },
            ]}
          : { visibility: "PUBLIC" },
      ],
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
    grade: note.grade,
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
