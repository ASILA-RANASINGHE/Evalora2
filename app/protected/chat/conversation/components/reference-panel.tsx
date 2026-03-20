"use client";

import { motion } from "framer-motion";
import { ExternalLink, BookMarked, X } from "lucide-react";

interface Reference {
  id: string;
  title: string;
  source: string;
  type: "textbook" | "article" | "paper";
  url?: string;
}

const sampleReferences: Reference[] = [
  {
    id: "1",
    title: "Quadratic Formula & Applications",
    source: "Khan Academy - Algebra II",
    type: "article",
    url: "#",
  },
  {
    id: "2",
    title: "Fundamentals of Algebra, Ch. 7",
    source: "Stewart, J. (2020)",
    type: "textbook",
  },
  {
    id: "3",
    title: "Solving Polynomial Equations",
    source: "MIT OpenCourseWare",
    type: "paper",
    url: "#",
  },
  {
    id: "4",
    title: "Common Mistakes in Factoring",
    source: "Mathematics Teaching Journal",
    type: "article",
  },
];

const typeColors = {
  textbook: "bg-amber-100 text-amber-700",
  article: "bg-blue-100 text-blue-700",
  paper: "bg-purple-100 text-purple-700",
};

interface ReferencePanelProps {
  onClose: () => void;
}

export function ReferencePanel({ onClose }: ReferencePanelProps) {
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-l border-slate-200 bg-white overflow-hidden flex-shrink-0"
    >
      <div className="w-80 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              Sources & References
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* References List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Cited in this conversation
          </p>
          {sampleReferences.map((ref) => (
            <div
              key={ref.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-snug">
                  {ref.title}
                </h4>
                {ref.url && (
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ref.source}</p>
              <span
                className={`inline-block text-[10px] font-semibold uppercase tracking-wider mt-2 px-2 py-0.5 rounded-full ${typeColors[ref.type]}`}
              >
                {ref.type}
              </span>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
              Recommended Reading
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                <BookMarked className="h-3.5 w-3.5 text-slate-400" />
                <span>Advanced Algebra Concepts</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                <BookMarked className="h-3.5 w-3.5 text-slate-400" />
                <span>Practice Problem Sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
