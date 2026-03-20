"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  RelationshipType,
  RelationshipStatus,
  UserRole,
} from "@/lib/generated/prisma/enums";

// ─── Types ──────────────────────────────────────────────────────

export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  grade?: string;
  subject?: string;
  canConnect: boolean;
  connectionStatus: "connected" | "pending" | "none";
  requestDirection?: "sent" | "received";
}

export interface RelationshipRequestData {
  id: string;
  type: RelationshipType;
  status: RelationshipStatus;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    grade?: string;
    subject?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    grade?: string;
    subject?: string;
  };
  createdAt: Date;
}

// ─── Helpers ────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

function canSearchRole(userRole: UserRole, targetRole: UserRole): boolean {
  if (userRole === UserRole.STUDENT)
    return targetRole === UserRole.TEACHER || targetRole === UserRole.PARENT;
  if (userRole === UserRole.PARENT) return targetRole === UserRole.STUDENT;
  if (userRole === UserRole.TEACHER) return targetRole === UserRole.STUDENT;
  return false;
}

function getRelationshipType(
  role1: UserRole,
  role2: UserRole
): RelationshipType | null {
  const roles = new Set([role1, role2]);
  if (roles.has(UserRole.TEACHER) && roles.has(UserRole.STUDENT))
    return RelationshipType.TEACHER_STUDENT;
  if (roles.has(UserRole.PARENT) && roles.has(UserRole.STUDENT))
    return RelationshipType.PARENT_STUDENT;
  return null;
}

// ─── Search Users ───────────────────────────────────────────────

export async function searchUsers(
  query: string,
  targetRole: UserRole
): Promise<UserSearchResult[]> {
  const userId = await getCurrentUserId();

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!profile) throw new Error("Profile not found");
  if (!canSearchRole(profile.role, targetRole))
    throw new Error("Not authorized to search for this role");

  if (query.length < 2) return [];

  const users = await prisma.profile.findMany({
    where: {
      id: { not: userId },
      role: targetRole,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      studentDetails: targetRole === UserRole.STUDENT ? true : false,
      teacherDetails: targetRole === UserRole.TEACHER ? true : false,
    },
    take: 20,
  });

  const userIds = users.map((u) => u.id);

  const [existingRequests, teacherLinks, parentLinks] = await Promise.all([
    prisma.relationshipRequest.findMany({
      where: {
        status: RelationshipStatus.PENDING,
        OR: [
          { requesterId: userId, receiverId: { in: userIds } },
          { requesterId: { in: userIds }, receiverId: userId },
        ],
      },
    }),
    prisma.teacherStudentLink.findMany({
      where: {
        OR: [
          { teacherId: userId, studentId: { in: userIds } },
          { teacherId: { in: userIds }, studentId: userId },
        ],
      },
    }),
    prisma.parentStudentLink.findMany({
      where: {
        OR: [
          { parentId: userId, studentId: { in: userIds } },
          { parentId: { in: userIds }, studentId: userId },
        ],
      },
    }),
  ]);

  // For parent-student: check if student already has 2 parents
  let studentParentCounts: Record<string, number> = {};
  if (targetRole === UserRole.STUDENT && profile.role === UserRole.PARENT) {
    const counts = await prisma.parentStudentLink.groupBy({
      by: ["studentId"],
      where: { studentId: { in: userIds } },
      _count: { parentId: true },
    });
    studentParentCounts = Object.fromEntries(
      counts.map((c) => [c.studentId, c._count.parentId])
    );
  }

  return users.map((u) => {
    const pendingReq = existingRequests.find(
      (r) =>
        (r.requesterId === userId && r.receiverId === u.id) ||
        (r.requesterId === u.id && r.receiverId === userId)
    );

    const hasLink =
      teacherLinks.some(
        (l) =>
          (l.teacherId === userId && l.studentId === u.id) ||
          (l.teacherId === u.id && l.studentId === userId)
      ) ||
      parentLinks.some(
        (l) =>
          (l.parentId === userId && l.studentId === u.id) ||
          (l.parentId === u.id && l.studentId === userId)
      );

    const studentMaxParents =
      profile.role === UserRole.PARENT &&
      (studentParentCounts[u.id] || 0) >= 2;

    let connectionStatus: "connected" | "pending" | "none" = "none";
    if (hasLink) connectionStatus = "connected";
    else if (pendingReq) connectionStatus = "pending";

    return {
      id: u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email,
      role: u.role,
      grade: u.studentDetails?.grade,
      subject: u.teacherDetails?.subject,
      canConnect: !hasLink && !pendingReq && !studentMaxParents,
      connectionStatus,
      requestDirection: pendingReq
        ? pendingReq.requesterId === userId
          ? "sent"
          : "received"
        : undefined,
    };
  });
}

