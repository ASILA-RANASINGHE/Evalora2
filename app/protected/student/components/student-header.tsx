"use client";

import { createContext, useContext, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

// ─── Profile Context ─────────────────────────────────────────────
interface ProfileCtxValue {
  initials: string;
  avatarEmoji: string;
  setInitials: (v: string) => void;
  setAvatarEmoji: (v: string) => void;
}

const ProfileCtx = createContext<ProfileCtxValue>({
  initials: "?",
  avatarEmoji: "",
  setInitials: () => {},
  setAvatarEmoji: () => {},
});

export const useStudentProfile = () => useContext(ProfileCtx);

// ─── Avatar bubble ────────────────────────────────────────────────
function AvatarBubble({ emoji, initials }: { emoji: string; initials: string }) {
  if (emoji) {
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center text-base bg-muted border border-border flex-shrink-0">
        {emoji}
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-[#4D2FB2] to-[#696FC7] text-white flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────
interface StudentHeaderProps {
  streak: number;
  initials?: string;
  avatarEmoji?: string | null;
}

export function StudentHeader({ streak, initials: initialInitials = "?", avatarEmoji: initialEmoji = null }: StudentHeaderProps) {
  const [initials, setInitials] = useState(initialInitials);
  const [avatarEmoji, setAvatarEmoji] = useState(initialEmoji ?? "");

  return (
    <ProfileCtx.Provider value={{ initials, avatarEmoji, setInitials, setAvatarEmoji }}>
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
                <span className="text-sm font-bold text-[#4D2FB2] dark:text-[#B7BDF7]">
                  {streak} Day{streak !== 1 ? "s" : ""} Streak
                </span>
              </div>
              <AvatarBubble emoji={avatarEmoji} initials={initials} />
              <LogoutButton
                iconOnly
                variant="ghost"
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              />
            </div>
          </div>
        </div>
      </header>
    </ProfileCtx.Provider>
  );
}
