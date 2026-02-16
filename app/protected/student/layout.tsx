import { StudentNav } from "./components/student-nav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication check skipped for UI demo
  // await requireRole("STUDENT");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dark modern header with gradient accent */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
        
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                E
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Evalora
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border/50 backdrop-blur-sm">
                <span className="text-sm font-medium">🔥 7 Day Streak</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm ring-2 ring-transparent hover:ring-purple-500/20 transition-all cursor-pointer">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-slate-900 text-white shadow-inner">
        <div className="container mx-auto px-4 py-2">
            <StudentNav />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}
