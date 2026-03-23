"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { StudentProgressData } from "@/lib/actions/analytics";

export function DownloadProgressPDF({ data }: { data: StudentProgressData }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 16;
      const cW = W - margin * 2; // content width
      let y = 0;

      // ── Palette ──────────────────────────────────────────────────
      const C = {
        purple:    [77,  47,  178] as [number,number,number],
        mid:       [105, 111, 199] as [number,number,number],
        lavender:  [183, 189, 247] as [number,number,number],
        cream:     [255, 253, 241] as [number,number,number],
        dark:      [28,  26,  50]  as [number,number,number],
        gray:      [110, 110, 130] as [number,number,number],
        lineGray:  [220, 220, 235] as [number,number,number],
        green:     [22,  163, 74]  as [number,number,number],
        amber:     [217, 119, 6]   as [number,number,number],
        red:       [220, 38,  38]  as [number,number,number],
        blue:      [37,  99,  235] as [number,number,number],
        altRow:    [248, 248, 254] as [number,number,number],
      };

      const addPage = () => { doc.addPage(); y = margin + 5; };
      const checkY  = (need: number) => { if (y + need > 278) addPage(); };

      // ── Helpers ───────────────────────────────────────────────────
      const sectionHeader = (title: string) => {
        checkY(12);
        doc.setFillColor(...C.purple);
        doc.roundedRect(margin, y, cW, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(title.toUpperCase(), margin + 4, y + 5.5);
        y += 12;
      };

      const kvRow = (label: string, value: string, alt: boolean, valueColor?: [number,number,number]) => {
        checkY(7);
        if (alt) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, 7, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
        doc.text(label, margin + 3, y + 5);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...(valueColor ?? C.purple));
        doc.text(value, margin + cW - 3, y + 5, { align: "right" });
        doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
        y += 7;
      };

      const thRow = (cols: { t: string; x: number; align?: "left"|"right"|"center" }[]) => {
        checkY(7);
        doc.setFillColor(...C.lavender);
        doc.rect(margin, y, cW, 7, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
        cols.forEach(c => doc.text(c.t, c.x, y + 5, { align: c.align || "left" }));
        y += 7;
      };

      const divider = (gap = 5) => { y += gap; };

      // ════════════════════════════════════════════════════════════
      // COVER HEADER
      // ════════════════════════════════════════════════════════════
      doc.setFillColor(...C.purple);
      doc.rect(0, 0, W, 44, "F");
      // accent line
      doc.setFillColor(...C.lavender);
      doc.rect(0, 44, W, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(24);
      doc.text("Evalora", margin, 20);

      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.setTextColor(183, 189, 247);
      doc.text("Student Progress Report", margin, 30);

      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
        margin, 38
      );

      y = 54;

      // ════════════════════════════════════════════════════════════
      // SECTION 1 — Overview
      // ════════════════════════════════════════════════════════════
      sectionHeader("Overview Statistics");
      const s = data.overviewStats;
      kvRow("Papers Completed",       `${s.papersDone} (${s.papersWeekly > 0 ? `+${s.papersWeekly} this week` : "none this week"})`, false);
      kvRow("Average Score",          `${s.averageScore}%`, true, s.averageScore >= 75 ? C.green : s.averageScore >= 50 ? C.amber : C.red);
      kvRow("Score Trend",            `${s.scoreTrend > 0 ? "+" : ""}${s.scoreTrend}% vs last week`, false, s.scoreTrend >= 0 ? C.green : C.red);
      kvRow("Study Streak",           `${s.studyStreak} days  (best: ${s.bestStreak} days)`, true);
      kvRow("Class Rank",             `#${s.rank} of ${s.totalStudents}`, false);
      kvRow("Percentile",             `Top ${100 - s.percentile}%`, true, C.green);
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 2 — Subject Scores
      // ════════════════════════════════════════════════════════════
      sectionHeader("Subject Performance");
      thRow([
        { t: "Subject",     x: margin + 3 },
        { t: "Your Score",  x: margin + 90,       align: "center" },
        { t: "Class Avg",   x: margin + 130,      align: "center" },
        { t: "Papers",      x: margin + cW - 3,   align: "right" },
      ]);

      data.subjectScores.forEach((s, i) => {
        checkY(7);
        if (i % 2 === 0) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, 7, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
        doc.text(s.subject, margin + 3, y + 5);
        const sc: [number,number,number] = s.yourScore >= 75 ? C.green : s.yourScore >= 50 ? C.amber : C.red;
        doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
        doc.text(`${s.yourScore}%`, margin + 90 + 12, y + 5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
        doc.text(`${s.classAvg}%`, margin + 130 + 12, y + 5, { align: "center" });
        doc.setTextColor(...C.dark);
        doc.text(`${s.papersAttempted}`, margin + cW - 3, y + 5, { align: "right" });
        doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
        y += 7;
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 3 — Topic Mastery
      // ════════════════════════════════════════════════════════════
      sectionHeader("Topic Mastery");
      thRow([
        { t: "Topic",    x: margin + 3 },
        { t: "Subject",  x: margin + 78 },
        { t: "Accuracy", x: margin + 130,    align: "center" },
        { t: "Status",   x: margin + cW - 3, align: "right" },
      ]);

      data.topicMastery.forEach((t, i) => {
        checkY(7);
        if (i % 2 === 0) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, 7, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
        const topicLabel = t.topic.length > 26 ? t.topic.slice(0, 26) + "…" : t.topic;
        doc.text(topicLabel, margin + 3, y + 5);
        doc.setTextColor(...C.gray);
        doc.text(t.subject.length > 14 ? t.subject.slice(0, 14) + "…" : t.subject, margin + 78, y + 5);
        const ac: [number,number,number] = t.accuracy >= 80 ? C.green : t.accuracy >= 65 ? C.amber : C.red;
        doc.setFont("helvetica", "bold"); doc.setTextColor(...ac);
        doc.text(`${t.accuracy}%`, margin + 130 + 12, y + 5, { align: "center" });
        const sc: [number,number,number] = t.status === "Mastered" ? C.green : t.status === "Learning" ? C.blue : t.status === "Needs Work" ? C.amber : C.red;
        doc.setTextColor(...sc);
        doc.text(t.status, margin + cW - 3, y + 5, { align: "right" });
        doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
        y += 7;
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 4 — Weak Areas
      // ════════════════════════════════════════════════════════════
      if (data.weakAreas.length > 0) {
        sectionHeader("Areas Needing Improvement");
        thRow([
          { t: "Topic",       x: margin + 3 },
          { t: "Subject",     x: margin + 72 },
          { t: "Accuracy",    x: margin + 118,     align: "center" },
          { t: "Target",      x: margin + 148,     align: "center" },
          { t: "Days Ago",    x: margin + cW - 3,  align: "right" },
        ]);

        data.weakAreas.forEach((w, i) => {
          checkY(7);
          if (i % 2 === 0) {
            doc.setFillColor(255, 248, 248);
            doc.rect(margin, y, cW, 7, "F");
          }
          doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
          doc.text(w.topic.length > 25 ? w.topic.slice(0, 25) + "…" : w.topic, margin + 3, y + 5);
          doc.setTextColor(...C.gray);
          doc.text(w.subject.length > 14 ? w.subject.slice(0, 14) + "…" : w.subject, margin + 72, y + 5);
          doc.setFont("helvetica", "bold"); doc.setTextColor(...C.red);
          doc.text(`${w.accuracy}%`, margin + 118 + 10, y + 5, { align: "center" });
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
          doc.text(`${w.target}%`, margin + 148 + 10, y + 5, { align: "center" });
          doc.setTextColor(...C.dark);
          doc.text(`${w.daysSincePracticed}d`, margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
        divider(8);
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 5 — Question Type Stats
      // ════════════════════════════════════════════════════════════
      if (data.questionTypeStats.length > 0) {
        sectionHeader("Performance by Question Type");
        thRow([
          { t: "Type",      x: margin + 3 },
          { t: "Attempted", x: margin + 90,      align: "center" },
          { t: "Accuracy",  x: margin + cW - 3,  align: "right" },
        ]);
        data.questionTypeStats.forEach((q, i) => {
          checkY(7);
          if (i % 2 === 0) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, 7, "F"); }
          doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.dark);
          doc.text(q.type, margin + 3, y + 5);
          doc.setTextColor(...C.gray);
          doc.text(`${q.attempted}`, margin + 90 + 12, y + 5, { align: "center" });
          const ac: [number,number,number] = q.accuracy >= 75 ? C.green : q.accuracy >= 50 ? C.amber : C.red;
          doc.setFont("helvetica", "bold"); doc.setTextColor(...ac);
          doc.text(`${q.accuracy}%`, margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
        divider(8);
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 6 — Risk Alerts
      // ════════════════════════════════════════════════════════════
      if (data.riskAlerts.length > 0) {
        sectionHeader("Alerts & Recommendations");
        data.riskAlerts.forEach((alert) => {
          checkY(22);
          const aColor: [number,number,number] = alert.level === "critical" ? C.red : alert.level === "warning" ? C.amber : C.green;
          doc.setFillColor(...C.altRow);
          doc.roundedRect(margin, y, cW, 20, 2, 2, "F");
          doc.setFillColor(...aColor);
          doc.roundedRect(margin, y, 3, 20, 1, 1, "F");
          doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C.dark);
          doc.text(alert.title, margin + 7, y + 6.5);
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.gray);
          const reasonLines = doc.splitTextToSize(alert.reason, cW - 12);
          doc.text(reasonLines.slice(0, 1), margin + 7, y + 12);
          doc.setTextColor(...C.mid);
          const actionLines = doc.splitTextToSize(`→ ${alert.action}`, cW - 12);
          doc.text(actionLines.slice(0, 1), margin + 7, y + 17);
          y += 23;
        });
      }

      // ════════════════════════════════════════════════════════════
      // FOOTER on every page
      // ════════════════════════════════════════════════════════════
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setFillColor(...C.purple);
        doc.rect(0, 289, W, 8, "F");
        doc.setTextColor(183, 189, 247); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text("Evalora — Confidential Student Progress Report", margin, 294);
        doc.text(`Page ${p} of ${pages}`, W - margin, 294, { align: "right" });
      }

      doc.save(`Evalora-Student-Progress-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generate}
      disabled={loading}
      size="sm"
      className="bg-[#4D2FB2] hover:bg-[#696FC7] text-[#FFFDF1] gap-2 shadow-md shadow-[#4D2FB2]/30"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Generating PDF…" : "Download Report"}
    </Button>
  );
}
