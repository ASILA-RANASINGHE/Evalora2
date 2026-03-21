"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Clock, Zap } from "lucide-react";
import type { TimeSlotPerformance } from "@/lib/student-progress-mock-data";

export function TimeAnalyticsChart({ data }: { data: TimeSlotPerformance[] }) {
  const peak = data.reduce((max, d) => (d.avgScore > max.avgScore ? d : max), data[0]);
  const weakest = data.reduce((min, d) => (d.avgScore < min.avgScore ? d : min), data[0]);

  return (
    <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Performance by Time of Day</CardTitle>
            <CardDescription>When do you perform best?</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              <Zap className="h-3 w-3" /> Peak: {peak.hour} ({peak.avgScore}%)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              <Clock className="h-3 w-3" /> Weakest: {weakest.hour} ({weakest.avgScore}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
              formatter={(value) => [`${value}%`, "Avg Score"]}
            />
            <Area
              type="monotone"
              dataKey="avgScore"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, strokeWidth: 2, fill: "white" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
