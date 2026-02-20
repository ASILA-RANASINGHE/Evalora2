"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import katex from "katex";

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
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

function processContent(text: string): string {
  const withLatex = renderLatex(text);
  return renderMarkdown(withLatex);
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.sender === "bot";
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    </motion.div>
  );
}
