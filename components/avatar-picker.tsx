"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AVATARS = [
  "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🧑‍🏫", "👨‍🏫", "👩‍🏫",
  "🦊", "🐱", "🐶", "🐸", "🦁", "🐯",
  "🐧", "🐼", "🦄", "🐨", "🦋", "🦅",
  "🌟", "⭐", "🎓", "📚", "🔮", "🎯",
  "🚀", "🌈", "💡", "🏆", "🎨", "🌺",
];

interface AvatarDisplayProps {
  emoji: string | null | undefined;
  initials: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({ emoji, initials, size = "md" }: AvatarDisplayProps) {
  const sizeClasses = {
    sm: "h-10 w-10 text-lg",
    md: "h-16 w-16 text-2xl",
    lg: "h-20 w-20 text-3xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shadow-md flex-shrink-0 ${
        emoji
          ? "bg-muted border border-border text-2xl"
          : "bg-gradient-to-br from-[#4D2FB2] to-[#696FC7] text-white text-base"
      }`}
    >
      {emoji || initials}
    </div>
  );
}

interface AvatarPickerProps {
  value: string | null | undefined;
  initials: string;
  onChange: (emoji: string) => void;
}

export function AvatarPicker({ value, initials, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <AvatarDisplay emoji={value} initials={initials} size="md" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {value ? "Change Avatar" : "Pick Avatar"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 py-2">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
                className={`h-10 w-10 rounded-lg text-2xl flex items-center justify-center transition-all hover:scale-110 hover:bg-muted ${
                  value === emoji
                    ? "bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500 scale-110"
                    : "hover:bg-muted"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Remove avatar (use initials)
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
