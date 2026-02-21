import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'framer-motion';
import { GraduationCap, Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

export interface Citation {
  label: string;
  page: number;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  timestamp: string;
  text: string;
  citations?: Citation[];
}

interface MessageBubbleProps {
  message: ChatMessage;
  onCitationClick?: (page: number, source: string) => void;
}

export function MessageBubble({ message, onCitationClick }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar for Bot */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0 mt-1">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div 
            className={`relative px-5 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
              isUser 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none shadow-blue-200' 
                : 'bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 rounded-bl-none hover:shadow-md'
            }`}
          >
            {/* Action Menu (Appear on Hover) */}
            <button 
              onClick={handleCopy}
              className={`absolute top-2 ${isUser ? '-left-8' : '-right-8'} p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-500`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Markdown Content */}
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'} 
              prose-headings:font-bold prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {message.text}
              </ReactMarkdown>
            </div>

            {/* Citations Row */}
            {!isUser && message.citations && message.citations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                {message.citations.map((citation, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCitationClick?.(citation.page, citation.source)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors border border-blue-100"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                    {citation.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <span className={`text-[10px] font-medium px-1 ${isUser ? 'text-right text-slate-400' : 'text-left text-slate-400'}`}>
            {message.timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
}