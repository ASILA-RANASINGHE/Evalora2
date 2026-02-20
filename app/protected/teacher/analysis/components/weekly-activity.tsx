"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import type { WeeklyActivityPoint } from "@/lib/teacher-mock-data";

interface WeeklyActivityProps {
  data: WeeklyActivityPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}{p.dataKey === "studyHours" ? "h" : p.dataKey === "avgEngagement" ? "%" : ""}</span>
        </p>
      ))}
    </div>
  );
}

export function WeeklyActivity({ data }: WeeklyActivityProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          Weekly Activity Overview
        </CardTitle>
        <CardDescription>Class engagement and output over the last 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 80]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line yAxisId="left" type="monotone" dataKey="avgEngagement" name="Engagement %" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
              <Line yAxisId="right" type="monotone" dataKey="papersCompleted" name="Papers" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
              <Line yAxisId="right" type="monotone" dataKey="studyHours" name="Study Hours" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 3" dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
