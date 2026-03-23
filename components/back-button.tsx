"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={
        "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm " +
        (className ?? "")
      }
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
