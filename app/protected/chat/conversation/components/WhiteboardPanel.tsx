"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Pen, Eraser, Undo2, Trash2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WhiteboardPanelProps {
  onClose: () => void;
}

type Tool = "pen" | "eraser";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: Tool;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  { value: "#1e293b", label: "Black" },
  { value: "#2563eb", label: "Blue" },
  { value: "#dc2626", label: "Red" },
  { value: "#16a34a", label: "Green" },
  { value: "#ea580c", label: "Orange" },
];

const WIDTHS = [
  { value: 2, label: "Thin" },
  { value: 4, label: "Medium" },
  { value: 7, label: "Thick" },
];

const ERASER_WIDTH = 24;

// ─── Component ───────────────────────────────────────────────────────────────

export function WhiteboardPanel({ onClose }: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState(WIDTHS[0].value);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const currentStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  // ── Redraw all committed strokes ────────────────────────────────────────
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes) {
      if (!stroke || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
      ctx.lineWidth = stroke.tool === "eraser" ? ERASER_WIDTH : stroke.width;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [strokes]);

  // ── Canvas sizing via ResizeObserver ─────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        redrawCanvas();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [redrawCanvas]);

  // ── Pointer helpers ─────────────────────────────────────────────────────
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);
    currentStrokeRef.current = {
      points: [pt],
      color,
      width: strokeWidth,
      tool,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasPoint(e);
    const prev =
      currentStrokeRef.current.points[
        currentStrokeRef.current.points.length - 1
      ];

    // Incremental draw for smooth real-time rendering
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle =
      tool === "eraser" ? "#ffffff" : currentStrokeRef.current.color;
    ctx.lineWidth =
      tool === "eraser" ? ERASER_WIDTH : currentStrokeRef.current.width;
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    currentStrokeRef.current.points.push(pt);
  };

  const handlePointerUp = () => {
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
    if (stroke && stroke.points.length > 1) {
      setStrokes((prev) => [...prev, stroke]);
    }
  };

  // ── Undo / Clear ───────────────────────────────────────────────────────
  const handleUndo = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      // Redraw synchronously after state update via effect
      return next;
    });
  };

  const handleClear = () => {
    setStrokes([]);
  };

  // Redraw whenever strokes change (undo / clear)
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  // ── Render ─────────────────────────────────────────────────────────────
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Pen className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Scratch Pad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 flex-wrap">
          {/* Pen / Eraser */}
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === "pen"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Pen"
          >
            <Pen className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg transition-colors ${
              tool === "eraser"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Colors */}
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setColor(c.value);
                setTool("pen");
              }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                color === c.value && tool === "pen"
                  ? "border-blue-500 scale-110"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Stroke widths */}
          {WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => setStrokeWidth(w.value)}
              className={`p-1 rounded-lg transition-colors ${
                strokeWidth === w.value
                  ? "bg-slate-200"
                  : "hover:bg-slate-100"
              }`}
              title={w.label}
            >
              <div
                className="rounded-full bg-slate-600"
                style={{ width: w.value + 4, height: w.value + 4 }}
              />
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Undo / Clear */}
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* ── Canvas ── */}
        <div ref={containerRef} className="flex-1 min-h-0 bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>
    </motion.div>
  );
}
