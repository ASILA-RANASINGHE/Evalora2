import { useRef, useEffect } from "react";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatContainerProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onCitationClick?: (page: number, source: string) => void;
}

export function ChatContainer({ 
  messages, 
  isTyping, 
  onCitationClick 
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end", 
      });
    }
  };

  useEffect(() => {
    // Small timeout ensures the DOM has rendered the new message/indicator 
    // before the browser calculates the final scroll position.
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onCitationClick={onCitationClick} 
          />
        ))}

        {isTyping && <TypingIndicator />}
        
        {/* Invisible anchor for the scroll-to-bottom logic */}
        <div ref={messagesEndRef} className="h-px" />
      </div>
    </div>
  );
}