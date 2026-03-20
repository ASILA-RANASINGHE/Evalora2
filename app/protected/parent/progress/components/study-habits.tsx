"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Star, AlertCircle, BookOpen, Lightbulb } from "lucide-react";
import type { StudyHabitInsight } from "@/lib/parent-progress-mock-data";

const iconMap = {
  clock: Clock,
  "trend-up": TrendingUp,
  "trend-down": TrendingDown,
  star: Star,
  alert: AlertCircle,
  book: BookOpen,
};

const typeStyles = {
  positive: {
    card: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800",
    icon: "bg-emerald-500/10 text-emerald-600",
    dot: "bg-emerald-500",
  },
  warning: {
    card: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
    icon: "bg-amber-500/10 text-amber-600",
    dot: "bg-amber-500",
  },
  info: {
    card: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
    icon: "bg-blue-500/10 text-blue-600",
    dot: "bg-blue-500",
  },
};

export function StudyHabitsInsights({ insights }: { insights: StudyHabitInsight[] }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-purple-500" />
          Study Habits Insights
        </CardTitle>
        <CardDescription>Automatically generated insights based on Emma's activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon];
          const styles = typeStyles[insight.type];
          return (
            <div key={insight.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${styles.card}`}>
              <div className={`p-2 rounded-lg shrink-0 ${styles.icon}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
