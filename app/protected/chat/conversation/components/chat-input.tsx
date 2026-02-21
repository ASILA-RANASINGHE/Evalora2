"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Mic, X, FileText, ImageIcon, MapPin } from "lucide-react";
import { VoiceInputModal, isSpeechSupported } from "./voice-input-modal";
import { MapSearchModal } from "./map-search-modal";

interface FilePreview {
  name: string;
  size: string;
}

interface ChatInputProps {
  onSend: (text: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<FilePreview | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Close attach menu on click outside
  useEffect(() => {
    if (!attachMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(e.target as Node)
      ) {
        setAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [attachMenuOpen]);

  const openFilePicker = useCallback(
    (type: "images" | "documents") => {
      setAttachMenuOpen(false);
      if (type === "images") {
        imageInputRef.current?.click();
      } else {
        docInputRef.current?.click();
      }
    },
    []
  );

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed && !attachedFile) return;

    let messageText = trimmed;
    if (attachedFile) {
      messageText = trimmed
        ? `[Attached: ${attachedFile.name}]\n${trimmed}`
        : `[Attached: ${attachedFile.name}]`;
    }

    onSend(messageText);
    setInput("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: formatFileSize(file.size),
      });
    }
    e.target.value = "";
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
      <div className="max-w-3xl mx-auto">
        {/* File Preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {attachedFile.name}
                </p>
                <p className="text-xs text-slate-400">{attachedFile.size}</p>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-end gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            {/* File Upload — menu with Images / Documents */}
            <div ref={attachMenuRef} className="relative flex-shrink-0 mb-0.5">
              <button
                onClick={() => setAttachMenuOpen((v) => !v)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Anchored selection menu */}
              <AnimatePresence>
                {attachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    <button
                      onClick={() => openFilePicker("images")}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      Images
                    </button>
                    <button
                      onClick={() => openFilePicker("documents")}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-amber-500" />
                      Documents
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden file inputs with separate accept filters */}
              <input
                ref={imageInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                onChange={handleFileChange}
              />
              <input
                ref={docInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
              />
            </div>

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 leading-relaxed"
              style={{ minHeight: "24px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "24px";
                target.style.height = target.scrollHeight + "px";
              }}
            />

            {/* Voice */}
            {speechSupported ? (
              <button
                onClick={() => setVoiceOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0 mb-0.5"
                title="Voice to text"
              >
                <Mic className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled
                className="p-1.5 text-slate-300 rounded-lg flex-shrink-0 mb-0.5 cursor-not-allowed"
                title="Voice input is not supported in this browser. Please use Chrome, Edge, or Safari."
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachedFile}
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          EduBot can make mistakes. Verify important academic information.
        </p>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={(transcript) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setVoiceOpen(false);
        }}
      />
    </div>
  );
}
