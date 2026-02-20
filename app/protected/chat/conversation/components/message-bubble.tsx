"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import katex from "katex";

export interface CitationRef {
  label: string; // e.g. "p. 12" or "Sec 2.1"
  page: number;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  citations?: CitationRef[];
}

function renderLatex(text: string): string {
  // Block LaTeX: $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    try {
      return `<div class="my-3 overflow-x-auto text-center">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<code>${expr}</code>`;
    }
  });

  // Inline LaTeX: $...$
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<code>${expr}</code>`;
    }
  });

  return result;
}

function renderMarkdown(text: string): string {
  let html = text;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="my-3 p-3 bg-slate-800 text-slate-100 rounded-lg text-xs overflow-x-auto font-mono"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-blue-400 pl-3 py-1 my-2 text-slate-600 italic bg-blue-50/50 rounded-r-md pr-2">$1</blockquote>');

  // Checklists
  html = html.replace(
    /^- \[x\] (.+)$/gm,
    '<div class="flex items-center gap-2 my-1"><div class="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span class="line-through text-slate-400">$1</span></div>'
  );
  html = html.replace(
    /^- \[ \] (.+)$/gm,
    '<div class="flex items-center gap-2 my-1"><div class="w-4 h-4 rounded border-2 border-slate-300"></div><span>$1</span></div>'
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc my-0.5">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal my-0.5">$1</li>');

  // Tables
  html = html.replace(/(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)+))/g, (match) => {
    const rows = match.trim().split("\n").filter((r) => r.trim());
    if (rows.length < 2) return match;

    const headers = rows[0]
      .split("|")
      .filter((c) => c.trim())
      .map((c) => `<th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">${c.trim()}</th>`)
      .join("");

    const bodyRows = rows
      .slice(2)
      .map((row) => {
        const cells = row
          .split("|")
          .filter((c) => c.trim())
          .map((c) => `<td class="px-3 py-2 text-sm border-b border-slate-100">${c.trim()}</td>`)
          .join("");
        return `<tr class="hover:bg-slate-50">${cells}</tr>`;
      })
      .join("");

    return `<div class="my-3 overflow-x-auto rounded-xl border border-slate-200"><table class="w-full text-left"><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-slate-800 mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-800 mt-4 mb-1">$1</h2>');

  // Paragraphs: convert double newlines
  html = html.replace(/\n\n/g, '<div class="h-3"></div>');
  // Single newlines
  html = html.replace(/\n/g, "<br/>");

  return html;
}

function renderCitationTags(text: string): string {
  // Match patterns like [p. 12], [Sec 2.1], [p. 4], [Section 3]
  return text.replace(
    /\[(p\.\s*\d+|Sec(?:tion)?\s*[\d.]+)\]/g,
    (match, ref) => {
      const page = parseInt(ref.replace(/\D+/g, ""), 10) || 1;
      return `<button class="citation-tag inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[10px] font-semibold text-blue-600 cursor-pointer transition-colors align-baseline" data-page="${page}" data-label="${ref}">${match}</button>`;
    }
  );
}

function processContent(text: string): string {
  const withLatex = renderLatex(text);
  const withMarkdown = renderMarkdown(withLatex);
  return renderCitationTags(withMarkdown);
}

// Citation tooltip component
function CitationTooltip({
  citation,
  position,
}: {
  citation: CitationRef;
  position: { x: number; y: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed z-50 w-64 p-3 bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700"
      style={{ left: position.x, top: position.y - 8, transform: "translate(-50%, -100%)" }}
    >
      <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-1">
        {citation.source} — {citation.label}
      </p>
      <p className="text-xs leading-relaxed text-slate-300">
        &quot;{citation.snippet}&quot;
      </p>
      <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-slate-700" />
    </motion.div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onCitationClick?: (page: number, source: string) => void;
}

export function MessageBubble({ message, onCitationClick }: MessageBubbleProps) {
  const isBot = message.sender === "bot";
  const [copied, setCopied] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState<CitationRef | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const citationBtn = target.closest(".citation-tag") as HTMLElement | null;
    if (citationBtn) {
      const page = parseInt(citationBtn.dataset.page || "1", 10);
      const label = citationBtn.dataset.label || "";

      // Find matching citation from metadata
      const citation = message.citations?.find(
        (c) => c.page === page || c.label === label
      );

      if (onCitationClick) {
        onCitationClick(page, citation?.source || "CS201_Syllabus.pdf");
      }
    }
  };

  const handleContentMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const citationBtn = target.closest(".citation-tag") as HTMLElement | null;
    if (citationBtn && message.citations) {
      const page = parseInt(citationBtn.dataset.page || "1", 10);
      const label = citationBtn.dataset.label || "";

      const citation = message.citations.find(
        (c) => c.page === page || c.label === label
      );

      if (citation) {
        const rect = citationBtn.getBoundingClientRect();
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
        setHoveredCitation(citation);
      }
    }
  };

  const handleContentMouseOut = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".citation-tag")) {
      setHoveredCitation(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={`max-w-[75%] group ${isBot ? "" : "order-first flex justify-end"}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isBot
              ? "bg-white border border-slate-200 rounded-tl-sm text-slate-700"
              : "bg-blue-600 text-white rounded-tr-sm"
          }`}
        >
          {isBot ? (
            <div
              ref={contentRef}
              className="text-sm leading-relaxed font-merriweather prose-sm"
              dangerouslySetInnerHTML={{ __html: processContent(message.text) }}
              onClick={handleContentClick}
              onMouseOver={handleContentMouseOver}
              onMouseOut={handleContentMouseOut}
            />
          ) : (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}

          {/* Copy button for bot messages */}
          {isBot && (
            <button
              onClick={handleCopy}
              className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-slate-400" />
              )}
            </button>
          )}
        </div>
        <p
          className={`text-[10px] text-slate-400 mt-1 ${isBot ? "text-left" : "text-right"}`}
        >
          {message.timestamp}
        </p>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}

      {/* Citation Tooltip */}
      {hoveredCitation && (
        <CitationTooltip citation={hoveredCitation} position={tooltipPos} />
      )}
    </motion.div>
  );
}
