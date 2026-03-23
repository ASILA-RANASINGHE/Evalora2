"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { AdminReportData } from "@/lib/actions/admin";

export function DownloadAdminReport({ data }: { data: AdminReportData }) {
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

      // ── Palette ───────────────────────────────────────────────────
      const C = {
        purple:   [77,  47,  178] as [number,number,number],
        mid:      [105, 111, 199] as [number,number,number],
        lavender: [183, 189, 247] as [number,number,number],
        cream:    [255, 253, 241] as [number,number,number],
        dark:     [28,  26,  50]  as [number,number,number],
        gray:     [110, 110, 130] as [number,number,number],
        lineGray: [220, 220, 235] as [number,number,number],
        green:    [22,  163, 74]  as [number,number,number],
        amber:    [217, 119, 6]   as [number,number,number],
        red:      [220, 38,  38]  as [number,number,number],
        altRow:   [248, 248, 254] as [number,number,number],
        blue:     [37,  99,  235] as [number,number,number],
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

      const barH = 5; // bar chart row height
      const maxBarW = cW - 70;

      const barRow = (label: string, value: number, maxVal: number, alt: boolean, color: [number,number,number]) => {
        checkY(barH + 3);
        if (alt) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, barH + 3, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.dark);
        const labelShort = label.length > 22 ? label.slice(0, 22) + "…" : label;
        doc.text(labelShort, margin + 3, y + barH);
        const bw = maxVal > 0 ? Math.max(2, (value / maxVal) * maxBarW) : 0;
        const bx = margin + 65;
        doc.setFillColor(220, 220, 235);
        doc.roundedRect(bx, y + 1, maxBarW, barH - 1, 1, 1, "F");
        doc.setFillColor(...color);
        if (bw > 0) doc.roundedRect(bx, y + 1, bw, barH - 1, 1, 1, "F");
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C.purple);
        doc.text(String(value), margin + cW - 3, y + barH, { align: "right" });
        doc.setDrawColor(...C.lineGray); doc.line(margin, y + barH + 3, margin + cW, y + barH + 3);
        y += barH + 3;
      };

      // ════════════════════════════════════════════════════════════
      // COVER HEADER
      // ════════════════════════════════════════════════════════════
      doc.setFillColor(...C.purple);
      doc.rect(0, 0, W, 44, "F");
      doc.setFillColor(...C.lavender);
      doc.rect(0, 44, W, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(24);
      doc.text("Evalora", margin, 20);

      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.setTextColor(183, 189, 247);
      doc.text("Admin Platform Report", margin, 30);

      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
        margin, 38
      );

      y = 54;

      // ════════════════════════════════════════════════════════════
      // SECTION 1 — Platform Overview
      // ════════════════════════════════════════════════════════════
      sectionHeader("Platform Overview");
      kvRow("Total Users",          String(data.totals.users),          false);
      kvRow("Total Content Items",  String(data.totals.content),         true);
      kvRow("Total Attempts",       String(data.totals.attempts),        false);
      kvRow("Pending Reviews",      String(data.totals.pendingReviews),  true, data.totals.pendingReviews > 0 ? C.red : C.green);
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 2 — Users by Role
      // ════════════════════════════════════════════════════════════
      sectionHeader("Users by Role");
      const maxRoleCount = Math.max(...data.usersByRole.map(r => r.count), 1);
      thRow([{ t: "Role", x: margin + 3 }, { t: "Count", x: margin + cW - 3, align: "right" }]);
      data.usersByRole.forEach((r, i) => {
        barRow(r.role, r.count, maxRoleCount, i % 2 === 0, C.purple);
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 3 — Content by Type
      // ════════════════════════════════════════════════════════════
      sectionHeader("Content by Type");
      const maxTypeCount = Math.max(...data.contentByType.map(t => t.count), 1);
      thRow([{ t: "Content Type", x: margin + 3 }, { t: "Count", x: margin + cW - 3, align: "right" }]);
      data.contentByType.forEach((t, i) => {
        barRow(t.type, t.count, maxTypeCount, i % 2 === 0, C.mid);
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 4 — Content by Subject
      // ════════════════════════════════════════════════════════════
      if (data.contentBySubject.length > 0) {
        sectionHeader("Content by Subject");
        const maxSubCount = Math.max(...data.contentBySubject.map(s => s.count), 1);
        thRow([{ t: "Subject", x: margin + 3 }, { t: "Count", x: margin + cW - 3, align: "right" }]);
        data.contentBySubject.slice(0, 10).forEach((s, i) => {
          barRow(s.subject, s.count, maxSubCount, i % 2 === 0, C.lavender);
        });
        divider(8);
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 5 — New Registrations (Last 6 Months)
      // ════════════════════════════════════════════════════════════
      sectionHeader("New Registrations — Last 6 Months");
      const maxReg = Math.max(...data.registrationsByMonth.map(m => m.count), 1);
      thRow([{ t: "Month", x: margin + 3 }, { t: "Registrations", x: margin + cW - 3, align: "right" }]);
      data.registrationsByMonth.forEach((m, i) => {
        barRow(m.month, m.count, maxReg, i % 2 === 0, C.blue);
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 6 — Attempts (Last 6 Months)
      // ════════════════════════════════════════════════════════════
      sectionHeader("Quiz & Paper Attempts — Last 6 Months");
      const maxAtt = Math.max(...data.attemptsByMonth.map(m => m.count), 1);
      thRow([{ t: "Month", x: margin + 3 }, { t: "Attempts", x: margin + cW - 3, align: "right" }]);
      data.attemptsByMonth.forEach((m, i) => {
        barRow(m.month, m.count, maxAtt, i % 2 === 0, C.green);
      });
      divider(8);

      // ════════════════════════════════════════════════════════════
      // SECTION 7 — Top Students
      // ════════════════════════════════════════════════════════════
      if (data.topStudents.length > 0) {
        sectionHeader("Top Students by Average Score");
        thRow([
          { t: "Rank",       x: margin + 3 },
          { t: "Student",    x: margin + 20 },
          { t: "Avg Score",  x: margin + 120,    align: "center" },
          { t: "Attempts",   x: margin + cW - 3, align: "right" },
        ]);
        data.topStudents.forEach((s, i) => {
          checkY(7);
          if (i % 2 === 0) { doc.setFillColor(...C.altRow); doc.rect(margin, y, cW, 7, "F"); }
          doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
          doc.text(`#${i + 1}`, margin + 3, y + 5);
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
          const nameShort = s.name.length > 30 ? s.name.slice(0, 30) + "…" : s.name;
          doc.text(nameShort, margin + 20, y + 5);
          const sc: [number,number,number] = s.avgScore >= 75 ? C.green : s.avgScore >= 50 ? C.amber : C.red;
          doc.setFont("helvetica", "bold"); doc.setTextColor(...sc);
          doc.text(`${s.avgScore}%`, margin + 120 + 12, y + 5, { align: "center" });
          doc.setFont("helvetica", "normal"); doc.setTextColor(...C.gray);
          doc.text(String(s.attempts), margin + cW - 3, y + 5, { align: "right" });
          doc.setDrawColor(...C.lineGray); doc.line(margin, y + 7, margin + cW, y + 7);
          y += 7;
        });
        divider(8);
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
        doc.text("Evalora — Confidential Admin Report", margin, 294);
        doc.text(`Page ${p} of ${pages}`, W - margin, 294, { align: "right" });
      }

      doc.save(`Evalora-Admin-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generate}
      disabled={loading}
      className="bg-[#4D2FB2] hover:bg-[#696FC7] text-[#FFFDF1] gap-2 shadow-md shadow-[#4D2FB2]/30"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Generating PDF…" : "Download Report"}
    </Button>
  );
}