// ─── Send Connection Request ────────────────────────────────────

export async function sendConnectionRequest(
  receiverId: string,
  relationshipType: RelationshipType
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();

    const [requester, receiver] = await Promise.all([
      prisma.profile.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { id: receiverId } }),
    ]);

    if (!requester || !receiver)
      return { success: false, error: "Profile not found" };

    // Validate relationship type matches roles
    const expectedType = getRelationshipType(requester.role, receiver.role);
    if (!expectedType || expectedType !== relationshipType)
      return { success: false, error: "Invalid relationship type for these roles" };

    // Check max 2 parents per student
    if (relationshipType === RelationshipType.PARENT_STUDENT) {
      const studentId =
        receiver.role === UserRole.STUDENT ? receiverId : userId;
      const parentCount = await prisma.parentStudentLink.count({
        where: { studentId },
      });
      if (parentCount >= 2)
        return { success: false, error: "Student already has maximum of 2 parents" };
    }

    // Check for existing pending request or active link
    const existingRequest = await prisma.relationshipRequest.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId, type: relationshipType },
          { requesterId: receiverId, receiverId: userId, type: relationshipType },
        ],
        status: RelationshipStatus.PENDING,
      },
    });
    if (existingRequest)
      return { success: false, error: "A pending request already exists" };

    // Check for existing link
    if (relationshipType === RelationshipType.TEACHER_STUDENT) {
      const teacherId =
        requester.role === UserRole.TEACHER ? userId : receiverId;
      const studentId =
        requester.role === UserRole.STUDENT ? userId : receiverId;
      const existing = await prisma.teacherStudentLink.findUnique({
        where: { teacherId_studentId: { teacherId, studentId } },
      });
      if (existing)
        return { success: false, error: "Relationship already exists" };
    } else {
      const parentId =
        requester.role === UserRole.PARENT ? userId : receiverId;
      const studentId =
        requester.role === UserRole.STUDENT ? userId : receiverId;
      const existing = await prisma.parentStudentLink.findUnique({
        where: { parentId_studentId: { parentId, studentId } },
      });
      if (existing)
        return { success: false, error: "Relationship already exists" };
    }

    await prisma.relationshipRequest.create({
      data: {
        type: relationshipType,
        requesterId: userId,
        receiverId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending connection request:", error);
    return { success: false, error: "Failed to send request" };
  }
}

// ─── Get Outgoing Requests ──────────────────────────────────────

export async function getOutgoingRequests(): Promise<
  RelationshipRequestData[]
> {
  const userId = await getCurrentUserId();

  const requests = await prisma.relationshipRequest.findMany({
    where: { requesterId: userId },
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

  return requests.map(formatRequest);
}

// ─── Get Incoming Requests ──────────────────────────────────────

export async function getIncomingRequests(): Promise<
  RelationshipRequestData[]
> {
  const userId = await getCurrentUserId();

  const requests = await prisma.relationshipRequest.findMany({
    where: { receiverId: userId },
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

  return requests.map(formatRequest);
}

// ─── Accept Request ─────────────────────────────────────────────

export async function acceptConnectionRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();

    const request = await prisma.relationshipRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, receiver: true },
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.receiverId !== userId)
      return { success: false, error: "Not authorized to accept this request" };
    if (request.status !== RelationshipStatus.PENDING)
      return { success: false, error: "Request is not pending" };

    // Re-check parent limit
    if (request.type === RelationshipType.PARENT_STUDENT) {
      const studentId =
        request.receiver.role === UserRole.STUDENT
          ? request.receiverId
          : request.requesterId;
      const count = await prisma.parentStudentLink.count({
        where: { studentId },
      });
      if (count >= 2)
        return { success: false, error: "Student already has maximum of 2 parents" };
    }

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
    console.error("Error accepting request:", error);
    return { success: false, error: "Failed to accept request" };
  }
}

// ─── Reject Request ─────────────────────────────────────────────

export async function rejectConnectionRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();

    const request = await prisma.relationshipRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) return { success: false, error: "Request not found" };
    if (request.receiverId !== userId)
      return { success: false, error: "Not authorized" };

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

