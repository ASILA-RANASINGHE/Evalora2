"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardStats } from "@/lib/admin-mock-data";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
} from "lucide-react";

const reportTypes = [
  {
    title: "User Analytics",
    description: "User registrations, activity trends, and role distribution.",
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Content Analytics",
    description: "Upload frequency, content engagement, and review metrics.",
    icon: BookOpen,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    title: "Performance Report",
    description: "System performance, response times, and uptime stats.",
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    title: "Monthly Summary",
    description: "Comprehensive monthly overview of all platform metrics.",
    icon: Calendar,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

export default function ReportsPage() {
  const { users, content } = dashboardStats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Generate and export platform analytics reports.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">
              {users.students + users.teachers + users.parents + users.admins}
            </p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">
              {content.notes + content.papers + content.quizzes}
            </p>
            <p className="text-sm text-muted-foreground">Total Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{content.pendingReviews}</p>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Report generator cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                    Generate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder chart area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics Preview</CardTitle>
          <CardDescription>
            Report visualizations will appear here when generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No report generated yet</p>
              <p className="text-xs">
                Select a report type above to generate analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
