import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Target,
  CheckCircle2,
  ArrowUp,
  Brain,
} from "lucide-react";
import { analyticsData } from "@/lib/teacher-mock-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground mt-1">Track class performance and identify trends</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                Overall
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{analyticsData.averageMastery}%</div>
              <p className="text-sm text-muted-foreground">Average Mastery</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" />
                {analyticsData.mostImproved.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{analyticsData.mostImproved.topic}</div>
              <p className="text-sm text-muted-foreground">Most Improved Topic</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0">
                Needs Attention
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{analyticsData.atRiskCount}</div>
              <p className="text-sm text-muted-foreground">At Risk Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
          {/* Chart Placeholder */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Class Performance
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-dashed border-purple-200 dark:border-purple-800 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-purple-300 dark:text-purple-700 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Performance chart</p>
                  <p className="text-xs text-muted-foreground">Integrate with your preferred charting library</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard icon={Calendar} label="Peak Day" value={analyticsData.peakDay} color="text-blue-600 bg-blue-500/10" />
                <MetricCard icon={Target} label="Avg Score" value={`${analyticsData.avgScore}%`} color="text-purple-600 bg-purple-500/10" />
                <MetricCard icon={CheckCircle2} label="Completion Rate" value={`${analyticsData.completionRate}%`} color="text-emerald-600 bg-emerald-500/10" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Subject Breakdown */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subject Breakdown</CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {analyticsData.subjectBreakdown.map((item) => (
                <div key={item.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.subject}</span>
                    <span className="font-bold">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" indicatorClassName={item.color} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* At-Risk Signals */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  At-Risk Signals
                </CardTitle>
                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0">
                  {analyticsData.atRiskSignals.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.atRiskSignals.map((signal, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {signal.student.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{signal.student}</p>
                    <p className="text-xs text-muted-foreground">{signal.signal}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{signal.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-lg border bg-muted/20 text-center">
      <div className={`p-2 rounded-lg ${color} w-fit mx-auto mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
