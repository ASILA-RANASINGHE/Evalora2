"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// Use type-only import to avoid pulling in the module at SSR time
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

interface UsePdfPageOptions {
  pdf: PDFDocumentProxy | null;
  pageNumber: number;
  scale: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function usePdfPage({
  pdf,
  pageNumber,
  scale,
  canvasRef,
}: UsePdfPageOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);
  const [pageSize, setPageSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // ignore
      }
      renderTaskRef.current = null;
    }

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({ width: viewport.width, height: viewport.height });

      const renderTask = page.render({
        canvas,
        viewport,
      });

      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err);
      }
    }
  }, [pdf, pageNumber, scale, canvasRef]);

  useEffect(() => {
    renderPage();
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [renderPage]);

  return { pageSize };
}
