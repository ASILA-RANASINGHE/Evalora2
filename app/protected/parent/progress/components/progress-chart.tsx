"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import type { MonthlyScore } from "@/lib/parent-progress-mock-data";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold">{label}</p>
      <p className="text-purple-500 font-bold">Avg Score: {payload[0].value}%</p>
    </div>
  );
}

export function ProgressChart({ data }: { data: MonthlyScore[] }) {
  const first = data[0]?.avgScore ?? 0;
  const last = data[data.length - 1]?.avgScore ?? 0;
  const diff = last - first;
  const trend = diff > 2 ? "Improving" : diff < -2 ? "Declining" : "Stable";
  const trendColor = diff > 2 ? "text-emerald-600" : diff < -2 ? "text-red-600" : "text-amber-600";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Progress Over Time
            </CardTitle>
            <CardDescription>Average score trend over the last 3 months</CardDescription>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${trendColor}`}>{trend}</p>
            <p className="text-xs text-muted-foreground">
              {diff >= 0 ? "+" : ""}{diff}% since {data[0]?.month}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={75}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: "Target 75%", position: "insideTopRight", fontSize: 10, fill: "#10b981" }}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 6, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3">
          {data.map((d) => (
            <div key={d.month} className="text-center">
              <p className="text-lg font-bold text-purple-600">{d.avgScore}%</p>
              <p className="text-xs text-muted-foreground">{d.month}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
