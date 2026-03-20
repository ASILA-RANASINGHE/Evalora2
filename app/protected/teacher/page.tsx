import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Clock,
  FileUp,
  ChevronRight,
  Upload,
  FileText,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getTeacherDashboardData } from "@/lib/actions/analytics";

export default async function TeacherDashboard() {
  const data = await getTeacherDashboardData();

  const stats = data?.stats ?? {
    totalStudents: 0,
    classAverage: 0,
    pendingReviews: 0,
    recentUploads: 0,
  };
  const students = data?.students ?? [];
  const todayStats = data?.todayStats ?? { submissions: 0, uploads: 0 };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={String(stats.totalStudents)}
          subtitle={stats.totalStudents === 1 ? "Connected student" : "Connected students"}
          icon={Users}
          iconColor="bg-blue-500/10 text-blue-600"
        />
        <StatsCard
          title="Class Average"
          value={stats.classAverage > 0 ? `${stats.classAverage}%` : "—"}
          subtitle={stats.classAverage >= 75 ? "Above target" : stats.classAverage > 0 ? "Below 75% target" : "No data yet"}
          icon={TrendingUp}
          iconColor="bg-emerald-500/10 text-emerald-600"
          trend={stats.classAverage >= 75 ? "On track" : undefined}
        />
        <StatsCard
          title="Pending Reviews"
          value={String(stats.pendingReviews)}
          subtitle="Flagged submissions"
          icon={Clock}
          iconColor="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          title="Recent Uploads"
          value={String(stats.recentUploads)}
          subtitle="Last 7 days"
          icon={FileUp}
          iconColor="bg-purple-500/10 text-purple-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Student Table */}
        <div className="lg:col-span-5">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Students</CardTitle>
                  <CardDescription>Overview of your connected students&apos; performance</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 shadow-none"
                >
                  {students.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Grade</th>
                        <th className="pb-3 font-medium hidden sm:table-cell">Subjects</th>
                        <th className="pb-3 font-medium">Avg Score</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium hidden md:table-cell">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map((student, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 font-medium">{student.name}</td>
                          <td className="py-3 text-muted-foreground">{student.grade}</td>
                          <td className="py-3 hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {student.subjects.map((s) => (
                                <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 font-semibold">
                            {student.avgScore > 0 ? `${student.avgScore}%` : "—"}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={student.status} />
                          </td>
                          <td className="py-3 text-muted-foreground text-xs hidden md:table-cell">
                            {student.lastActive}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No students connected yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Students can send you connection requests, or search for them in your contacts.
                    </p>
                  </div>
                  <Link
                    href="/protected/teacher/students"
                    className="text-xs font-semibold text-purple-600 hover:underline"
                  >
                    Manage students →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today at a Glance + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                Today at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GlanceItem icon={FileUp} label="New Uploads" value={String(todayStats.uploads)} />
              <GlanceItem icon={FileText} label="Submissions" value={String(todayStats.submissions)} />
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Pending Reviews</p>
                <p className="text-sm font-medium">
                  {stats.pendingReviews > 0
                    ? `${stats.pendingReviews} flagged submission${stats.pendingReviews !== 1 ? "s" : ""} awaiting review`
                    : "No flagged submissions"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickAction href="/protected/teacher/upload/notes" icon={FileText} label="Upload Notes" />
              <QuickAction href="/protected/teacher/upload/quizzes" icon={Upload} label="Create Quiz" />
              <QuickAction href="/protected/teacher/upload/papers" icon={FileUp} label="Upload Paper" />
              <QuickAction href="/protected/teacher/flagged" icon={Clock} label="Review Flagged" />
              <QuickAction href="/protected/teacher/analysis" icon={TrendingUp} label="View Analytics" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: string;
}) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: "Active" | "At Risk" | "Inactive" }) {
  const styles = {
    Active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "At Risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function GlanceItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
}
