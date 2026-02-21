"use client";

import { useState } from "react";
import { Quote, Copy, Check } from "lucide-react";

const formats = ["APA", "MLA", "Chicago"] as const;
type Format = (typeof formats)[number];

function generateCitation(source: string, format: Format): string {
  const trimmed = source.trim() || "Unknown Source";
  switch (format) {
    case "APA":
      return `Author, A. A. (2024). ${trimmed}. Publisher.`;
    case "MLA":
      return `Author. "${trimmed}." Publisher, 2024.`;
    case "Chicago":
      return `Author. ${trimmed}. Place: Publisher, 2024.`;
  }
}

export function CitationWidget() {
  const [source, setSource] = useState("");
  const [format, setFormat] = useState<Format>("APA");
  const [citation, setCitation] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setCitation(generateCitation(source, format));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Quote className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Citation Generator
        </h3>
      </div>

      <input
        type="text"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Enter source title..."
        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex items-center gap-2 mt-2">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Generate
        </button>
      </div>

      {citation && (
        <div className="mt-3 relative group">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-xs font-mono text-slate-600 leading-relaxed pr-6">
              {citation}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            title="Copy citation"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
