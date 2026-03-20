"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import type { ScoreDistributionBucket } from "@/lib/teacher-mock-data";

interface ClassDistributionProps {
  data: ScoreDistributionBucket[];
}

const BAR_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#10b981", "#7c3aed"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} student{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export function ClassDistribution({ data }: ClassDistributionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          Score Distribution
        </CardTitle>
        <CardDescription>How many students fall in each score range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {data.map((d, i) => (
            <div key={d.range} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
              <span className="text-xs text-muted-foreground">{d.range}: {d.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
