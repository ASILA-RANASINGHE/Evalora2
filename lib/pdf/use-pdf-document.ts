"use client";

import { useState, useEffect, useRef } from "react";
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist";
import { ensurePdfWorker } from "./pdf-worker-setup";

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

    ensurePdfWorker();
    setLoading(true);
    setError(null);

    const loadingTask = getDocument({ url });

    loadingTask.promise
      .then((doc) => {
        // Destroy previous document
        if (pdfRef.current) {
          pdfRef.current.destroy();
        }
        pdfRef.current = doc;
        setPdf(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "PasswordException") {
          setError(err?.message ?? "Failed to load PDF");
        }
        setLoading(false);
      });

    return () => {
      loadingTask.destroy();
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
