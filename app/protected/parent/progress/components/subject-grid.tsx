"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import type { SubjectPerformance } from "@/lib/parent-progress-mock-data";

const masteryColors: Record<string, string> = {
  Expert: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  Advanced: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Proficient: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Learning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  Developing: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function scoreBorder(score: number) {
  if (score >= 80) return "border-l-4 border-l-emerald-500";
  if (score >= 60) return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-red-500";
}

function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function TrendIcon({ trend }: { trend: SubjectPerformance["trend"] }) {
  if (trend === "improving") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-amber-500" />;
}

function SubjectCard({ s }: { s: SubjectPerformance }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer ${scoreBorder(s.avgScore)}`}
      onClick={() => setExpanded((v) => !v)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base">{s.subject}</h4>
              <Badge className={`border-0 text-xs ${masteryColors[s.masteryLevel]}`}>
                {s.masteryLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {s.papersAttempted} papers · {s.quizzesAttempted} quizzes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon trend={s.trend} />
            <span className={`text-2xl font-bold ${scoreColor(s.avgScore)}`}>{s.avgScore}%</span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span>{s.avgScore}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreBar(s.avgScore)}`}
              style={{ width: `${s.avgScore}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground capitalize">
            Trend: <span className={s.trend === "improving" ? "text-emerald-500" : s.trend === "declining" ? "text-red-500" : "text-amber-500"}>{s.trend}</span>
          </span>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Topic breakdown
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {s.topics.map((t) => (
              <div key={t.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className={`font-semibold ${scoreColor(t.score)}`}>{t.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreBar(t.score)}`}
                    style={{ width: `${t.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SubjectGrid({ subjects }: { subjects: SubjectPerformance[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Above 80%</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> 60–80%</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> Below 60%</span>
        <span className="ml-1 text-muted-foreground">· Click a card to see topic breakdown</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <SubjectCard key={s.subject} s={s} />
        ))}
      </div>
    </div>
  );
}
