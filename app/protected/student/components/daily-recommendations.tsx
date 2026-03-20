"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, TrendingUp } from "lucide-react";
import { practiceRecommendations } from "@/lib/student-progress-mock-data";

const PRIORITY_STYLES = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export function DailyRecommendations() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Daily Practice Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {practiceRecommendations.map((rec, i) => (
          <div key={i} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${PRIORITY_STYLES[rec.priority]}`} />
                <Badge variant="secondary" className="text-xs">{rec.subject}</Badge>
                <span className="font-semibold text-sm">{rec.topic}</span>
              </div>
            </div>

            <ol className="space-y-1 ml-4">
              {rec.steps.map((step, si) => (
                <li key={si} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-purple-500 font-bold">{si + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> ~{rec.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" /> {rec.expectedImprovement}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
