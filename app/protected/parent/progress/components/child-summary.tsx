"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BrainCircuit, Clock, User } from "lucide-react";
import type { ChildInfo } from "@/lib/parent-progress-mock-data";

export function ChildSummary({ child }: { child: ChildInfo }) {
  const statusColor = {
    Excellent: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    Good: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    "Needs Improvement": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  }[child.overallStatus];

  const scoreColor =
    child.avgScore >= 80
      ? "text-emerald-600"
      : child.avgScore >= 60
      ? "text-amber-600"
      : "text-red-600";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-purple-500" />
          Child Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-5">
          <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${child.color} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {child.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">{child.name}</h3>
              <Badge className={`border-0 text-xs ${statusColor}`}>
                {child.overallStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{child.grade}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-3xl font-bold ${scoreColor}`}>{child.avgScore}%</p>
            <p className="text-xs text-muted-foreground">Overall Average</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold">{child.papersCompleted}</p>
            <p className="text-xs text-muted-foreground text-center font-medium">Papers Done</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <BrainCircuit className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold">{child.quizzesCompleted}</p>
            <p className="text-xs text-muted-foreground text-center font-medium">Quizzes Done</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold leading-tight text-center">{child.lastActive}</p>
            <p className="text-xs text-muted-foreground text-center font-medium">Last Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
