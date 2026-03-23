"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, BookOpen, Clock, Users, FileText } from "lucide-react";
import { insights } from "@/lib/student-progress-mock-data";

const CATEGORY_CONFIG = {
  performance: { icon: TrendingUp, color: "text-emerald-500", dot: "bg-emerald-500" },
  topic: { icon: BookOpen, color: "text-amber-500", dot: "bg-amber-500" },
  time: { icon: Clock, color: "text-blue-500", dot: "bg-blue-500" },
  comparative: { icon: Users, color: "text-purple-500", dot: "bg-purple-500" },
  notes: { icon: FileText, color: "text-cyan-500", dot: "bg-cyan-500" },
};

export function InsightsPanel() {
  return (
    <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#4D2FB2]/5 via-[#FFFDF1] to-[#B7BDF7]/15 dark:from-[#4D2FB2]/20 dark:via-[#4D2FB2]/10 dark:to-[#696FC7]/5 backdrop-blur-sm shadow-sm ring-1 ring-[#B7BDF7]/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#4D2FB2] dark:text-[#B7BDF7]" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => {
          const config = CATEGORY_CONFIG[insight.category];
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`mt-0.5 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
