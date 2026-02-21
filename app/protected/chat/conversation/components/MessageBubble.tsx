import React from 'react';
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

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`px-4 py-3 rounded-2xl max-w-[80%] break-words shadow-sm flex flex-col gap-1 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <span className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {message.timestamp}
        </span>

        <div className="whitespace-pre-wrap">
          {message.text}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-gray-300">
            {message.citations.map((citation, idx) => (
              <button
                key={idx}
                onClick={() => onCitationClick?.(citation.page, citation.source)}
                className="text-xs px-2 py-1 bg-white hover:bg-gray-50 text-blue-600 rounded shadow-sm transition-colors"
              >
                {citation.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}