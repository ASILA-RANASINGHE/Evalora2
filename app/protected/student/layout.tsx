import { StudentNav } from "./components/student-nav";
import { StudentHeader } from "./components/student-header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <StudentHeader />

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
