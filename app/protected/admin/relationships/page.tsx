"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Plus,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  Users,
  GraduationCap,
} from "lucide-react";
import {
  getAllRelationships,
  getAllPendingRequests,
  adminApproveRequest,
  adminRejectRequest,
  adminCreateRelationship,
  searchAllUsers,
} from "@/lib/actions/admin-relationships";
import { RelationshipType, UserRole } from "@/lib/generated/prisma/enums";

interface PendingRequest {
  id: string;
  type: RelationshipType;
  requesterName: string;
  requesterEmail: string;
  requesterRole: UserRole;
  receiverName: string;
  receiverEmail: string;
  receiverRole: UserRole;
  createdAt: Date;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  grade?: string;
  subject?: string;
}

export default function RelationshipsPage() {
  const [activeTab, setActiveTab] = useState("teacher-student");
  const [teacherStudentRels, setTeacherStudentRels] = useState<any[]>([]);
  const [parentStudentRels, setParentStudentRels] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual assignment state
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [searchResults1, setSearchResults1] = useState<SearchResult[]>([]);
  const [searchResults2, setSearchResults2] = useState<SearchResult[]>([]);
  const [selectedUser1, setSelectedUser1] = useState<SearchResult | null>(null);
  const [selectedUser2, setSelectedUser2] = useState<SearchResult | null>(null);
  const [assignType, setAssignType] = useState<"TEACHER_STUDENT" | "PARENT_STUDENT">("TEACHER_STUDENT");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSearching1, setIsSearching1] = useState(false);
  const [isSearching2, setIsSearching2] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rels, requests] = await Promise.all([
        getAllRelationships(),
        getAllPendingRequests(),
      ]);
      setTeacherStudentRels(rels.teacherStudent);
      setParentStudentRels(rels.parentStudent);
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await adminApproveRequest(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.error || "Failed to approve");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await adminRejectRequest(id);
      if (result.success) {
        await loadData();
      } else {
        alert(result.error || "Failed to reject");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch1 = async () => {
    if (searchQuery1.length < 2) return;
    setIsSearching1(true);
    try {
      const role = assignType === "TEACHER_STUDENT" ? UserRole.TEACHER : UserRole.PARENT;
      const results = await searchAllUsers(searchQuery1, role);
      setSearchResults1(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching1(false);
    }
  };

  const handleSearch2 = async () => {
    if (searchQuery2.length < 2) return;
    setIsSearching2(true);
    try {
      const results = await searchAllUsers(searchQuery2, UserRole.STUDENT);
      setSearchResults2(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching2(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedUser1 || !selectedUser2) return;
    setIsAssigning(true);
    try {
      const result = await adminCreateRelationship(
        selectedUser1.id,
        selectedUser2.id,
        assignType === "TEACHER_STUDENT"
          ? RelationshipType.TEACHER_STUDENT
          : RelationshipType.PARENT_STUDENT
      );
      if (result.success) {
        setSelectedUser1(null);
        setSelectedUser2(null);
        setSearchQuery1("");
        setSearchQuery2("");
        setSearchResults1([]);
        setSearchResults2([]);
        await loadData();
      } else {
        alert(result.error || "Failed to create relationship");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">
            Relationships
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage teacher-student and parent-student connections.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Manual Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Manual Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={assignType === "TEACHER_STUDENT" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAssignType("TEACHER_STUDENT");
                setSelectedUser1(null);
                setSearchResults1([]);
                setSearchQuery1("");
              }}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Teacher-Student
            </Button>
            <Button
              variant={assignType === "PARENT_STUDENT" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAssignType("PARENT_STUDENT");
                setSelectedUser1(null);
                setSearchResults1([]);
                setSearchQuery1("");
              }}
            >
              <Users className="h-3 w-3 mr-1" />
              Parent-Student
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* User 1 search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {assignType === "TEACHER_STUDENT" ? "Teacher" : "Parent"}
              </label>
              {selectedUser1 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedUser1.firstName} {selectedUser1.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser1.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser1(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery1}
                      onChange={(e) => setSearchQuery1(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch1()}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleSearch1}
                      disabled={isSearching1}
                    >
                      {isSearching1 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {searchResults1.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded-md">
                      {searchResults1.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUser1(u);
                            setSearchResults1([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                        >
                          {u.firstName} {u.lastName}{" "}
                          <span className="text-muted-foreground">
                            ({u.email})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User 2 search (Student) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Student</label>
              {selectedUser2 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedUser2.firstName} {selectedUser2.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser2.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser2(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery2}
                      onChange={(e) => setSearchQuery2(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch2()}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleSearch2}
                      disabled={isSearching2}
                    >
                      {isSearching2 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {searchResults2.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded-md">
                      {searchResults2.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUser2(u);
                            setSearchResults2([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                        >
                          {u.firstName} {u.lastName}{" "}
                          <span className="text-muted-foreground">
                            ({u.email})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleManualAssign}
            disabled={!selectedUser1 || !selectedUser2 || isAssigning}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isAssigning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Link2 className="mr-2 h-4 w-4" />
            )}
            Assign
          </Button>
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
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">From</th>
                    <th className="px-4 py-3 text-left font-medium">To</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            req.type === "TEACHER_STUDENT"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }
                        >
                          {req.type === "TEACHER_STUDENT"
                            ? "Teacher-Student"
                            : "Parent-Student"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{req.requesterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.requesterRole.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{req.receiverName}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.receiverRole.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingId === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
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
      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="teacher-student">
            Teacher-Student ({teacherStudentRels.length})
          </TabsTrigger>
          <TabsTrigger value="parent-student">
            Parent-Student ({parentStudentRels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teacher-student" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Teacher-Student Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {teacherStudentRels.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No teacher-student relationships yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">
                          Teacher
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Since
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStudentRels.map((rel: any) => (
                        <tr
                          key={rel.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {rel.teacherName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {rel.teacherSubject || "—"}
                          </td>
                          <td className="px-4 py-3">{rel.studentName}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {rel.studentGrade || "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(rel.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parent-student" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Parent-Student Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {parentStudentRels.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No parent-student relationships yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">
                          Parent
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Since
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentStudentRels.map((rel: any) => (
                        <tr
                          key={rel.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {rel.parentName}
                          </td>
                          <td className="px-4 py-3">{rel.studentName}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {rel.studentGrade || "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(rel.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
