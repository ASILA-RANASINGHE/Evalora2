import { GlobalWorkerOptions } from "pdfjs-dist";

let initialized = false;

export function ensurePdfWorker() {
  if (initialized || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  initialized = true;
}
