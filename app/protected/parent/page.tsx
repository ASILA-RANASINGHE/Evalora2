import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  CalendarDays,
  BookOpen,
  Clock,
  ChevronRight,
  FileText,
  BrainCircuit,
  Award,
} from "lucide-react";
import Link from "next/link";
import { childAccounts, upcomingMilestones } from "@/lib/parent-mock-data";

const milestoneIcons: Record<string, any> = {
  quiz: BrainCircuit,
  report: FileText,
  assignment: BookOpen,
  event: Users,
};

const milestoneColors: Record<string, string> = {
  quiz: "text-amber-600 bg-amber-500/10",
  report: "text-purple-600 bg-purple-500/10",
  assignment: "text-blue-600 bg-blue-500/10",
  event: "text-emerald-600 bg-emerald-500/10",
};

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Good morning, David</h2>
        <p className="text-muted-foreground mt-1">Here&apos;s how your children are doing</p>
      </div>

      {/* Child Accounts */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Child Accounts
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {childAccounts.map((child) => (
            <Card key={child.id} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ring-1 ring-black/5 dark:ring-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {child.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold truncate">{child.name}</h4>
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 shrink-0">
                        {child.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{child.grade}</p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-bold">{child.avgScore}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Avg Score</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-bold">{child.subjects}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Subjects</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs font-semibold mt-0.5">{child.lastActive.split(",")[0]}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Last Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Performance Overview */}
        <div className="lg:col-span-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Performance Overview
              </CardTitle>
              <CardDescription>Weekly summary of your children&apos;s progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Weekly Report Ready</p>
                    <p className="text-xs text-muted-foreground">Feb 5 — Feb 12, 2026</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your weekly performance summary is ready for review. Both children have been
                  active this week with steady progress across their subjects.
                </p>
              </div>

              {childAccounts.map((child) => (
                <div key={child.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                    {child.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm">{child.name}</span>
                      <span className="text-sm font-bold">{child.avgScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${child.avgScore >= 80 ? "bg-emerald-500" : child.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${child.avgScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                      {child.grade} &middot; {child.subjects} subjects
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Milestones */}
        <div className="lg:col-span-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                  Upcoming
                </CardTitle>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 shadow-none">
                  {upcomingMilestones.length} events
                </Badge>
              </div>
              <CardDescription>Milestones and important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingMilestones.map((milestone) => {
                const Icon = milestoneIcons[milestone.type] || CalendarDays;
                const colorClass = milestoneColors[milestone.type] || "text-muted-foreground bg-muted";
                return (
                  <div key={milestone.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{milestone.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{milestone.child}</span>
                        <span className="text-muted-foreground">&middot;</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {milestone.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/protected/parent/settings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors text-sm font-medium group"
            >
              Account Settings
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
