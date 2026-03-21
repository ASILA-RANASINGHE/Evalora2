export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          E
        </div>
      </div>
      <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading your workspace...</p>
    </div>
  );
}
