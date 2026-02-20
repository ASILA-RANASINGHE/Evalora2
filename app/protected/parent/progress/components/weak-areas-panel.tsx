"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Target, MessageSquare } from "lucide-react";
import type { ParentWeakArea } from "@/lib/parent-progress-mock-data";

function GapBadge({ gap }: { gap: number }) {
  const color =
    gap >= 20
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      : gap >= 10
      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return <Badge className={`border-0 text-xs ${color}`}>Gap: {gap}%</Badge>;
}

export function WeakAreasPanel({ areas }: { areas: ParentWeakArea[] }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Areas Needing Attention
        </CardTitle>
        <CardDescription>Topics where Emma needs extra support</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {areas.map((area, i) => (
          <div key={area.topic} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-sm">{area.topic}</p>
                  <Badge variant="secondary" className="text-xs">{area.subject}</Badge>
                </div>
              </div>
              <GapBadge gap={area.gap} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Current Score</p>
                <p className="font-bold text-red-600 text-base">{area.currentScore}%</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> Target</p>
                <p className="font-bold text-emerald-600 text-base">{area.targetScore}%</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Last Practiced</p>
                <p className="font-semibold">{area.lastPracticed}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400 transition-all"
                  style={{ width: `${area.currentScore}%` }}
                />
              </div>
              <div className="relative h-1.5 w-full">
                <div
                  className="absolute top-0 h-full w-px bg-emerald-500"
                  style={{ left: `${area.targetScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">{area.suggestion}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
