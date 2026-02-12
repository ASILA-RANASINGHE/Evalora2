"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/protected/parent", icon: LayoutDashboard },
  { label: "Settings", href: "/protected/parent/settings", icon: Settings },
];

export function ParentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/protected/parent") return pathname === "/protected/parent";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-source-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Heart className="h-6 w-6 text-purple-600" />
          <span className="font-space-grotesk text-lg font-bold">
            Evalora Parent
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
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              DF
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">Mr. David Fernando</p>
              <p className="text-xs text-muted-foreground">Parent / Guardian</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 px-6 text-white shadow-md">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-space-grotesk text-lg font-bold">
            Parent Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm opacity-90 sm:inline">
              Welcome back, David
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              DF
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
