export default function MessageBubble({ text, isUser = false }: { text: string, isUser?: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`px-4 py-2 rounded-2xl ${
        isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
      }`}>
        {text}
      </div>
    </div>
  );
}