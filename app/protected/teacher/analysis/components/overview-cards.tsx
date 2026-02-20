import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Target, FileText, Clock, AlertTriangle } from "lucide-react";
import type { TeacherAnalyticsData } from "@/lib/teacher-mock-data";

interface OverviewCardsProps {
  stats: TeacherAnalyticsData["overviewStats"];
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      suffix: "",
    },
    {
      label: "Active This Week",
      value: stats.activeThisWeek,
      icon: Activity,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      suffix: "",
      badge: `${Math.round((stats.activeThisWeek / stats.totalStudents) * 100)}%`,
    },
    {
      label: "Class Average",
      value: stats.classAverage,
      icon: Target,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      suffix: "%",
    },
    {
      label: "Papers This Week",
      value: stats.papersCompletedThisWeek,
      icon: FileText,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
      suffix: "",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      iconBg: stats.pendingReviews > 0 ? "bg-amber-500/10" : "bg-gray-500/10",
      iconColor: stats.pendingReviews > 0 ? "text-amber-600" : "text-gray-500",
      suffix: "",
      highlight: stats.pendingReviews > 0,
    },
    {
      label: "Students At Risk",
      value: stats.studentsAtRisk,
      icon: AlertTriangle,
      iconBg: stats.studentsAtRisk > 0 ? "bg-red-500/10" : "bg-gray-500/10",
      iconColor: stats.studentsAtRisk > 0 ? "text-red-600" : "text-gray-500",
      suffix: "",
      highlight: stats.studentsAtRisk > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`border-border/50 shadow-sm ${card.highlight ? "border-l-4 border-l-red-400" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                {card.badge && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold ${card.highlight ? "text-red-600" : ""}`}>
                {card.value}{card.suffix}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
