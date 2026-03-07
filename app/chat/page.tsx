"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, Suspense, useMemo } from "react";

interface RagChunkDebug {
  title: string;
  topic: string | null;
  grade: string | null;
  similarity: string;
  preview: string;
}

function ChatTestPageInner() {
  const [lastRagChunks, setLastRagChunks] = useState<RagChunkDebug[]>([]);
  const ragChunksRef = useRef(setLastRagChunks);
  ragChunksRef.current = setLastRagChunks;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (url, init) => {
          const res = await fetch(url, init);
          const ragHeader = res.headers.get("X-RAG-Chunks");
          if (ragHeader) {
            try {
              ragChunksRef.current(JSON.parse(decodeURIComponent(ragHeader)));
            } catch {}
          } else {
            ragChunksRef.current([]);
          }
          return res;
        },
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const [input, setInput] = useState("");
  const [showDebug, setShowDebug] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    setLastRagChunks([]);
    sendMessage({ text });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            Evalora{" "}
            <span className="text-sm font-normal text-slate-400">RAG Test</span>
          </h1>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showDebug
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-slate-50 border-slate-300 text-slate-500"
            }`}
          >
            {showDebug ? "Debug ON" : "Debug OFF"}
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20 text-slate-400 text-sm">
                Ask a question to test the RAG pipeline.
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {m.parts
                    ?.filter((p) => p.type === "text")
                    .map((p, i) => <span key={i}>{p.text}</span>) ?? ""}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-2xl px-4 pb-2">
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
              {error.message}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <form
            onSubmit={onSubmit}
            className="mx-auto flex max-w-2xl items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Evalora a question..."
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Debug sidebar */}
      {showDebug && (
        <div className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="px-4 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              RAG Debug Panel
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Shows retrieved chunks for the last query
            </p>
          </div>

          {lastRagChunks.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              {messages.length === 0
                ? "Send a message to see retrieved chunks."
                : "No chunks retrieved (answer is from model's training data)."}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lastRagChunks.map((chunk, i) => {
                const sim = parseFloat(chunk.similarity);
                const barColor =
                  sim >= 0.5
                    ? "bg-green-500"
                    : sim >= 0.3
                      ? "bg-amber-500"
                      : "bg-red-400";

                return (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">
                        Chunk {i + 1}
                      </span>
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          sim >= 0.5
                            ? "bg-green-50 text-green-700"
                            : sim >= 0.3
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {chunk.similarity}
                      </span>
                    </div>

                    {/* Similarity bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                      <div
                        className={`h-1.5 rounded-full ${barColor}`}
                        style={{ width: `${Math.min(sim * 100, 100)}%` }}
                      />
                    </div>

                    <p className="text-xs font-medium text-slate-700 mb-0.5">
                      {chunk.title}
                    </p>
                    {(chunk.topic || chunk.grade) && (
                      <p className="text-[10px] text-slate-400 mb-1">
                        {[chunk.topic, chunk.grade].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {chunk.preview}...
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatTestPage() {
  return (
    <Suspense>
      <ChatTestPageInner />
    </Suspense>
  );
}
