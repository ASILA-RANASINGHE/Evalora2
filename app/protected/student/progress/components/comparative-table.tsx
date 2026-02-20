"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparativeRow } from "@/lib/student-progress-mock-data";

export function ComparativeTable({ data }: { data: ComparativeRow[] }) {
  const overall = {
    yourScore: Math.round(data.reduce((s, d) => s + d.yourScore, 0) / data.length),
    classAvg: Math.round(data.reduce((s, d) => s + d.classAvg, 0) / data.length),
    percentileRank: Math.round(data.reduce((s, d) => s + d.percentileRank, 0) / data.length),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparative Analysis</CardTitle>
        <CardDescription>Your performance vs class averages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium text-center">Your Score</th>
                <th className="pb-3 font-medium text-center">Class Avg</th>
                <th className="pb-3 font-medium text-center">Difference</th>
                <th className="pb-3 font-medium text-center">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const diff = row.yourScore - row.classAvg;
                const excels = row.percentileRank >= 75;
                return (
                  <tr
                    key={row.subject}
                    className={`border-b hover:bg-muted/50 ${excels ? "border-l-4 border-l-purple-500" : ""}`}
                  >
                    <td className="py-3 font-medium">{row.subject}</td>
                    <td className="py-3 text-center font-bold">{row.yourScore}%</td>
                    <td className="py-3 text-center text-muted-foreground">{row.classAvg}%</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-gray-500"
                      }`}>
                        {diff > 0 ? <TrendingUp className="h-3 w-3" /> : diff < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {diff > 0 ? "+" : ""}{diff}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.percentileRank >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : row.percentileRank >= 50
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        Top {100 - row.percentileRank}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Overall row */}
              <tr className="bg-muted/50 font-bold">
                <td className="py-3">Overall</td>
                <td className="py-3 text-center">{overall.yourScore}%</td>
                <td className="py-3 text-center text-muted-foreground">{overall.classAvg}%</td>
                <td className="py-3 text-center">
                  <span className={`inline-flex items-center gap-1 ${
                    overall.yourScore - overall.classAvg > 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {overall.yourScore - overall.classAvg > 0 ? "+" : ""}
                    {overall.yourScore - overall.classAvg}%
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    Top {100 - overall.percentileRank}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
