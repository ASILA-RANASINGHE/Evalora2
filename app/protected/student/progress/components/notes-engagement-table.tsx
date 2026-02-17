"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import type { NoteEngagement } from "@/lib/student-progress-mock-data";

const STATUS_ICONS = {
  complete: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  "in-progress": <Clock className="h-4 w-4 text-amber-500" />,
  "not-started": <Circle className="h-4 w-4 text-gray-300" />,
};

export function NotesEngagementTable({ data }: { data: NoteEngagement[] }) {
  const subjects = [...new Set(data.map((d) => d.subject))];
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const filtered = selectedSubject === "All" ? data : data.filter((d) => d.subject === selectedSubject);

  const totalRead = filtered.reduce((s, d) => s + d.notesRead, 0);
  const totalAvailable = filtered.reduce((s, d) => s + d.totalNotes, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notes Engagement</CardTitle>
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
                <th className="pb-3 font-medium text-center">Notes Read</th>
                <th className="pb-3 font-medium text-center">Time Spent</th>
                <th className="pb-3 font-medium">Completion</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={`${n.subject}-${n.topic}`} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3">
                    <div className="font-medium">{n.topic}</div>
                    {selectedSubject === "All" && (
                      <div className="text-xs text-muted-foreground">{n.subject}</div>
                    )}
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {n.notesRead}/{n.totalNotes}
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {n.timeSpentMin > 0 ? `${n.timeSpentMin} min` : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={n.completionPct} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground">{n.completionPct}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {STATUS_ICONS[n.status]}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td className="py-3 font-semibold" colSpan={1}>Overall</td>
                <td className="py-3 text-center font-semibold">{totalRead}/{totalAvailable}</td>
                <td className="py-3 text-center font-semibold">
                  {filtered.reduce((s, d) => s + d.timeSpentMin, 0)} min
                </td>
                <td className="py-3" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <Progress value={totalAvailable > 0 ? Math.round((totalRead / totalAvailable) * 100) : 0} className="h-2 w-20" />
                    <span className="text-xs font-semibold">
                      {totalAvailable > 0 ? Math.round((totalRead / totalAvailable) * 100) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
