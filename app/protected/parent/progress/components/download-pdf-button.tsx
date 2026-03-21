"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ChildProgressBundle } from "@/lib/parent-progress-mock-data";

export function DownloadParentProgressPDF({ data }: { data: ChildProgressBundle }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 16;
      const cW = W - margin * 2;
      let y = 0;

      const C = {
        purple:   [77,  47,  178] as [number,number,number],
        mid:      [105, 111, 199] as [number,number,number],
        lavender: [183, 189, 247] as [number,number,number],
        dark:     [28,  26,  50]  as [number,number,number],
        gray:     [110, 110, 130] as [number,number,number],
        line:     [220, 220, 235] as [number,number,number],
        green:    [22,  163, 74]  as [number,number,number],
        amber:    [217, 119, 6]   as [number,number,number],
        red:      [220, 38,  38]  as [number,number,number],
        alt:      [248, 248, 254] as [number,number,number],
      };

      const addPage = () => { doc.addPage(); y = margin + 5; };
      const checkY  = (need: number) => { if (y + need > 278) addPage(); };

      const sectionHeader = (title: string) => {
        checkY(12);
        doc.setFillColor(...C.purple);
        doc.roundedRect(margin, y, cW, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        doc.text(title.toUpperCase(), margin + 4, y + 5.5);
        y += 12;
      };

      const kvRow = (label: string, value: string, alt: boolean, vColor?: [number,number,number]) => {
        checkY(7);
        if (alt) { doc.setFillColor(...C.alt); doc.rect(margin, y, cW, 7, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
        doc.text(label, margin + 3, y + 5);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...(vColor ?? C.purple));
        doc.text(value, margin + cW - 3, y + 5, { align: "right" });
        doc.setDrawColor(...C.line); doc.line(margin, y + 7, margin + cW, y + 7);
        y += 7;
      };

      const thRow = (cols: { t: string; x: number; align?: "left"|"right"|"center" }[]) => {
        checkY(7);
        doc.setFillColor(...C.lavender); doc.rect(margin, y, cW, 7, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
        cols.forEach(c => doc.text(c.t, c.x, y + 5, { align: c.align || "left" }));
        y += 7;
      };

      // ── HEADER ──────────────────────────────────────────────────
      doc.setFillColor(...C.purple); doc.rect(0, 0, W, 44, "F");
      doc.setFillColor(...C.lavender); doc.rect(0, 44, W, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(24);
      doc.text("Evalora", margin, 20);

      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.setTextColor(183, 189, 247);
      doc.text(`Parent Progress Report — ${data.childInfo.name}`, margin, 30);

      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
        margin, 38
      );

      y = 54;

      // ── SECTION 1: Child Info ────────────────────────────────────
      sectionHeader("Student Information");
      kvRow("Student Name",    data.childInfo.name,                                    false);
      kvRow("Grade",           data.childInfo.grade,                                   true);
      kvRow("Overall Status",  data.childInfo.overallStatus,                           false,
        data.childInfo.overallStatus === "Excellent" ? C.green : data.childInfo.overallStatus === "Good" ? C.amber : C.red);
      kvRow("Average Score",   `${data.childInfo.avgScore}%`,                          true,
        data.childInfo.avgScore >= 75 ? C.green : data.childInfo.avgScore >= 50 ? C.amber : C.red);
      kvRow("Papers Completed", data.childInfo.papersCompleted.toString(),              false);
      kvRow("Quizzes Completed", data.childInfo.quizzesCompleted.toString(),            true);
      kvRow("Last Active",      data.childInfo.lastActive,                              false);
      y += 8;

      // ── SECTION 2: Overview Stats ────────────────────────────────
      sectionHeader("Overview Statistics");
      const o = data.overviewStats;
      kvRow("Study Time This Week", `${o.studyTimeThisWeek} hrs`,    false, o.studyTimeThisWeek >= o.studyTimeLastWeek ? C.green : C.amber);
      kvRow("Study Time Last Week", `${o.studyTimeLastWeek} hrs`,    true);
      kvRow("Average Score",        `${o.avgScore}%`,                false, o.avgScore >= 75 ? C.green : o.avgScore >= 50 ? C.amber : C.red);
      kvRow("Score Trend",          `${o.scoreTrend > 0 ? "+" : ""}${o.scoreTrend}%`, true, o.scoreTrend >= 0 ? C.green : C.red);
      kvRow("Active Days This Week", `${o.activeDaysThisWeek} / 7 days`, false);
      kvRow("Current Streak",        `${o.currentStreak} days`,      true);
      kvRow("Weak Topics",           `${o.weakTopicsCount} topics`,   false, o.weakTopicsCount === 0 ? C.green : o.weakTopicsCount <= 2 ? C.amber : C.red);
      y += 8;

      // ── SECTION 3: Subject Performance ──────────────────────────
      sectionHeader("Subject Performance");
      thRow([
        { t: "Subject",   x: margin + 3 },
        { t: "Avg Score", x: margin + 78,       align: "center" },
        { t: "Papers",    x: margin + 110,       align: "center" },
        { t: "Quizzes",   x: margin + 140,       align: "center" },
        { t: "Mastery",   x: margin + cW - 3,    align: "right" },
      ]);

      data.subjectPerformance.forEach((s, i) => {
        checkY(7);
        if (i % 2 === 0) { doc.setFillColor(...C.alt); doc.rect(margin, y, cW, 7, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
        doc.text(s.subject, margin + 3, y + 5);
        const sc: [number,number,number] = s.avgScore >= 75 ? C.green : s.avgScore >= 50 ? C.amber : C.red;
        doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
        doc.text(`${s.avgScore}%`, margin + 78 + 12, y + 5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
        doc.text(`${s.papersAttempted}`,  margin + 110 + 10, y + 5, { align: "center" });
        doc.text(`${s.quizzesAttempted}`, margin + 140 + 10, y + 5, { align: "center" });
        const mc: [number,number,number] = s.masteryLevel === "Expert" || s.masteryLevel === "Advanced" ? C.green : s.masteryLevel === "Proficient" ? C.mid : C.amber;
        doc.setFont("helvetica", "bold"); doc.setTextColor(...mc);
        doc.text(s.masteryLevel, margin + cW - 3, y + 5, { align: "right" });
        doc.setDrawColor(...C.line); doc.line(margin, y + 7, margin + cW, y + 7);
        y += 7;
      });
      y += 8;

      // ── SECTION 4: Peer Comparison ───────────────────────────────
      if (data.peerComparison.length > 0) {
        sectionHeader("Peer Comparison");
        thRow([
          { t: "Subject",    x: margin + 3 },
          { t: "Score",      x: margin + 80,      align: "center" },
          { t: "Class Avg",  x: margin + 120,     align: "center" },
          { t: "Percentile", x: margin + cW - 3,  align: "right" },
        ]);
        data.peerComparison.forEach((p, i) => {
          checkY(7);
          if (i % 2 === 0) { doc.setFillColor(...C.alt); doc.rect(margin, y, cW, 7, "F"); }
          doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
          doc.text(p.subject, margin + 3, y + 5);
          const sc: [number,number,number] = p.childScore >= 75 ? C.green : p.childScore >= 50 ? C.amber : C.red;
          doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
          doc.text(`${p.childScore}%`, margin + 80 + 12, y + 5, { align: "center" });
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
          doc.text(`${p.classAvg}%`, margin + 120 + 12, y + 5, { align: "center" });
          doc.setFont("helvetica", "bold"); doc.setTextColor(...C.mid);
          doc.text(`Top ${100 - p.percentileRank}%`, margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.line); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
        y += 8;
      }

      // ── SECTION 5: Weak Areas ────────────────────────────────────
      if (data.weakAreas.length > 0) {
        sectionHeader("Areas Needing Attention");
        thRow([
          { t: "Topic",       x: margin + 3 },
          { t: "Subject",     x: margin + 72 },
          { t: "Score",       x: margin + 118,    align: "center" },
          { t: "Target",      x: margin + 148,    align: "center" },
          { t: "Last Practised", x: margin + cW - 3, align: "right" },
        ]);
        data.weakAreas.forEach((w, i) => {
          checkY(7);
          if (i % 2 === 0) { doc.setFillColor(255, 248, 248); doc.rect(margin, y, cW, 7, "F"); }
          doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
          doc.text(w.topic.length > 24 ? w.topic.slice(0, 24) + "…" : w.topic, margin + 3, y + 5);
          doc.setTextColor(...C.gray);
          doc.text(w.subject.length > 14 ? w.subject.slice(0, 14) + "…" : w.subject, margin + 72, y + 5);
          doc.setFont("helvetica", "bold"); doc.setTextColor(...C.red);
          doc.text(`${w.currentScore}%`, margin + 118 + 10, y + 5, { align: "center" });
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
          doc.text(`${w.targetScore}%`, margin + 148 + 10, y + 5, { align: "center" });
          doc.setTextColor(...C.dark);
          doc.text(w.lastPracticed, margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.line); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
        y += 8;
      }

      // ── SECTION 6: Study Habit Insights ─────────────────────────
      if (data.studyHabits.length > 0) {
        sectionHeader("Study Habit Insights");
        data.studyHabits.forEach((h) => {
          checkY(16);
          const hColor: [number,number,number] = h.type === "positive" ? C.green : h.type === "warning" ? C.amber : C.mid;
          doc.setFillColor(...C.alt); doc.roundedRect(margin, y, cW, 14, 2, 2, "F");
          doc.setFillColor(...hColor); doc.roundedRect(margin, y, 3, 14, 1, 1, "F");
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.dark);
          const lines = doc.splitTextToSize(h.text, cW - 10);
          doc.text(lines.slice(0, 2), margin + 7, y + 5.5);
          y += 17;
        });
        y += 4;
      }

      // ── SECTION 7: Recent Activity ───────────────────────────────
      if (data.recentActivity.length > 0) {
        sectionHeader("Recent Activity");
        thRow([
          { t: "Activity",   x: margin + 3 },
          { t: "Detail",     x: margin + 65 },
          { t: "Score",      x: margin + 145,     align: "center" },
          { t: "Time",       x: margin + cW - 3,  align: "right" },
        ]);
        data.recentActivity.slice(0, 10).forEach((a, i) => {
          checkY(7);
          if (i % 2 === 0) { doc.setFillColor(...C.alt); doc.rect(margin, y, cW, 7, "F"); }
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.dark);
          doc.text(a.title.length > 22 ? a.title.slice(0, 22) + "…" : a.title, margin + 3, y + 5);
          doc.setTextColor(...C.gray);
          doc.text(a.detail.length > 28 ? a.detail.slice(0, 28) + "…" : a.detail, margin + 65, y + 5);
          if (a.score !== undefined) {
            const sc: [number,number,number] = a.score >= 75 ? C.green : a.score >= 50 ? C.amber : C.red;
            doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
            doc.text(`${a.score}%`, margin + 145 + 10, y + 5, { align: "center" });
          }
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
          doc.text(a.timestamp, margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.line); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
      }

      // ── FOOTER ──────────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setFillColor(...C.purple); doc.rect(0, 289, W, 8, "F");
        doc.setTextColor(183, 189, 247); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`Evalora — Confidential Parent Progress Report — ${data.childInfo.name}`, margin, 294);
        doc.text(`Page ${p} of ${pages}`, W - margin, 294, { align: "right" });
      }

      doc.save(`Evalora-Progress-${data.childInfo.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generate}
      disabled={loading}
      size="sm"
      className="bg-[#4D2FB2] hover:bg-[#696FC7] text-[#FFFDF1] gap-2 shadow-md"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Generating PDF…" : "Download Report"}
    </Button>
  );
}
