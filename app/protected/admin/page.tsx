"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats } from "@/lib/admin-mock-data";
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
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  { label: "Manage Users", icon: Users, href: "/protected/admin/users", color: "from-purple-500 to-purple-700" },
  { label: "Upload Content", icon: Upload, href: "/protected/admin/upload", color: "from-blue-500 to-blue-700" },
  { label: "Content Review", icon: FileCheck, href: "/protected/admin/content", color: "from-emerald-500 to-emerald-700" },
  { label: "Reports", icon: BarChart3, href: "/protected/admin/reports", color: "from-amber-500 to-amber-700" },
  { label: "Settings", icon: Settings, href: "/protected/admin/settings", color: "from-slate-500 to-slate-700" },
];

const userStats = [
  { label: "Students", count: dashboardStats.users.students, icon: GraduationCap, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Teachers", count: dashboardStats.users.teachers, icon: BookOpen, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { label: "Parents", count: dashboardStats.users.parents, icon: UserCheck, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "Admins", count: dashboardStats.users.admins, icon: Shield, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
];

const contentStats = [
  { label: "Notes", count: dashboardStats.content.notes, icon: FileText, color: "text-blue-600" },
  { label: "Papers", count: dashboardStats.content.papers, icon: ClipboardList, color: "text-emerald-600" },
  { label: "Quizzes", count: dashboardStats.content.quizzes, icon: HelpCircle, color: "text-amber-600" },
  { label: "Pending Reviews", count: dashboardStats.content.pendingReviews, icon: FileCheck, color: "text-red-600" },
];

export default function AdminDashboard() {
  const { system } = dashboardStats;

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your platform at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white transition-transform group-hover:scale-110`}
                    >
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

      {/* User Stats */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">
          Platform Users
        </h3>
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
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Content Stats */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">
          Content Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {contentStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
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

      {/* System Health */}
      <section>
        <h3 className="mb-4 font-space-grotesk text-lg font-semibold">
          System Health
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Server Status */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Server className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Server Status</p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm capitalize text-muted-foreground">
                    {system.serverStatus}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {system.uptime} uptime
              </span>
            </CardContent>
          </Card>

          {/* Database Health */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Database Health</p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm capitalize text-muted-foreground">
                    {system.databaseHealth}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                Backup: {system.lastBackup}
              </span>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <HardDrive className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Storage Usage</p>
                <div className="mt-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{system.storageUsed} GB used</span>
                    <span>{system.storageTotal} GB</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{
                        width: `${(system.storageUsed / system.storageTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Activity indicator */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            All systems running normally. Last checked: just now.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
