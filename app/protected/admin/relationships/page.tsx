"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mockRelationships,
  mockUsers,
  type TeacherStudentRelationship,
} from "@/lib/admin-mock-data";
import { Check, X, Plus, Link2 } from "lucide-react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function RelationshipsPage() {
  const [relationships, setRelationships] =
    useState<TeacherStudentRelationship[]>(mockRelationships);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const teachers = mockUsers.filter((u) => u.role === "TEACHER");
  const students = mockUsers.filter((u) => u.role === "STUDENT");

  const pendingRequests = relationships.filter((r) => r.status === "pending");
  const otherRelationships = relationships.filter((r) => r.status !== "pending");

  const handleApprove = (id: string) => {
    setRelationships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRelationships((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
  };

  const handleManualAssign = () => {
    if (!selectedTeacher || !selectedStudent) return;
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    const student = students.find((s) => s.id === selectedStudent);
    if (!teacher || !student) return;

    const newRelationship: TeacherStudentRelationship = {
      id: `r${Date.now()}`,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      status: "approved",
      requestedAt: new Date().toISOString().split("T")[0],
    };

    setRelationships((prev) => [...prev, newRelationship]);
    setSelectedTeacher("");
    setSelectedStudent("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Relationships</h2>
        <p className="text-sm text-muted-foreground">
          Manage teacher-student assignments and connection requests.
        </p>
      </div>

      {/* Manual Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Manual Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleManualAssign}
              disabled={!selectedTeacher || !selectedStudent}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Teacher</th>
                    <th className="px-4 py-3 text-left font-medium">Student</th>
                    <th className="px-4 py-3 text-left font-medium">Requested</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((rel) => (
                    <tr key={rel.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {rel.teacherName}
                      </td>
                      <td className="px-4 py-3">{rel.studentName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {rel.requestedAt}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`border-0 ${statusStyles[rel.status]}`}>
                          {rel.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(rel.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(rel.id)}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All Assignments ({relationships.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Requested</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((rel) => (
                  <tr key={rel.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {rel.teacherName}
                    </td>
                    <td className="px-4 py-3">{rel.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rel.requestedAt}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 ${statusStyles[rel.status]}`}>
                        {rel.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
