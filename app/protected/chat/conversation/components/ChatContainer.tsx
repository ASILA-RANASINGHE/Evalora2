import { MessageBubble, type ChatMessage } from "./MessageBubble";

export function ChatContainer({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}