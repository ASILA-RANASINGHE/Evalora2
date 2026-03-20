"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target, CalendarDays, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { ParentOverviewStats } from "@/lib/parent-progress-mock-data";

export function ParentOverviewCards({ stats }: { stats: ParentOverviewStats }) {
  const timeDiff = stats.studyTimeThisWeek - stats.studyTimeLastWeek;
  const timeUp = timeDiff >= 0;

  const cards = [
    {
      title: "Study Time This Week",
      value: `${stats.studyTimeThisWeek}h`,
      subtitle: `${timeUp ? "+" : ""}${timeDiff.toFixed(1)}h vs last week`,
      icon: Clock,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      trendUp: timeUp,
    },
    {
      title: "Current Average Score",
      value: `${stats.avgScore}%`,
      subtitle: `${stats.scoreTrend > 0 ? "+" : ""}${stats.scoreTrend}% vs last week`,
      icon: Target,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      trendUp: stats.scoreTrend >= 0,
    },
    {
      title: "Active Days This Week",
      value: `${stats.activeDaysThisWeek} / 7`,
      subtitle: `${stats.currentStreak}-day current streak`,
      icon: CalendarDays,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      trendUp: stats.activeDaysThisWeek >= 5,
    },
    {
      title: "Areas Needing Attention",
      value: stats.weakTopicsCount.toString(),
      subtitle: "topics below target",
      icon: AlertTriangle,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      trendUp: stats.weakTopicsCount === 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
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
                {card.trendUp
                  ? <TrendingUp className="h-3 w-3" />
                  : <TrendingDown className="h-3 w-3" />}
                {card.subtitle}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight">{card.value}</div>
              <p className="text-sm font-medium text-muted-foreground mt-1">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
