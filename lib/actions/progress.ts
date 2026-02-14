"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getStudentProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const progress = await prisma.studentProgress.findUnique({
    where: { studentId: user.id },
  });

  return progress;
}

export async function getLeaderboard() {
  const leaders = await prisma.studentProgress.findMany({
    orderBy: { totalPoints: "desc" },
    take: 10,
    include: {
      student: {
        select: { firstName: true, lastName: true, id: true },
      },
    },
  });

  return leaders.map((l, index) => ({
    id: l.student.id,
    name: `${l.student.firstName ?? ""} ${l.student.lastName ?? ""}`.trim() || "Student",
    points: l.totalPoints,
    rank: index + 1,
    avatar: `${(l.student.firstName ?? "S")[0]}${(l.student.lastName ?? "")[0] || ""}`,
  }));
}
