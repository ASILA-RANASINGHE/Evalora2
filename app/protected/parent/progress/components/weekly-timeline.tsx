"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CalendarDays } from "lucide-react";
import type { DayActivity } from "@/lib/parent-progress-mock-data";

const levelColor: Record<string, string> = {
  high: "#8b5cf6",
  medium: "#6366f1",
  low: "#a78bfa",
  none: "#e2e8f0",
};

const levelLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No Activity",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: DayActivity = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs space-y-1.5 min-w-40">
      <p className="font-semibold text-sm">{d.fullDate} ({d.date})</p>
      <p className="text-muted-foreground">Study time: <span className="font-semibold text-foreground">{d.studyMinutes} min</span></p>
      <p className="text-muted-foreground">Papers: <span className="font-semibold text-foreground">{d.papersCompleted}</span></p>
      <p className="text-muted-foreground">Quizzes: <span className="font-semibold text-foreground">{d.quizzesCompleted}</span></p>
      <p className="text-muted-foreground">Activity: <span className="font-semibold" style={{ color: levelColor[d.activityLevel] }}>{levelLabel[d.activityLevel]}</span></p>
    </div>
  );
}

export function WeeklyTimeline({ data }: { data: DayActivity[] }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Weekly Activity Timeline
            </CardTitle>
            <CardDescription>Daily study activity over the past 14 days</CardDescription>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            {Object.entries(levelColor).map(([level, color]) => (
              <span key={level} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
                {levelLabel[level]}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                label={{ value: "min", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
              <Bar dataKey="studyMinutes" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={levelColor[entry.activityLevel]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
