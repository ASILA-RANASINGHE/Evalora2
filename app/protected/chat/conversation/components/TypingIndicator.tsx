export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start mb-4">
      <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
      </div>
    </div>
  );
}