export default function MessageBubble({ text, isUser = false }: { text: string, isUser?: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div>{text}</div>
    </div>
  );
}