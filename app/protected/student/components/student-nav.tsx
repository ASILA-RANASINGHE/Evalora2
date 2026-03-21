"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState, useCallback } from "react";
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
  { title: "Dashboard", href: "/protected/student", icon: LayoutDashboard, exact: true },
  { title: "Notes", href: "/protected/student/notes", icon: BookOpen },
  { title: "Short Notes", href: "/protected/student/short-notes", icon: StickyNote },
  { title: "Quizzes", href: "/protected/student/quizzes", icon: BrainCircuit },
  { title: "Papers", href: "/protected/student/papers", icon: FileText },
  { title: "Progress", href: "/protected/student/progress", icon: TrendingUp },
  { title: "Rankings", href: "/protected/student/leaderboard", icon: Trophy },
  { title: "Settings", href: "/protected/student/settings", icon: Settings },
];

export function StudentNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [glider, setGlider] = useState({ left: 0, width: 0 });

  const activeIndex = navItems.findIndex((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  const updateGlider = useCallback(() => {
    const activeEl = itemRefs.current[activeIndex];
    const navEl = navRef.current;
    if (activeEl && navEl) {
      const navRect = navEl.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();
      setGlider({ left: itemRect.left - navRect.left, width: itemRect.width });
    }
  }, [activeIndex]);

  useEffect(() => {
    updateGlider();
    window.addEventListener("resize", updateGlider);
    return () => window.removeEventListener("resize", updateGlider);
  }, [updateGlider]);

  return (
    <div className="overflow-x-auto no-scrollbar py-1">
      <div ref={navRef} className="glass-nav-group">
        {/* Sliding glider */}
        {activeIndex >= 0 && (
          <div className="glass-glider" style={{ left: glider.left, width: glider.width }} />
        )}

        {navItems.map((item, i) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={`glass-nav-item${isActive ? " active" : ""}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
