"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getTeacherSubjects(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const teacherDetails = await prisma.teacherDetails.findUnique({
    where: { id: user.id },
  });

  if (!teacherDetails) return [];

  return [teacherDetails.subject];
}

export async function getTeacherSubjectTopics(): Promise<
  Record<string, string[]>
> {
  const subjects = await getTeacherSubjects();
  // Return topics for the teacher's subject(s)
  const topicsMap: Record<string, string[]> = {
    History: [
      "Ancient Civilizations of Sri Lanka",
      "Medieval Kingdoms of Sri Lanka",
      "Colonial Era in Sri Lanka",
      "Independence Movement of Sri Lanka",
      "Ancient Egypt and Mesopotamia",
      "Greek and Roman Civilizations",
      "World War I",
      "World War II",
      "Industrial Revolution",
      "Cold War Era",
    ],
  };

  const result: Record<string, string[]> = {};
  for (const s of subjects) {
    if (topicsMap[s]) {
      result[s] = topicsMap[s];
    }
  }
  return result;
}
