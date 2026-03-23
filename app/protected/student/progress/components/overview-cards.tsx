"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Target, Flame, Medal, TrendingUp, TrendingDown } from "lucide-react";
import type { OverviewStats } from "@/lib/student-progress-mock-data";

export function OverviewCards({ stats }: { stats: OverviewStats }) {
  const cards = [
    {
      title: "Papers Done",
      value: stats.papersDone.toString(),
      subtitle: `+${stats.papersWeekly} this week`,
      icon: FileText,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      trendUp: true,
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      subtitle: `${stats.scoreTrend > 0 ? "+" : ""}${stats.scoreTrend}% vs last week`,
      icon: Target,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      trendUp: stats.scoreTrend > 0,
    },
    {
      title: "Study Streak",
      value: `${stats.studyStreak} Days`,
      subtitle: `Best: ${stats.bestStreak} days`,
      icon: Flame,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      trendUp: true,
    },
    {
      title: "Rank",
      value: `#${stats.rank}`,
      subtitle: `of ${stats.totalStudents} • Top ${100 - stats.percentile}%`,
      icon: Medal,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/15 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                card.trendUp
                  ? "text-emerald-600 bg-emerald-500/10"
                  : "text-red-600 bg-red-500/10"
              }`}>
                {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {card.subtitle}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight text-foreground">{card.value}</div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
