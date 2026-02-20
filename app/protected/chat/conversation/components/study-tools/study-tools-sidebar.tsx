"use client";

import { motion } from "framer-motion";
import { GraduationCap, X, Layers, Quote, BookOpen } from "lucide-react";
import { FlashcardWidget } from "./flashcard-widget";
import { CitationWidget } from "./citation-widget";
import { GlossaryWidget } from "./glossary-widget";

interface StudyToolsSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const collapsedIcons = [
  { icon: Layers, label: "Flashcards" },
  { icon: Quote, label: "Citations" },
  { icon: BookOpen, label: "Glossary" },
];

export function StudyToolsSidebar({ open, onToggle }: StudyToolsSidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: open ? 300 : 52 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-l border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex flex-col"
    >
      {open ? (
        /* ── Expanded state ── */
        <div className="w-[300px] h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-800">
                Study Tools
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Widgets */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Flashcard Widget */}
            <div className="p-3 bg-slate-100/60 rounded-xl">
              <FlashcardWidget />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Citation Widget */}
            <div className="p-3 bg-slate-100/60 rounded-xl">
              <CitationWidget />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Glossary Widget */}
            <div className="p-3 bg-slate-100/60 rounded-xl">
              <GlossaryWidget />
            </div>
          </div>
        </div>
      ) : (
        /* ── Collapsed state ── */
        <div className="w-[52px] h-full flex flex-col items-center pt-3 gap-3">
          <button
            onClick={onToggle}
            className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
            title="Open Study Tools"
          >
            <GraduationCap className="h-4 w-4 text-white" />
          </button>

          <div className="w-6 border-t border-slate-300" />

          {collapsedIcons.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={onToggle}
              className="w-9 h-9 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
              title={label}
            >
              <Icon className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