// ─── Cancel Outgoing Request ────────────────────────────────────

export async function cancelConnectionRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();

    const request = await prisma.relationshipRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) return { success: false, error: "Request not found" };
    if (request.requesterId !== userId)
      return { success: false, error: "Not authorized" };

    await prisma.relationshipRequest.delete({ where: { id: requestId } });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling request:", error);
    return { success: false, error: "Failed to cancel request" };
  }
}

// ─── Get My Relationships ───────────────────────────────────────

export async function getMyRelationships(): Promise<{
  teachers: Array<{
    id: string;
    name: string;
    email: string;
    subject?: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    email: string;
    grade?: string;
  }>;
  parents: Array<{ id: string; name: string; email: string }>;
}> {
  const userId = await getCurrentUserId();

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!profile) throw new Error("Profile not found");

  const result: {
    teachers: Array<{
      id: string;
      name: string;
      email: string;
      subject?: string;
    }>;
    students: Array<{
      id: string;
      name: string;
      email: string;
      grade?: string;
    }>;
    parents: Array<{ id: string; name: string; email: string }>;
  } = { teachers: [], students: [], parents: [] };

  if (profile.role === UserRole.STUDENT) {
    const [teacherLinks, parentLinks] = await Promise.all([
      prisma.teacherStudentLink.findMany({
        where: { studentId: userId },
        include: { teacher: { include: { teacherDetails: true } } },
      }),
      prisma.parentStudentLink.findMany({
        where: { studentId: userId },
        include: { parent: true },
      }),
    ]);
    result.teachers = teacherLinks.map((l) => ({
      id: l.teacher.id,
      name: `${l.teacher.firstName || ""} ${l.teacher.lastName || ""}`.trim(),
      email: l.teacher.email,
      subject: l.teacher.teacherDetails?.subject,
    }));
    result.parents = parentLinks.map((l) => ({
      id: l.parent.id,
      name: `${l.parent.firstName || ""} ${l.parent.lastName || ""}`.trim(),
      email: l.parent.email,
    }));
  } else if (profile.role === UserRole.TEACHER) {
    const studentLinks = await prisma.teacherStudentLink.findMany({
      where: { teacherId: userId },
      include: { student: { include: { studentDetails: true } } },
    });
    result.students = studentLinks.map((l) => ({
      id: l.student.id,
      name: `${l.student.firstName || ""} ${l.student.lastName || ""}`.trim(),
      email: l.student.email,
      grade: l.student.studentDetails?.grade,
    }));
  } else if (profile.role === UserRole.PARENT) {
    const studentLinks = await prisma.parentStudentLink.findMany({
      where: { parentId: userId },
      include: { student: { include: { studentDetails: true } } },
    });
    result.students = studentLinks.map((l) => ({
      id: l.student.id,
      name: `${l.student.firstName || ""} ${l.student.lastName || ""}`.trim(),
      email: l.student.email,
      grade: l.student.studentDetails?.grade,
    }));
  }

  return result;
}

// ─── Format Helper ──────────────────────────────────────────────

function formatRequest(r: any): RelationshipRequestData {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    requester: {
      id: r.requester.id,
      firstName: r.requester.firstName || "",
      lastName: r.requester.lastName || "",
      email: r.requester.email,
      role: r.requester.role,
      grade: r.requester.studentDetails?.grade,
      subject: r.requester.teacherDetails?.subject,
    },
    receiver: {
      id: r.receiver.id,
      firstName: r.receiver.firstName || "",
      lastName: r.receiver.lastName || "",
      email: r.receiver.email,
      role: r.receiver.role,
      grade: r.receiver.studentDetails?.grade,
      subject: r.receiver.teacherDetails?.subject,
    },
    createdAt: r.createdAt,
  };
}
