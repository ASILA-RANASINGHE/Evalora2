"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown, Eye, Mail, Users } from "lucide-react";
import type { Student } from "@/lib/teacher-mock-data";

interface StudentListProps {
  students: Student[];
  onViewDetails: (studentId: number) => void;
}

type StatusFilter = "All" | "Active" | "At Risk" | "Inactive";
type GradeFilter = "All" | "Grade 9" | "Grade 10" | "Grade 11";
type SortBy = "name" | "score" | "lastActive" | "papers" | "trend";

const STATUS_STYLES = {
  Active:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "At Risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Inactive:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const TREND_ICON = { up: ArrowUp, down: ArrowDown, stable: Minus };
const TREND_COLOR = { up: "text-emerald-600", down: "text-red-500", stable: "text-amber-500" };
const TREND_ORDER = { up: 1, stable: 0, down: -1 };

function rowBg(student: Student) {
  if (student.status === "Inactive") return "bg-gray-50/50 dark:bg-gray-900/20";
  if (student.avgScore >= 75) return "bg-emerald-50/30 dark:bg-emerald-950/10";
  if (student.avgScore >= 60) return "bg-amber-50/30 dark:bg-amber-950/10";
  return "bg-red-50/30 dark:bg-red-950/10";
}

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function StudentList({ students, onViewDetails }: StudentListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("All");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(col: SortBy) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    return [...students]
      .filter((s) => statusFilter === "All" || s.status === statusFilter)
      .filter((s) => gradeFilter === "All" || s.grade === gradeFilter)
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name")       cmp = a.name.localeCompare(b.name);
        if (sortBy === "score")      cmp = a.avgScore - b.avgScore;
        if (sortBy === "papers")     cmp = a.papersCompleted - b.papersCompleted;
        if (sortBy === "lastActive") cmp = a.lastActive.localeCompare(b.lastActive);
        if (sortBy === "trend")      cmp = TREND_ORDER[a.trend] - TREND_ORDER[b.trend];
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [students, statusFilter, gradeFilter, sortBy, sortDir]);

  function SortIcon({ col }: { col: SortBy }) {
    if (sortBy !== col) return <ChevronDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-purple-500" />
      : <ChevronDown className="h-3 w-3 text-purple-500" />;
  }

  const selectClass = "text-sm border border-input rounded-md px-3 py-1.5 bg-background h-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Student Roster
            </CardTitle>
            <CardDescription>
              Showing {filtered.length} of {students.length} students
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={selectClass}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="At Risk">At Risk</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value as GradeFilter)} className={selectClass}>
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { label: "Student", col: "name" as SortBy },
                  { label: "Grade", col: null },
                  { label: "Avg Score", col: "score" as SortBy },
                  { label: "Trend", col: "trend" as SortBy },
                  { label: "Papers", col: "papers" as SortBy },
                  { label: "Last Active", col: "lastActive" as SortBy },
                  { label: "Status", col: null },
                  { label: "Actions", col: null },
                ].map(({ label, col }) => (
                  <th key={label} className="pb-2 text-left font-medium text-muted-foreground text-xs">
                    {col ? (
                      <button onClick={() => handleSort(col)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        {label} <SortIcon col={col} />
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const TrendIcon = TREND_ICON[student.trend];
                return (
                  <tr key={student.id} className={`border-b border-border/40 transition-colors hover:brightness-95 ${rowBg(student)}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold shrink-0">
                          {initials(student.name)}
                        </div>
                        <span className="font-medium whitespace-nowrap">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{student.grade}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${scoreColor(student.avgScore)}`}>{student.avgScore}%</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className={`flex items-center gap-1 font-medium ${TREND_COLOR[student.trend]}`}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        <span className="text-xs capitalize">{student.trend}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{student.papersCompleted}</td>
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap text-xs">{student.lastActive}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[student.status]}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onViewDetails(student.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No students match the selected filters.</p>
          )}
        </div>
        {/* Color legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Row color:</span>
          {[
            { label: "≥75% (Good)", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "60–74% (Average)", bg: "bg-amber-100 dark:bg-amber-900/30" },
            { label: "<60% (Needs Help)", bg: "bg-red-100 dark:bg-red-900/30" },
            { label: "Inactive", bg: "bg-gray-200 dark:bg-gray-700" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`h-3 w-5 rounded-sm ${item.bg}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
