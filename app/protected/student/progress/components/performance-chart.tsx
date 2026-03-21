"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { PerformanceDataPoint } from "@/lib/actions/analytics";

const PALETTE = [
  "#6366f1", "#2563eb", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316",
];

const TIME_RANGES = ["Weekly", "Monthly", "All"] as const;

export function PerformanceChart({
  data,
  subjects = [],
}: {
  data: PerformanceDataPoint[];
  subjects?: string[];
}) {
  const allKeys = ["overall", ...subjects];
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

  const colorFor = (key: string) => {
    if (key === "overall") return "#7c3aed";
    const idx = subjects.indexOf(key);
    return PALETTE[idx % PALETTE.length];
  };

  const labelFor = (key: string) =>
    key === "overall"
      ? "Overall"
      : key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (data.length === 0) {
    return (
      <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
        <CardHeader>
          <CardTitle className="text-lg">Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No attempt data yet. Complete quizzes or papers to see your progress here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
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
          {allKeys.map((key) => (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                activeLines.has(key)
                  ? "border-transparent text-white"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
              style={activeLines.has(key) ? { backgroundColor: colorFor(key) } : undefined}
            >
              {labelFor(key)}
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
            <ReferenceLine
              y={75}
              stroke="#ef4444"
              strokeDasharray="8 4"
              label={{ value: "Target 75%", position: "right", fontSize: 11, fill: "#ef4444" }}
            />
            {allKeys.map((key) =>
              activeLines.has(key) ? (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={labelFor(key)}
                  stroke={colorFor(key)}
                  strokeWidth={key === "overall" ? 3 : 2}
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
