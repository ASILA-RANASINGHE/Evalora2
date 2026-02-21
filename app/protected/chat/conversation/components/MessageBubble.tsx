export default function MessageBubble({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div>Hello World</div>
    </div>
  );
}