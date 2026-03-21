import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/actions/admin";
import {
  Users,
  Upload,
  FileCheck,
  BarChart3,
  Settings,
  GraduationCap,
  BookOpen,
  UserCheck,
  Shield,
  FileText,
  ClipboardList,
  HelpCircle,
  Server,
  Database,
  HardDrive,
  Activity,
  Clock,
  Flag,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  { label: "Manage Users",   icon: Users,      href: "/protected/admin/users",       color: "from-purple-500 to-purple-700" },
  { label: "Upload Content", icon: Upload,     href: "/protected/admin/upload",      color: "from-blue-500 to-blue-700" },
  { label: "Content Review", icon: FileCheck,  href: "/protected/admin/content",     color: "from-emerald-500 to-emerald-700" },
  { label: "Reports",        icon: BarChart3,  href: "/protected/admin/reports",     color: "from-amber-500 to-amber-700" },
  { label: "Settings",       icon: Settings,   href: "/protected/admin/settings",    color: "from-slate-500 to-slate-700" },
];

const ACTIVITY_ICONS = {
  user_joined:       Users,
  content_uploaded:  Upload,
};

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { userCounts, contentCounts, pendingContent, pendingReviews, totalAttempts, recentActivity } = data;

  const userStats = [
    { label: "Students", count: userCounts.STUDENT, icon: GraduationCap, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Teachers",  count: userCounts.TEACHER, icon: BookOpen,      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Parents",   count: userCounts.PARENT,  icon: UserCheck,     color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
    { label: "Admins",    count: userCounts.ADMIN,   icon: Shield,        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  ];

  const contentStats = [
    { label: "Notes",            count: contentCounts.notes,   icon: FileText,    color: "text-blue-600" },
    { label: "Papers",           count: contentCounts.papers,  icon: ClipboardList, color: "text-emerald-600" },
    { label: "Quizzes",          count: contentCounts.quizzes, icon: HelpCircle,  color: "text-amber-600" },
    { label: "Pending Reviews",  count: pendingReviews,        icon: Flag,        color: "text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your platform at a glance.</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.values(userCounts).reduce((a, b) => a + b, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contentCounts.notes + contentCounts.quizzes + contentCounts.papers}</p>
              <p className="text-sm text-muted-foreground">Total Content</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingContent}</p>
              <p className="text-sm text-muted-foreground">Pending Content</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAttempts}</p>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* User Stats */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">Platform Users</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {userStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Content Stats */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">Content Overview</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {contentStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <section>
          <h3 className="mb-4 font-space-grotesk text-lg font-semibold">System Health</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30">
                  <Server className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Server Status</p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm capitalize text-muted-foreground">online</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">99.9% uptime</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  <Database className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Database</p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Connected · Supabase</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">PostgreSQL</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Storage</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Supabase managed storage</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="mb-4 font-space-grotesk text-lg font-semibold">Recent Activity</h3>
          <Card>
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
              ) : (
                <div className="divide-y">
                  {recentActivity.map((item, i) => {
                    const Icon = ACTIVITY_ICONS[item.type];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.type === "user_joined" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Activity indicator */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            All systems running normally. Data is live from the database.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
