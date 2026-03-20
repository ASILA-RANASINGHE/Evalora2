"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { LocationResult } from "@/lib/actions/location";

interface LocationSuggestionsProps {
  suggestions: LocationResult[];
  visible: boolean;
  onSelect: (location: LocationResult) => void;
}

export function LocationSuggestions({
  suggestions,
  visible,
  onSelect,
}: LocationSuggestionsProps) {
  const show = visible && suggestions.length > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-30"
        >
          {suggestions.map((loc) => (
            <button
              key={loc.name}
              onClick={() => onSelect(loc)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {loc.name}
                </p>
                {loc.category && (
                  <p className="text-xs text-slate-400 italic truncate">
                    {loc.category.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
