"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getMyProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      studentDetails: true,
      teacherDetails: true,
      parentDetails: true,
      adminDetails: true,
    },
  });

  if (!profile) return null;

  // avatarEmoji lives in Supabase user_metadata — no DB column needed
  return {
    ...profile,
    avatarEmoji: (user.user_metadata?.avatarEmoji as string | undefined) ?? null,
  };
}

export async function updateMyProfile(data: {
  firstName: string;
  lastName: string;
  avatarEmoji?: string;
  // student
  grade?: string;
  // teacher
  subject?: string;
  // parent
  phoneNumber?: string;
  relationship?: string;
  // admin
  department?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) return { error: "Profile not found" };

  // Update avatarEmoji and grade in Supabase user_metadata
  const metaUpdate: Record<string, unknown> = {};
  if (data.avatarEmoji !== undefined) metaUpdate.avatarEmoji = data.avatarEmoji;
  if (data.grade !== undefined) {
    // Always store in "Grade X" format so any DB trigger reads the correct value
    metaUpdate.grade = /^\d+$/.test(data.grade) ? `Grade ${data.grade}` : data.grade;
  }
  if (Object.keys(metaUpdate).length > 0) {
    await supabase.auth.updateUser({ data: metaUpdate });
  }

  // Update name in Profile table
  await prisma.profile.update({
    where: { id: user.id },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    },
  });

  if (profile.role === "STUDENT" && data.grade) {
    // Normalize to "Grade X" format regardless of what the client sends
    const normalizedGrade = /^\d+$/.test(data.grade) ? `Grade ${data.grade}` : data.grade;
    await prisma.studentDetails.upsert({
      where: { id: user.id },
      update: { grade: normalizedGrade },
      create: { id: user.id, grade: normalizedGrade },
    });
  }

  if (profile.role === "TEACHER" && data.subject) {
    await prisma.teacherDetails.upsert({
      where: { id: user.id },
      update: { subject: data.subject },
      create: { id: user.id, subject: data.subject },
    });
  }

  if (profile.role === "PARENT") {
    const updateData: Record<string, string> = {};
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.relationship) updateData.relationship = data.relationship;
    if (Object.keys(updateData).length > 0) {
      await prisma.parentDetails.upsert({
        where: { id: user.id },
        update: updateData,
        create: {
          id: user.id,
          phoneNumber: data.phoneNumber ?? "",
          relationship: data.relationship ?? "",
        },
      });
    }
  }

  if (profile.role === "ADMIN") {
    await prisma.adminDetails.upsert({
      where: { id: user.id },
      update: { department: data.department ?? null },
      create: { id: user.id, department: data.department ?? null },
    });
  }

  return { success: true };
}
