"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import type { ScoreDataPoint } from "@/lib/student-progress-mock-data";

const SUBJECT_COLORS: Record<string, string> = {
  overall: "#7c3aed",
  history: "#6366f1",
  mathematics: "#2563eb",
  science: "#10b981",
  english: "#f59e0b",
};

const TIME_RANGES = ["Weekly", "Monthly", "All"] as const;

export function PerformanceChart({ data }: { data: ScoreDataPoint[] }) {
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("All");
  const [activeLines, setActiveLines] = useState<Set<string>>(new Set(["overall"]));

  const filteredData =
    range === "Weekly" ? data.slice(-4) : range === "Monthly" ? data.slice(-8) : data;

  const toggleLine = (key: string) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const subjects = ["overall", "history", "mathematics", "science", "english"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Performance Over Time</CardTitle>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                range === r ? "bg-white text-purple-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => toggleLine(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                activeLines.has(s)
                  ? "border-transparent text-white"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
              style={activeLines.has(s) ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
            />
            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="8 4" label={{ value: "Target 75%", position: "right", fontSize: 11, fill: "#ef4444" }} />
            {subjects.map((s) =>
              activeLines.has(s) ? (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={SUBJECT_COLORS[s]}
                  strokeWidth={s === "overall" ? 3 : 2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
