"use client";

import { LogoutButton } from "@/components/logout-button";

export function StudentHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7]" />

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4D2FB2] to-[#696FC7] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#4D2FB2] to-[#696FC7]">
              Evalora
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4D2FB2]/10 border border-[#B7BDF7]/60 backdrop-blur-sm">
              <span className="text-base">🔥</span>
              <span className="text-sm font-bold text-[#4D2FB2] dark:text-[#B7BDF7]">7 Day Streak</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#B7BDF7]/40 to-[#696FC7]/20 border border-[#B7BDF7] flex items-center justify-center text-[#4D2FB2] dark:text-[#B7BDF7] font-bold text-sm ring-2 ring-transparent hover:ring-purple-500/20 transition-all cursor-pointer">
              JD
            </div>
            <LogoutButton
              iconOnly
              variant="ghost"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
