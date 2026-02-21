"use client";

import { Download, BookOpen, PanelRightOpen, PanelRightClose, GraduationCap } from "lucide-react";

interface ChatHeaderProps {
  referenceOpen: boolean;
  onToggleReference: () => void;
  studyToolsOpen: boolean;
  onToggleStudyTools: () => void;
  onExportTranscript: () => void;
}

export function ChatHeader({
  referenceOpen,
  onToggleReference,
  studyToolsOpen,
  onToggleStudyTools,
  onExportTranscript,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            EduBot: Senior Academic Advisor
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleStudyTools}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            studyToolsOpen
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Toggle study tools"
        >
          <GraduationCap className="h-4 w-4" />
          <span className="hidden sm:inline">Study Tools</span>
        </button>
        <button
          onClick={onToggleReference}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            referenceOpen
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Toggle references"
        >
          {referenceOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Sources</span>
        </button>
        <button
          onClick={onExportTranscript}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Transcript</span>
        </button>
      </div>
    </header>
  );
}
