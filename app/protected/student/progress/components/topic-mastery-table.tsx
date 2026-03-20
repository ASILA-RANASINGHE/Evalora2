"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import type { TopicMastery } from "@/lib/student-progress-mock-data";

const STATUS_STYLES: Record<TopicMastery["status"], string> = {
  Mastered: "bg-emerald-100 text-emerald-700",
  Learning: "bg-blue-100 text-blue-700",
  "Needs Work": "bg-amber-100 text-amber-700",
  Weak: "bg-red-100 text-red-700",
};

const PROGRESS_COLORS: Record<TopicMastery["status"], string> = {
  Mastered: "[&>div]:bg-emerald-500",
  Learning: "[&>div]:bg-blue-500",
  "Needs Work": "[&>div]:bg-amber-500",
  Weak: "[&>div]:bg-red-500",
};

export function TopicMasteryTable({ data }: { data: TopicMastery[] }) {
  const subjects = [...new Set(data.map((d) => d.subject))];
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const filtered = selectedSubject === "All" ? data : data.filter((d) => d.subject === selectedSubject);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Topic Mastery</CardTitle>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 bg-background"
        >
          <option value="All">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Topic</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium text-center">Questions</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={`${t.subject}-${t.topic}`} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3">
                    <div className="font-medium">{t.topic}</div>
                    {selectedSubject === "All" && (
                      <div className="text-xs text-muted-foreground">{t.subject}</div>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Progress value={t.accuracy} className={`h-2 w-20 ${PROGRESS_COLORS[t.status]}`} />
                      <span className="font-medium">{t.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{t.questionsAttempted}</td>
                  <td className="py-3 text-center">
                    <Badge className={STATUS_STYLES[t.status]}>{t.status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    {(t.status === "Weak" || t.status === "Needs Work") && (
                      <Link href={`/protected/student/quizzes/subject/${t.subject.toLowerCase()}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Practice Now
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
