export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start mb-4">
      <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
+        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
+        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}