"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { getMyRelationships } from "@/lib/actions/relationships";

interface Connections {
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
}

export function MyConnections() {
  const [connections, setConnections] = useState<Connections>({
    teachers: [],
    students: [],
    parents: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyRelationships();
        setConnections(data);
      } catch (error) {
        console.error("Error loading connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const hasTeachers = connections.teachers.length > 0;
  const hasStudents = connections.students.length > 0;
  const hasParents = connections.parents.length > 0;

  if (!hasTeachers && !hasStudents && !hasParents) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No connections yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasTeachers && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              My Teachers ({connections.teachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {teacher.email}
                  </p>
                  {teacher.subject && (
                    <p className="text-xs text-muted-foreground">
                      Subject: {teacher.subject}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0"
                >
                  Connected
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasStudents && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              My Students ({connections.students.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.students.map((student) => (
              <div
                key={student.id}
                className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.email}
                  </p>
                  {student.grade && (
                    <p className="text-xs text-muted-foreground">
                      Grade: {student.grade}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0"
                >
                  Connected
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasParents && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              My Parents ({connections.parents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.parents.map((parent) => (
              <div
                key={parent.id}
                className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{parent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parent.email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0"
                >
                  Connected
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
