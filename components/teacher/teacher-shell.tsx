"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Flag,
  BarChart3,
  Settings,
  Menu,
  X,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { label: "Dashboard", href: "/protected/teacher", icon: LayoutDashboard },
  { label: "Upload Hub", href: "/protected/teacher/upload", icon: Upload },
  { label: "My Content", href: "/protected/teacher/my-content", icon: FolderOpen },
  { label: "Review Flagged", href: "/protected/teacher/flagged", icon: Flag },
  { label: "Analytics", href: "/protected/teacher/analysis", icon: BarChart3 },
  { label: "Settings", href: "/protected/teacher/settings", icon: Settings },
];

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/protected/teacher") return pathname === "/protected/teacher";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100 dark:from-purple-950 dark:via-purple-900/50 dark:to-purple-900 font-source-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-purple-200/50 dark:border-purple-800/50 bg-purple-50/60 dark:bg-purple-950/60 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-purple-200/50 dark:border-purple-800/50 px-6">
          <GraduationCap className="h-6 w-6 text-purple-600" />
          <span className="font-space-grotesk text-lg font-bold">
            Evalora Teacher
          </span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-purple-200/80 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 shadow-sm"
                    : "text-muted-foreground hover:bg-purple-100/50 hover:text-purple-900 dark:hover:bg-purple-900/20 dark:hover:text-purple-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-purple-200/50 dark:border-purple-800/50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              SJ
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">Ms. Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Senior Teacher</p>
            </div>
          </div>
          <LogoutButton variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
        <header className="flex h-16 shrink-0 items-center gap-4 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 px-6 text-white shadow-md z-10 relative">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-space-grotesk text-lg font-bold">
            Teacher Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm opacity-90 sm:inline">
              Welcome back, Sarah
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              SJ
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
