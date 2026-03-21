"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapDay } from "@/lib/student-progress-mock-data";

function getColor(minutes: number): string {
  if (minutes === 0) return "bg-gray-100 dark:bg-gray-800";
  if (minutes <= 30) return "bg-purple-200 dark:bg-purple-900/40";
  if (minutes <= 60) return "bg-purple-400 dark:bg-purple-700/60";
  return "bg-purple-600 dark:bg-purple-500";
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudyHeatmap({ data }: { data: HeatmapDay[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);

  // Organize data into weeks (columns) × days (rows)
  const weeks: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  // Pad the start to align with Monday
  if (data.length > 0) {
    const firstDay = new Date(data[0].date).getDay();
    const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < mondayOffset; i++) currentWeek.push(null);
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
      <CardHeader>
        <CardTitle className="text-lg">Study Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 pt-0">
              {DAY_LABELS.map((d) => (
                <div key={d} className="h-4 w-8 text-[10px] text-muted-foreground flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`h-4 w-4 rounded-sm ${day ? getColor(day.minutes) : "bg-transparent"} ${
                      day ? "cursor-pointer hover:ring-2 hover:ring-purple-400" : ""
                    }`}
                    onMouseEnter={(e) => {
                      if (day) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget.closest(".relative")?.getBoundingClientRect();
                        if (parent) {
                          setTooltip({ x: rect.left - parent.left + 10, y: rect.top - parent.top - 36, day });
                        }
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.day.date} — {tooltip.day.minutes} min
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-3 rounded-sm bg-purple-200 dark:bg-purple-900/40" />
          <div className="h-3 w-3 rounded-sm bg-purple-400 dark:bg-purple-700/60" />
          <div className="h-3 w-3 rounded-sm bg-purple-600 dark:bg-purple-500" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
