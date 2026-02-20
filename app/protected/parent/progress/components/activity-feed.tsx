"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BrainCircuit, BookOpen, Award, Flame, Activity } from "lucide-react";
import type { ActivityItem } from "@/lib/parent-progress-mock-data";

const typeConfig: Record<ActivityItem["type"], { icon: any; label: string; iconBg: string; iconColor: string }> = {
  paper: { icon: FileText, label: "Paper", iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
  quiz: { icon: BrainCircuit, label: "Quiz", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
  note: { icon: BookOpen, label: "Notes", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  achievement: { icon: Award, label: "Achievement", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  streak: { icon: Flame, label: "Streak", iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
      : score >= 60
      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  return <Badge className={`border-0 text-xs font-bold ${color}`}>{score}%</Badge>;
}

export function RecentActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-500" />
          Recent Activity
        </CardTitle>
        <CardDescription>Last 10 learning activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors border border-border/40">
              <div className={`p-2 rounded-lg shrink-0 ${config.iconBg}`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.score !== undefined && <ScoreBadge score={item.score} />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0 text-right">{item.timestamp}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
