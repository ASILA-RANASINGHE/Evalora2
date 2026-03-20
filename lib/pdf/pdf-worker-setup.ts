let initialized = false;

export async function ensurePdfWorker() {
  if (initialized || typeof window === "undefined") return;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  initialized = true;
}
