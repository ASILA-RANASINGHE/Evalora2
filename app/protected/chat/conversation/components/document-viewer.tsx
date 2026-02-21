"use client";

import { motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  Highlighter,
} from "lucide-react";
import { useState } from "react";

interface DocumentViewerProps {
  fileName: string;
  initialPage: number;
  highlightText?: string;
  onClose: () => void;
}

// Simulated page content for demo
const pageContents: Record<number, string[]> = {
  1: [
    "CS201 — Data Structures & Algorithms",
    "Fall 2024 Syllabus",
    "",
    "Instructor: Dr. Sarah Chen",
    "Office Hours: MW 2:00–4:00 PM, Room 312",
    "Email: s.chen@university.edu",
    "",
    "Course Description:",
    "This course covers fundamental data structures",
    "and algorithmic techniques. Topics include arrays,",
    "linked lists, trees, graphs, sorting algorithms,",
    "searching algorithms, and complexity analysis.",
  ],
  4: [
    "Section 2.1 — Arrays & Linked Lists",
    "",
    "An array is a contiguous block of memory that",
    "stores elements of the same type. Access time",
    "is O(1) for indexed access.",
    "",
    "A linked list is a linear data structure where",
    "each element (node) contains a value and a",
    "pointer to the next node.",
    "",
    "Key differences:",
    "• Arrays: O(1) access, O(n) insertion",
    "• Linked Lists: O(n) access, O(1) insertion",
  ],
  12: [
    "Chapter 5 — Sorting Algorithms",
    "",
    "5.1 Comparison-Based Sorting",
    "",
    "The quadratic formula can be applied to analyze",
    "the average-case behavior of certain recursive",
    "sorting algorithms.",
    "",
    "For QuickSort, the recurrence relation:",
    "  T(n) = 2T(n/2) + O(n)",
    "",
    "Yields an average-case complexity of O(n log n).",
    "Worst case remains O(n²) without randomization.",
  ],
  15: [
    "Grading Criteria",
    "",
    "Midterm Exam .............. 25%",
    "Final Exam ................ 30%",
    "Programming Assignments ... 25%",
    "Quizzes ................... 10%",
    "Class Participation ....... 10%",
    "",
    "Late Policy:",
    "Assignments lose 10% per day late.",
    "Maximum 3 days late accepted.",
    "No extensions without prior approval.",
  ],
};

function getPageContent(page: number): string[] {
  return (
    pageContents[page] || [
      `Page ${page}`,
      "",
      "Lorem ipsum dolor sit amet, consectetur",
      "adipiscing elit. Sed do eiusmod tempor",
      "incididunt ut labore et dolore magna aliqua.",
      "",
      "Ut enim ad minim veniam, quis nostrud",
      "exercitation ullamco laboris nisi ut",
      "aliquip ex ea commodo consequat.",
    ]
  );
}

export function DocumentViewer({
  fileName,
  initialPage,
  highlightText,
  onClose,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const totalPages = 24;

  const lines = getPageContent(currentPage);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 420, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full border-l border-slate-200 bg-white overflow-hidden flex-shrink-0 flex flex-col"
    >
      <div className="w-[420px] h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700 truncate">
              {fileName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-md transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <span className="text-xs text-slate-500 min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage >= totalPages}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 25))}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-400 min-w-[32px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 min-h-[500px] mx-auto"
            style={{
              fontSize: `${zoom}%`,
              maxWidth: "360px",
            }}
          >
            {lines.map((line, i) => {
              const isHighlighted =
                highlightText &&
                line.toLowerCase().includes(highlightText.toLowerCase());

              return (
                <p
                  key={i}
                  className={`text-sm leading-relaxed font-serif ${
                    i === 0
                      ? "font-bold text-slate-800 text-base mb-2"
                      : line === ""
                        ? "h-3"
                        : "text-slate-600"
                  } ${isHighlighted ? "bg-yellow-100 px-1 -mx-1 rounded" : ""}`}
                >
                  {line || "\u00A0"}
                  {isHighlighted && (
                    <Highlighter className="inline h-3 w-3 text-yellow-500 ml-1" />
                  )}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {highlightText && (
          <div className="px-4 py-2 border-t border-slate-200 bg-yellow-50/50">
            <p className="text-[10px] text-slate-500">
              <Highlighter className="inline h-3 w-3 text-yellow-500 mr-1" />
              Highlighted reference from chat
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
