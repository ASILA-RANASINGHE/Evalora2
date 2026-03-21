"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { QuestionTypeStats } from "@/lib/student-progress-mock-data";

export function QuestionTypeChart({ data }: { data: QuestionTypeStats[] }) {
  const total = data.reduce((sum, d) => sum + d.attempted, 0);

  return (
    <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
      <CardHeader>
        <CardTitle className="text-lg">Question Type Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="attempted"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  formatter={(value) => [`${value} questions`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {data.map((d) => (
              <div key={d.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <div>
                    <div className="font-medium text-sm">{d.type}</div>
                    <div className="text-xs text-muted-foreground">{d.attempted} attempted</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{d.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">accuracy</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
