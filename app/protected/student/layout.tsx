import { StudentNav } from "./components/student-nav";
import { StudentHeader } from "./components/student-header";
import { CursorGlow } from "./components/cursor-glow";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <CursorGlow />
      <StudentHeader />

      {/* Navigation Bar */}
      <div className="bg-[#4D2FB2] backdrop-blur-md border-b border-[#696FC7]/30 shadow-lg shadow-[#4D2FB2]/40">
        <div className="flex justify-center px-4 py-3">
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
