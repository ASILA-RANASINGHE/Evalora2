"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-3">
      <Sun
        className={`h-4 w-4 transition-colors ${
          !isDark ? "text-amber-500" : "text-muted-foreground"
        }`}
      />
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isDark ? "bg-purple-600" : "bg-input"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <Moon
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-purple-400" : "text-muted-foreground"
        }`}
      />
      <span className="text-sm font-medium text-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
    </div>
  );
}
