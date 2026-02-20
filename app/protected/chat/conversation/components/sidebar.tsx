"use client";

import { motion } from "framer-motion";
import {
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  Trash2,
} from "lucide-react";

export interface Session {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
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
          onClick={onNewChat}
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
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm cursor-pointer ${
                  activeSessionId === session.id
                    ? "bg-slate-700/80 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{session.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.date}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded-md transition-all flex-shrink-0"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
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
