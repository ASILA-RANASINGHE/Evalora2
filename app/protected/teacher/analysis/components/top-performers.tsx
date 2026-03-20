import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import type { TopPerformer } from "@/lib/teacher-mock-data";

interface TopPerformersProps {
  performers: TopPerformer[];
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const rankStyles: Record<number, { ring: string; bg: string; text: string }> = {
  1: { ring: "ring-amber-400", bg: "bg-amber-400", text: "text-white" },
  2: { ring: "ring-gray-400", bg: "bg-gray-400", text: "text-white" },
  3: { ring: "ring-amber-700", bg: "bg-amber-700", text: "text-white" },
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-red-500";
}

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Medal className="h-4 w-4 text-amber-500" />
          Top Performers
        </CardTitle>
        <CardDescription>Top 10 students by average score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {performers.map((p) => {
          const style = rankStyles[p.rank];
          return (
            <div key={p.studentId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
              {/* Rank */}
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${style ? `${style.bg} ${style.text} ring-2 ${style.ring}` : "bg-muted text-muted-foreground"}`}>
                {p.rank}
              </div>
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold shrink-0">
                {initials(p.name)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.strongSubject} · {p.papersCompleted} papers</p>
              </div>
              {/* Score */}
              <span className={`text-sm font-bold shrink-0 ${scoreColor(p.avgScore)}`}>
                {p.avgScore}%
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
