"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Table2 } from "lucide-react";
import type { TopicDifficultyRow, Student } from "@/lib/teacher-mock-data";

interface TopicDifficultyProps {
  topics: TopicDifficultyRow[];
  students: Student[];
}

const STATUS_STYLES = {
  Easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const SUBJECT_COLORS: Record<string, string> = {
  History:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Geography: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Civics:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

function accuracyColor(val: number) {
  if (val >= 75) return "bg-emerald-500";
  if (val >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function TopicDifficulty({ topics, students }: TopicDifficultyProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const uniqueSubjects = Array.from(new Set(topics.map((t) => t.subject)));

  const filtered = subjectFilter === "All" ? topics : topics.filter((t) => t.subject === subjectFilter);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Table2 className="h-4 w-4 text-blue-500" />
              Topic Difficulty Analysis
            </CardTitle>
            <CardDescription>Click a row to see which students are struggling</CardDescription>
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-sm border border-input rounded-md px-3 py-1.5 bg-background h-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="All">All Subjects</option>
            {uniqueSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Topic</th>
                <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Subject</th>
                <th className="pb-2 text-left font-medium text-muted-foreground text-xs">Avg Accuracy</th>
                <th className="pb-2 text-center font-medium text-muted-foreground text-xs">Attempted</th>
                <th className="pb-2 text-center font-medium text-muted-foreground text-xs">Struggling</th>
                <th className="pb-2 text-center font-medium text-muted-foreground text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((topic) => {
                const isExpanded = expandedTopic === topic.topic;
                const strugglingStudents = students.filter((s) => topic.strugglingStudentIds.includes(s.id));
                return (
                  <>
                    <tr
                      key={topic.topic}
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.topic)}
                      className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          <span className="font-medium">{topic.topic}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SUBJECT_COLORS[topic.subject] ?? "bg-gray-100 text-gray-600"}`}>
                          {topic.subject}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                            <div className={`h-full rounded-full ${accuracyColor(topic.avgAccuracy)}`} style={{ width: `${topic.avgAccuracy}%` }} />
                          </div>
                          <span className="text-xs font-medium w-8">{topic.avgAccuracy}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-muted-foreground">{topic.studentsAttempted}</td>
                      <td className="py-3 text-center">
                        <span className={`font-semibold ${topic.studentsStruggling > 3 ? "text-red-600" : topic.studentsStruggling > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {topic.studentsStruggling}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[topic.status]}`}>
                          {topic.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${topic.topic}-expanded`} className="bg-muted/20">
                        <td colSpan={6} className="py-3 px-6">
                          {strugglingStudents.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No students currently struggling with this topic.</p>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">Students struggling ({strugglingStudents.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {strugglingStudents.map((s) => (
                                  <div key={s.id} className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-2.5 py-1">
                                    <span className="text-xs font-medium text-red-700 dark:text-red-400">{s.name}</span>
                                    <span className="text-[10px] text-muted-foreground">({s.grade})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
