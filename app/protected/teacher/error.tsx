"use client";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
      >
        Try again
      </button>
    </div>
  );
}
