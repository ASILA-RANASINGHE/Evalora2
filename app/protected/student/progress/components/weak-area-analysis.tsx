"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import type { WeakArea } from "@/lib/student-progress-mock-data";

export function WeakAreaAnalysis({ data }: { data: WeakArea[] }) {
  const chartData = data.map((d) => ({
    topic: d.topic.length > 20 ? d.topic.slice(0, 18) + "…" : d.topic,
    accuracy: d.accuracy,
    fullTopic: d.topic,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Prioritized List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Weak Areas
          </CardTitle>
          <CardDescription>Topics needing immediate attention, sorted by gap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((area) => (
            <div
              key={`${area.subject}-${area.topic}`}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{area.topic}</h4>
                  <Badge variant="secondary" className="text-xs mt-1">{area.subject}</Badge>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold text-sm">{area.accuracy}%</span>
                  <span className="text-muted-foreground text-xs"> / {area.target}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Gap: <span className="font-semibold text-red-600">{area.gap}%</span></span>
                <span>{area.daysSincePracticed} days since practiced</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/protected/student/quizzes/subject/${area.subject.toLowerCase()}`}>
                  <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700">
                    Practice Now
                  </Button>
                </Link>
                <Link href={`/protected/student/notes/subject/${area.subject.toLowerCase()}`}>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" /> View Notes
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Knowledge Gap Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Knowledge Gap</CardTitle>
          <CardDescription>Accuracy per topic vs 75% target</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={95} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                formatter={(value) => [`${value}%`, "Accuracy"]}
                labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullTopic ?? _label}
              />
              <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="8 4" label={{ value: "75%", position: "top", fontSize: 11, fill: "#ef4444" }} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.accuracy >= 75 ? "#10b981" : entry.accuracy >= 55 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
