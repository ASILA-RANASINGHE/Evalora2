"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import type { SubjectScore } from "@/lib/student-progress-mock-data";

export function SubjectBreakdown({ data }: { data: SubjectScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Subject Comparison</CardTitle>
        <CardDescription>Your score vs class average by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="subject"
              type="category"
              tick={{ fontSize: 12 }}
              width={75}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
              formatter={(value, name) => [`${value}%`, name === "yourScore" ? "Your Score" : "Class Average"]}
            />
            <Legend formatter={(value) => (value === "yourScore" ? "Your Score" : "Class Average")} />
            <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="8 4" label={{ value: "Target", position: "top", fontSize: 11, fill: "#ef4444" }} />
            <Bar dataKey="yourScore" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={16} />
            <Bar dataKey="classAvg" fill="#d1d5db" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {data.map((s) => (
            <div key={s.subject} className="text-center">
              <span className="text-xs text-muted-foreground">{s.papersAttempted} papers</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
