import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, BookOpen } from "lucide-react";
import type { Student } from "@/lib/teacher-mock-data";

interface AttentionNeededProps {
  students: Student[];
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const STATUS_STYLES = {
  "At Risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export function AttentionNeeded({ students }: AttentionNeededProps) {
  const sorted = [...students].sort((a, b) => {
    const aHigh = a.riskSignals.some((s) => s.severity === "high") ? 0 : 1;
    const bHigh = b.riskSignals.some((s) => s.severity === "high") ? 0 : 1;
    return aHigh - bHigh;
  });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Students Needing Attention
        </CardTitle>
        <CardDescription>{students.length} students require follow-up</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">All students are on track!</p>
        ) : (
          sorted.map((student) => (
            <div key={student.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white text-xs font-bold shrink-0">
                  {initials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{student.name}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLES[student.status]}`}>
                      {student.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{student.grade} · {student.avgScore}% avg</p>
                </div>
              </div>
              {/* Risk signals */}
              <div className="flex flex-wrap gap-1.5 ml-12">
                {student.riskSignals.map((sig, i) => (
                  <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sig.severity === "high" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"}`}>
                    {sig.label}
                  </span>
                ))}
              </div>
              {/* Actions */}
              <div className="flex gap-2 ml-12">
                <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Assign Practice
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                  <Mail className="h-3 w-3 mr-1" />
                  Send Message
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
