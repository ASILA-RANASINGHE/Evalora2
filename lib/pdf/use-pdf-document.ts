"use client";

import { useState, useEffect, useRef } from "react";

// pdfjs-dist uses DOMMatrix at module scope, so we must dynamic-import it
// to avoid SSR crashes. Type-only import is safe (erased at compile time).
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

export function usePdfDocument(url: string | null) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!url) {
      setPdf(null);
      setNumPages(0);
      return;
    }

    if (url === prevUrlRef.current) return;
    prevUrlRef.current = url;

    let cancelled = false;

    (async () => {
      const { ensurePdfWorker } = await import("./pdf-worker-setup");
      await ensurePdfWorker();
      const pdfjs = await import("pdfjs-dist");

      if (cancelled) return;

      setLoading(true);
      setError(null);

      try {
        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        // Destroy previous document
        if (pdfRef.current) {
          pdfRef.current.destroy();
        }
        pdfRef.current = doc;
        setPdf(doc);
        setNumPages(doc.numPages);
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        if (!cancelled && e?.name !== "PasswordException") {
          setError(e?.message ?? "Failed to load PDF");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfRef.current) {
        pdfRef.current.destroy();
        pdfRef.current = null;
      }
    };
  }, []);

  return { pdf, numPages, loading, error };
}
