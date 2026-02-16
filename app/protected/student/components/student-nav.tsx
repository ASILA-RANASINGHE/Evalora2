"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  StickyNote,
  BrainCircuit,
  FileText,
  TrendingUp,
  Trophy,
  Settings,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/protected/student",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Notes",
    href: "/protected/student/notes",
    icon: BookOpen,
  },
  {
    title: "Short Notes",
    href: "/protected/student/short-notes",
    icon: StickyNote,
  },
  {
    title: "Quizzes",
    href: "/protected/student/quizzes",
    icon: BrainCircuit,
  },
  {
    title: "Papers",
    href: "/protected/student/papers",
    icon: FileText,
  },
  {
    title: "Progress",
    href: "/protected/student/progress",
    icon: TrendingUp,
  },
  {
    title: "Rankings",
    href: "/protected/student/leaderboard",
    icon: Trophy,
  },
  {
    title: "Settings",
    href: "/protected/student/settings",
    icon: Settings,
  },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 whitespace-nowrap",
              isActive
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-purple-100" : "text-slate-500 group-hover:text-slate-300")} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
