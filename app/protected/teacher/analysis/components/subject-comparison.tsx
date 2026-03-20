"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, ResponsiveContainer } from "recharts";
import { BookOpen } from "lucide-react";
import type { SubjectPerformanceSummary } from "@/lib/teacher-mock-data";

interface SubjectComparisonProps {
  data: SubjectPerformanceSummary[];
}

function barColor(score: number) {
  if (score >= 75) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs">
      <p className="font-semibold">{label}</p>
      <p>Class Avg: <span className="font-bold">{payload[0].value}%</span></p>
      <p className="text-muted-foreground">{payload[0].payload.studentsCount} students</p>
    </div>
  );
}

export function SubjectComparison({ data }: SubjectComparisonProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          Subject Performance
        </CardTitle>
        <CardDescription>Class average score per subject (target: 75%)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="subject" type="category" width={72} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={75} stroke="#10b981" strokeDasharray="4 4" label={{ value: "75%", position: "top", fontSize: 10, fill: "#10b981" }} />
              <Bar dataKey="classAvg" radius={[0, 4, 4, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={barColor(d.classAvg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          {data.map((d) => (
            <div key={d.subject} className="text-center">
              <p className={`text-lg font-bold ${d.classAvg >= 75 ? "text-emerald-600" : d.classAvg >= 60 ? "text-amber-500" : "text-red-500"}`}>
                {d.classAvg}%
              </p>
              <p className="text-xs text-muted-foreground">{d.subject}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
