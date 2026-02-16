"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  RelationshipStatus,
  RelationshipType,
  UserRole,
} from "@/lib/generated/prisma/enums";

// ─── Helpers ────────────────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== UserRole.ADMIN)
    throw new Error("Admin access required");

  return user.id;
}

// ─── Get All Relationships ──────────────────────────────────────

export async function getAllRelationships() {
  await requireAdmin();

  const [teacherStudent, parentStudent] = await Promise.all([
    prisma.teacherStudentLink.findMany({
      include: {
        teacher: { include: { teacherDetails: true } },
        student: { include: { studentDetails: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.parentStudentLink.findMany({
      include: {
        parent: true,
        student: { include: { studentDetails: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    teacherStudent: teacherStudent.map((r) => ({
      id: r.id,
      teacherName: `${r.teacher.firstName || ""} ${r.teacher.lastName || ""}`.trim(),
      teacherEmail: r.teacher.email,
      teacherSubject: r.teacher.teacherDetails?.subject,
      studentName: `${r.student.firstName || ""} ${r.student.lastName || ""}`.trim(),
      studentEmail: r.student.email,
      studentGrade: r.student.studentDetails?.grade,
      createdAt: r.createdAt,
    })),
    parentStudent: parentStudent.map((r) => ({
      id: r.id,
      parentName: `${r.parent.firstName || ""} ${r.parent.lastName || ""}`.trim(),
      parentEmail: r.parent.email,
      studentName: `${r.student.firstName || ""} ${r.student.lastName || ""}`.trim(),
      studentEmail: r.student.email,
      studentGrade: r.student.studentDetails?.grade,
      createdAt: r.createdAt,
    })),
  };
}

// ─── Get All Pending Requests ───────────────────────────────────

export async function getAllPendingRequests() {
  await requireAdmin();

  const requests = await prisma.relationshipRequest.findMany({
    where: { status: RelationshipStatus.PENDING },
    include: {
      requester: {
        include: { studentDetails: true, teacherDetails: true },
      },
      receiver: {
        include: { studentDetails: true, teacherDetails: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    type: r.type,
    requesterName: `${r.requester.firstName || ""} ${r.requester.lastName || ""}`.trim(),
    requesterEmail: r.requester.email,
    requesterRole: r.requester.role,
    receiverName: `${r.receiver.firstName || ""} ${r.receiver.lastName || ""}`.trim(),
    receiverEmail: r.receiver.email,
    receiverRole: r.receiver.role,
    createdAt: r.createdAt,
  }));
}

// ─── Admin Approve Request ──────────────────────────────────────

export async function adminApproveRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const request = await prisma.relationshipRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, receiver: true },
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.status !== RelationshipStatus.PENDING)
      return { success: false, error: "Request is not pending" };

    await prisma.$transaction(async (tx) => {
      await tx.relationshipRequest.update({
        where: { id: requestId },
        data: { status: RelationshipStatus.ACCEPTED, respondedAt: new Date() },
      });

      if (request.type === RelationshipType.TEACHER_STUDENT) {
        const teacherId =
          request.requester.role === UserRole.TEACHER
            ? request.requesterId
            : request.receiverId;
        const studentId =
          request.requester.role === UserRole.STUDENT
            ? request.requesterId
            : request.receiverId;
        await tx.teacherStudentLink.create({
          data: { teacherId, studentId },
        });
      } else {
        const parentId =
          request.requester.role === UserRole.PARENT
            ? request.requesterId
            : request.receiverId;
        const studentId =
          request.requester.role === UserRole.STUDENT
            ? request.requesterId
            : request.receiverId;
        await tx.parentStudentLink.create({
          data: { parentId, studentId },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error approving request:", error);
    return { success: false, error: "Failed to approve request" };
  }
}

// ─── Admin Reject Request ───────────────────────────────────────

export async function adminRejectRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.relationshipRequest.update({
      where: { id: requestId },
      data: { status: RelationshipStatus.REJECTED, respondedAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return { success: false, error: "Failed to reject request" };
  }
}

// ─── Admin Create Relationship ──────────────────────────────────

export async function adminCreateRelationship(
  userId1: string,
  userId2: string,
  type: RelationshipType
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const [profile1, profile2] = await Promise.all([
      prisma.profile.findUnique({ where: { id: userId1 } }),
      prisma.profile.findUnique({ where: { id: userId2 } }),
    ]);

    if (!profile1 || !profile2)
      return { success: false, error: "User not found" };

    if (type === RelationshipType.TEACHER_STUDENT) {
      const teacherId =
        profile1.role === UserRole.TEACHER ? userId1 : userId2;
      const studentId =
        profile1.role === UserRole.STUDENT ? userId1 : userId2;

      if (
        (profile1.role !== UserRole.TEACHER &&
          profile1.role !== UserRole.STUDENT) ||
        (profile2.role !== UserRole.TEACHER &&
          profile2.role !== UserRole.STUDENT)
      )
        return { success: false, error: "Invalid roles for teacher-student link" };

      await prisma.teacherStudentLink.create({
        data: { teacherId, studentId },
      });
    } else {
      const parentId = profile1.role === UserRole.PARENT ? userId1 : userId2;
      const studentId =
        profile1.role === UserRole.STUDENT ? userId1 : userId2;

      // Check max 2 parents
      const count = await prisma.parentStudentLink.count({
        where: { studentId },
      });
      if (count >= 2)
        return { success: false, error: "Student already has maximum of 2 parents" };

      await prisma.parentStudentLink.create({
        data: { parentId, studentId },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating relationship:", error);
    return { success: false, error: "Failed to create relationship" };
  }
}

// ─── Search Users (Admin) ───────────────────────────────────────

export async function searchAllUsers(query: string, role?: UserRole) {
  await requireAdmin();

  if (query.length < 2) return [];

  const users = await prisma.profile.findMany({
    where: {
      ...(role ? { role } : {}),
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      studentDetails: true,
      teacherDetails: true,
    },
    take: 20,
  });

  return users.map((u) => ({
    id: u.id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.email,
    role: u.role,
    grade: u.studentDetails?.grade,
    subject: u.teacherDetails?.subject,
  }));
}
