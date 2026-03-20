"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  Highlighter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePdfDocument } from "@/lib/pdf/use-pdf-document";
import { usePdfPage } from "@/lib/pdf/use-pdf-page";
import {
  findTextPosition,
  findParagraphPosition,
} from "@/lib/pdf/find-text-position";
import type { BoundingBox } from "@/app/protected/chat/types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DocumentViewerProps {
  fileName: string;
  pdfUrl: string | null;
  initialPage: number;
  highlightText?: string;
  highlightBox?: BoundingBox;
  paragraphIndex?: number;
  onClose: () => void;
}

// ─── Zoom Presets ───────────────────────────────────────────────────────────

const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

function stepZoomUp(current: number): number {
  for (const step of ZOOM_STEPS) {
    if (step > current + 0.01) return step;
  }
  return current;
}

function stepZoomDown(current: number): number {
  for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
    if (ZOOM_STEPS[i] < current - 0.01) return ZOOM_STEPS[i];
  }
  return current;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DocumentViewer({
  fileName,
  pdfUrl,
  initialPage,
  highlightText,
  highlightBox,
  paragraphIndex,
  onClose,
}: DocumentViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PDF loading
  const { pdf, numPages, loading, error } = usePdfDocument(pdfUrl);

  // View state
  const [zoom, setZoom] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Highlight state
  const [computedHighlight, setComputedHighlight] =
    useState<BoundingBox | null>(null);
  const [highlightVisible, setHighlightVisible] = useState(false);

  // Compute fit-to-width scale once PDF loads
  useEffect(() => {
    if (!pdf) return;
    pdf.getPage(1).then((page) => {
      const viewport = page.getViewport({ scale: 1.0 });
      // 420px panel - 32px padding = 388px usable width
      const scale = Math.round((388 / viewport.width) * 100) / 100;
      setZoom(scale);
    });
  }, [pdf]);

  // Sync currentPage when initialPage prop changes (citation click)
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Render the current page
  const { pageSize } = usePdfPage({
    pdf,
    pageNumber: currentPage,
    scale: zoom,
    canvasRef,
  });

  // Compute highlight position
  const computeHighlight = useCallback(async () => {
    // Priority: explicit bounding_box > paragraph_index > text search
    if (highlightBox) {
      setComputedHighlight(highlightBox);
      return;
    }

    if (!pdf) {
      setComputedHighlight(null);
      return;
    }

    try {
      const page = await pdf.getPage(currentPage);

      if (paragraphIndex !== undefined) {
        const pos = await findParagraphPosition(page, paragraphIndex, zoom);
        setComputedHighlight(pos);
      } else if (highlightText) {
        const pos = await findTextPosition(page, highlightText, zoom);
        setComputedHighlight(pos);
      } else {
        setComputedHighlight(null);
      }
    } catch {
      setComputedHighlight(null);
    }
  }, [pdf, currentPage, zoom, highlightBox, paragraphIndex, highlightText]);

  useEffect(() => {
    computeHighlight();
  }, [computeHighlight]);

  // Show highlight with auto-fade after 3s
  useEffect(() => {
    if (computedHighlight) {
      setHighlightVisible(true);
      const timer = setTimeout(() => setHighlightVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setHighlightVisible(false);
    }
  }, [computedHighlight]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 420, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full border-l border-slate-200 bg-white overflow-hidden flex-shrink-0 flex flex-col"
    >
      <div className="w-[420px] h-full flex flex-col">
        {/* ── Header ── */}
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

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <span className="text-xs text-slate-500 min-w-[80px] text-center">
              Page {currentPage} of {numPages || "..."}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(numPages || 1, p + 1))
              }
              disabled={currentPage >= (numPages || 1)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(stepZoomDown)}
              disabled={zoom <= ZOOM_STEPS[0]}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-400 min-w-[32px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(stepZoomUp)}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30"
            >
              <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading PDF...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
              <AlertCircle className="h-8 w-8" />
              <span className="text-sm text-center px-4">{error}</span>
            </div>
          )}

          {/* No URL */}
          {!loading && !error && !pdfUrl && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <FileText className="h-8 w-8" />
              <span className="text-sm">No document loaded</span>
            </div>
          )}

          {/* PDF Canvas + Highlight */}
          {!loading && !error && pdf && (
            <div
              className="relative mx-auto"
              style={{
                width: pageSize.width || "100%",
                height: pageSize.height || "auto",
              }}
            >
              <canvas
                ref={canvasRef}
                className="shadow-sm border border-slate-200 rounded-lg bg-white"
              />

              {/* Highlight overlay */}
              <AnimatePresence>
                {computedHighlight && highlightVisible && pageSize.width > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bg-yellow-300/40 border-2 border-yellow-400 rounded-sm pointer-events-none"
                    style={{
                      left: computedHighlight.x * pageSize.width,
                      top: computedHighlight.y * pageSize.height,
                      width: computedHighlight.width * pageSize.width,
                      height: computedHighlight.height * pageSize.height,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {highlightText && (
          <div className="px-4 py-2 border-t border-slate-200 bg-yellow-50/50">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Highlighter className="h-3 w-3 text-yellow-500" />
              Highlighted reference from chat
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
