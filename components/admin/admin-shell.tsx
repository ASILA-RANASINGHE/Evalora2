"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Link2, Upload, FileCheck,
  BarChart3, Settings, Shield, Menu, X, FolderOpen, Flag,
} from "lucide-react";
import { createContext, useContext, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

// ─── Profile Context ─────────────────────────────────────────────
interface ProfileCtxValue {
  adminName: string;
  adminInitials: string;
  avatarEmoji: string;
  setAdminName: (v: string) => void;
  setAvatarEmoji: (v: string) => void;
}

const ProfileCtx = createContext<ProfileCtxValue>({
  adminName: "Admin",
  adminInitials: "A",
  avatarEmoji: "",
  setAdminName: () => {},
  setAvatarEmoji: () => {},
});

export const useAdminProfile = () => useContext(ProfileCtx);

// ─── Nav ─────────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard", href: "/protected/admin", icon: LayoutDashboard },
  { label: "Users", href: "/protected/admin/users", icon: Users },
  { label: "Relationships", href: "/protected/admin/relationships", icon: Link2 },
  { label: "Upload Hub", href: "/protected/admin/upload", icon: Upload },
  { label: "My Content", href: "/protected/admin/my-content", icon: FolderOpen },
  { label: "Content Review", href: "/protected/admin/content", icon: FileCheck },
  { label: "Review Flagged", href: "/protected/admin/flagged", icon: Flag },
  { label: "Reports", href: "/protected/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/protected/admin/settings", icon: Settings },
];

// ─── Avatar bubble ────────────────────────────────────────────────
function AvatarBubble({ emoji, initials, headerStyle }: { emoji: string; initials: string; headerStyle?: boolean }) {
  if (emoji) {
    return (
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-base flex-shrink-0 ${headerStyle ? "bg-white/10" : "bg-muted border border-border"}`}>
        {emoji}
      </div>
    );
  }
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${headerStyle ? "bg-white/20 text-white" : "bg-slate-800 text-white"}`}>
      {initials}
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────
export function AdminShell({
  children,
  adminName: initialName = "Admin",
  adminInitials: initialInitials = "A",
  avatarEmoji: initialEmoji = null,
}: {
  children: React.ReactNode;
  adminName?: string;
  adminInitials?: string;
  avatarEmoji?: string | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState(initialName);
  const [avatarEmoji, setAvatarEmoji] = useState(initialEmoji ?? "");

  const adminInitials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || initialInitials;

  const firstName = adminName.split(" ")[0];

  const isActive = (href: string) => {
    if (href === "/protected/admin") return pathname === "/protected/admin";
    return pathname.startsWith(href);
  };

  return (
    <ProfileCtx.Provider value={{ adminName, adminInitials, avatarEmoji, setAdminName, setAvatarEmoji }}>
      <div className="flex h-screen overflow-hidden bg-background font-source-sans">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-6 w-6 text-slate-700" />
            <span className="font-space-grotesk text-lg font-bold">Evalora Admin</span>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
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
                      ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
              <AvatarBubble emoji={avatarEmoji} initials={adminInitials} />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{adminName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <LogoutButton variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" />
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 px-6 text-white shadow-md">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-space-grotesk text-lg font-bold">Admin Panel</h1>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm opacity-90 sm:inline">Welcome back, {firstName}</span>
              <AvatarBubble emoji={avatarEmoji} initials={adminInitials} headerStyle />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProfileCtx.Provider>
  );
}
