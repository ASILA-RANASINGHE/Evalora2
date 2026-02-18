import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Zap, Minus, TrendingDown } from "lucide-react";
import type { StudyTimeStats } from "@/lib/teacher-mock-data";

interface StudyTimePanelProps {
  stats: StudyTimeStats;
}

export function StudyTimePanel({ stats }: StudyTimePanelProps) {
  const diff = stats.myClassAvg - stats.platformAvg;
  const isAbove = diff >= 0;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Study Time Comparison
        </CardTitle>
        <CardDescription>Average weekly study hours vs platform benchmark</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Comparison */}
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.myClassAvg}h</p>
                <p className="text-xs text-muted-foreground mt-1">My Class</p>
              </div>
              <div className="text-center pb-1">
                <p className="text-sm text-muted-foreground">vs</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-500">{stats.platformAvg}h</p>
                <p className="text-xs text-muted-foreground mt-1">Platform Avg</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${isAbove ? "text-emerald-600" : "text-red-500"}`}>
              {isAbove ? <Zap className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isAbove ? "+" : ""}{diff.toFixed(1)}h/week {isAbove ? "above" : "below"} platform average
            </div>
            {/* Visual bar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">My Class</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stats.myClassAvg / 10) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-8">{stats.myClassAvg}h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Platform</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(stats.platformAvg / 10) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-8">{stats.platformAvg}h</span>
              </div>
            </div>
          </div>

          {/* Engagement breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Engagement Breakdown</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">High Engagement</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600">{stats.highEngagement}</span>
                  <span className="text-xs text-muted-foreground ml-1">students</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Medium Engagement</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{stats.mediumEngagement}</span>
                  <span className="text-xs text-muted-foreground ml-1">students</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium">Low Engagement</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-500">{stats.lowEngagement}</span>
                  <span className="text-xs text-muted-foreground ml-1">students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
