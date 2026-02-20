"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface Session {
  id: string;
  title: string;
  date: string;
  active?: boolean;
}

const recentSessions: Session[] = [
  { id: "1", title: "Algebra II Review", date: "Today", active: true },
  { id: "2", title: "Thesis Formatting Guide", date: "Today" },
  { id: "3", title: "Physics: Wave Equations", date: "Yesterday" },
  { id: "4", title: "Essay Structure Help", date: "Yesterday" },
  { id: "5", title: "Calculus Integration", date: "2 days ago" },
  { id: "6", title: "History: World War II", date: "3 days ago" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [activeSession, setActiveSession] = useState("1");

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-slate-900 text-white overflow-hidden flex-shrink-0"
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute top-4 -right-0 z-10 w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-l-md flex items-center justify-center transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* New Chat Button */}
      <div className="p-3 pt-4">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium ${collapsed ? "justify-center" : ""}`}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Recent Sessions */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">
            Recent Sessions
          </p>
          <div className="space-y-1">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${
                  activeSession === session.id
                    ? "bg-slate-700/80 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{session.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.date}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {collapsed && <div className="flex-1" />}

      {/* User Profile */}
      <div className="border-t border-slate-700/50 p-3">
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">Student User</p>
              <p className="text-xs text-slate-400 truncate">
                student@evalora.com
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
