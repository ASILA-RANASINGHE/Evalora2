"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubjectComparison } from "@/lib/parent-progress-mock-data";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs space-y-1.5">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}%</span></p>
      ))}
    </div>
  );
}

export function PeerComparison({ data }: { data: SubjectComparison[] }) {
  const [visible, setVisible] = useState(true);

  const overallPercentile = Math.round(data.reduce((s, d) => s + d.percentileRank, 0) / data.length);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Comparison with Class
            </CardTitle>
            <CardDescription>Emma's scores vs class average by subject</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-0 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              Top {100 - overallPercentile}% overall
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {visible ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {visible && (
        <CardContent>
          <div className="h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="childScore" name="Emma" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="classAvg" name="Class Avg" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.map((d) => {
              const above = d.childScore >= d.classAvg;
              return (
                <div key={d.subject} className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium">{d.subject}</p>
                  <p className={`text-sm font-bold mt-0.5 ${above ? "text-emerald-600" : "text-red-600"}`}>
                    {above ? "+" : ""}{d.childScore - d.classAvg}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Top {100 - d.percentileRank}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
