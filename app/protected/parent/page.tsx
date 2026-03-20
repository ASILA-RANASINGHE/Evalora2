"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BookOpen,
  Clock,
  ChevronRight,
  FileText,
  BrainCircuit,
  Award,
  Flame,
  AlertTriangle,
  CheckCircle2,
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
  const [selectedId, setSelectedId] = useState(childAccounts[0].id);
  const selected = childAccounts.find((c) => c.id === selectedId)!;
  const ps = selected.progressSummary;
  const studyDiff = ps.studyTimeThisWeek - ps.studyTimeLastWeek;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Good morning, David</h2>
        <p className="text-muted-foreground mt-1">Here&apos;s how your children are doing</p>
      </div>

      {/* Child Selector */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Select Child
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {childAccounts.map((child) => {
            const isSelected = child.id === selectedId;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedId(child.id)}
                className={`text-left rounded-xl border-2 p-5 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                    : "border-border/50 bg-card/50 hover:border-purple-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ${isSelected ? "ring-purple-400" : "ring-transparent"}`}>
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
                    <div className="mt-3 grid grid-cols-3 gap-2">
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Summary for selected child */}
      <Card className="border-purple-200 dark:border-purple-800/50 shadow-sm bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-900/10 dark:to-indigo-900/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                {selected.name}&apos;s Progress Summary
              </CardTitle>
              <CardDescription>Key highlights from the last 30 days</CardDescription>
            </div>
            <Link
              href={`/protected/parent/progress?child=${selectedId}`}
              className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              Full Report
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Avg Score trend */}
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className={`flex items-center justify-center gap-1 text-lg font-bold ${ps.scoreTrend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {ps.scoreTrend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {ps.scoreTrend >= 0 ? "+" : ""}{ps.scoreTrend}%
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Score Trend</p>
            </div>

            {/* Study time */}
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-bold">{ps.studyTimeThisWeek}h</p>
                <span className={`text-xs font-medium ${studyDiff >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {studyDiff >= 0 ? "↑" : "↓"}{Math.abs(studyDiff).toFixed(1)}h
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">This Week</p>
            </div>

            {/* Streak */}
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-amber-500">
                <Flame className="h-4 w-4" />
                {ps.currentStreak}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Day Streak</p>
            </div>

            {/* Weak topics */}
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <div className={`flex items-center justify-center gap-1 text-lg font-bold ${ps.weakTopicsCount > 3 ? "text-red-500" : ps.weakTopicsCount > 1 ? "text-amber-500" : "text-emerald-600"}`}>
                <AlertTriangle className="h-4 w-4" />
                {ps.weakTopicsCount}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Weak Areas</p>
            </div>
          </div>

          {/* Subject highlights */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider">Strongest Subject</p>
                <p className="font-semibold truncate">{ps.topSubject.name}</p>
              </div>
              <span className="ml-auto text-lg font-bold text-emerald-600 shrink-0">{ps.topSubject.score}%</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase tracking-wider">Needs Attention</p>
                <p className="font-semibold truncate">{ps.weakSubject.name}</p>
              </div>
              <span className="ml-auto text-lg font-bold text-red-500 shrink-0">{ps.weakSubject.score}%</span>
            </div>
          </div>

          {/* Mini score history */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground shrink-0">3-month trend:</span>
            <div className="flex items-center gap-3">
              {ps.scoreHistory.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{s.month}</span>
                  <span className={`text-xs font-bold ${s.avgScore >= 80 ? "text-emerald-600" : s.avgScore >= 65 ? "text-amber-500" : "text-red-500"}`}>{s.avgScore}%</span>
                  {i < ps.scoreHistory.length - 1 && <span className="text-muted-foreground/40">→</span>}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Performance Overview */}
        <div className="lg:col-span-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Performance Overview
              </CardTitle>
              <CardDescription>Score comparison across all children</CardDescription>
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
              href={`/protected/parent/progress?child=${selectedId}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium text-purple-700 dark:text-purple-300 group"
            >
              <TrendingUp className="h-4 w-4" />
              View Progress Dashboard
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
