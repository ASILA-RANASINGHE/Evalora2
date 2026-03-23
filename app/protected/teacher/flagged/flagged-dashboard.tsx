"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  User,
  BookOpen,
  Calendar,
  BarChart3,
  Brain,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getReviewDetail,
  saveReviewDraft,
  completeReview,
  bulkApproveReviews,
} from "@/lib/actions/review";
import type {
  PendingReviewItem,
  CompletedReviewItem,
  ReviewStats,
  ReviewDetail,
  ReviewPriority,
} from "@/lib/actions/review";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initialStats: ReviewStats;
  initialPending: PendingReviewItem[];
  initialCompleted: CompletedReviewItem[];
  adminMode: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function confidenceColor(conf: number) {
  if (conf >= 85) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (conf >= 70) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
}

function priorityColor(p: ReviewPriority) {
  if (p === "High") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (p === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
}

function statusColor(s: string) {
  if (s === "COMPLETED") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (s === "IN_PROGRESS") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 10;

// ─── Main component ────────────────────────────────────────────────────────────

export function FlaggedDashboard({ initialStats, initialPending, initialCompleted, adminMode }: Props) {
  const [stats] = useState(initialStats);
  const [pending, setPending] = useState(initialPending);
  const [completed, setCompleted] = useState(initialCompleted);

  // Filters for pending tab
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterConfidence, setFilterConfidence] = useState("all");
  const [sortBy, setSortBy] = useState<"requestedAt" | "priority" | "aiConfidence">("requestedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pendingPage, setPendingPage] = useState(1);

  // Filters for completed tab
  const [completedSearch, setCompletedSearch] = useState("");
  const [completedPage, setCompletedPage] = useState(1);

  // Selections for bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Review form state
  const [finalMarks, setFinalMarks] = useState<number | "">(0);
  const [agreeWithAI, setAgreeWithAI] = useState(true);
  const [overrideReason, setOverrideReason] = useState("");
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Bulk approve modal
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Derived subject list for filter
  const subjects = useMemo(() => {
    const s = new Set(pending.map((r) => r.subjectName));
    return Array.from(s).sort();
  }, [pending]);

  // Filtered + sorted pending
  const filteredPending = useMemo(() => {
    let items = [...pending];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.paperTitle.toLowerCase().includes(q) ||
          r.questionDisplay.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q)
      );
    }
    if (filterSubject !== "all") items = items.filter((r) => r.subjectName === filterSubject);
    if (filterStatus !== "all") items = items.filter((r) => r.status === filterStatus);
    if (filterPriority !== "all") items = items.filter((r) => r.priority === filterPriority);
    if (filterConfidence !== "all") {
      if (filterConfidence === "high") items = items.filter((r) => r.aiConfidence >= 85);
      else if (filterConfidence === "medium") items = items.filter((r) => r.aiConfidence >= 70 && r.aiConfidence < 85);
      else items = items.filter((r) => r.aiConfidence < 70);
    }

    items.sort((a, b) => {
      let diff = 0;
      if (sortBy === "requestedAt") diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      else if (sortBy === "priority") {
        const p = { High: 3, Medium: 2, Low: 1 };
        diff = p[a.priority] - p[b.priority];
      } else {
        diff = a.aiConfidence - b.aiConfidence;
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return items;
  }, [pending, search, filterSubject, filterStatus, filterPriority, filterConfidence, sortBy, sortDir]);

  const totalPendingPages = Math.max(1, Math.ceil(filteredPending.length / PAGE_SIZE));
  const pagedPending = filteredPending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);

  // Filtered completed
  const filteredCompleted = useMemo(() => {
    if (!completedSearch) return completed;
    const q = completedSearch.toLowerCase();
    return completed.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.paperTitle.toLowerCase().includes(q) ||
        r.questionDisplay.toLowerCase().includes(q)
    );
  }, [completed, completedSearch]);

  const totalCompletedPages = Math.max(1, Math.ceil(filteredCompleted.length / PAGE_SIZE));
  const pagedCompleted = filteredCompleted.slice((completedPage - 1) * PAGE_SIZE, completedPage * PAGE_SIZE);

  // High-confidence items eligible for bulk approve
  const bulkEligible = useMemo(
    () => Array.from(selected).filter((id) => {
      const item = pending.find((r) => r.id === id);
      return item && item.aiConfidence >= 85;
    }),
    [selected, pending]
  );

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function openReview(reviewId: string) {
    setReviewLoading(true);
    setReviewModalOpen(true);
    try {
      const detail = await getReviewDetail(reviewId);
      if (!detail) return;
      setReviewDetail(detail);
      setFinalMarks(detail.finalMarks ?? detail.aiMarks);
      setAgreeWithAI(detail.agreeWithAI);
      setOverrideReason(detail.overrideReason ?? "");
      setTeacherFeedback(detail.teacherFeedback ?? "");
      // Mark as in_progress in the local state
      setPending((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: "IN_PROGRESS" } : r))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  }

  function closeReviewModal() {
    setReviewModalOpen(false);
    setReviewDetail(null);
    setConfirmOpen(false);
  }

  async function handleSaveDraft() {
    if (!reviewDetail || finalMarks === "") return;
    startTransition(async () => {
      await saveReviewDraft(reviewDetail.id, {
        finalMarks: Number(finalMarks),
        agreeWithAI,
        overrideReason: overrideReason || undefined,
        teacherFeedback: teacherFeedback || undefined,
      });
      closeReviewModal();
    });
  }

  async function handleCompleteReview() {
    if (!reviewDetail || finalMarks === "") return;
    const fm = Number(finalMarks);

    // Quality control: feedback required if mark change > 50% of total
    const change = Math.abs(fm - reviewDetail.aiMarks);
    if (!agreeWithAI && change / reviewDetail.marksAvailable > 0.5 && !teacherFeedback.trim()) {
      alert("Please provide teacher feedback when changing marks by more than 50% of the total.");
      return;
    }

    startTransition(async () => {
      await completeReview(reviewDetail.id, {
        finalMarks: fm,
        agreeWithAI,
        overrideReason: overrideReason || undefined,
        teacherFeedback: teacherFeedback || undefined,
      });
      // Remove from pending, add to completed
      const now = new Date();
      setPending((prev) => prev.filter((r) => r.id !== reviewDetail.id));
      setCompleted((prev) => [
        {
          id: reviewDetail.id,
          studentName: reviewDetail.studentName,
          paperTitle: reviewDetail.paperTitle,
          subjectName: reviewDetail.subjectName,
          questionDisplay: reviewDetail.questionDisplay,
          reviewerName: adminMode ? "Admin" : "You",
          completedAt: now,
          aiMarks: reviewDetail.aiMarks,
          finalMarks: fm,
          change: fm - reviewDetail.aiMarks,
          agreeWithAI,
          overrideReason: overrideReason || null,
          teacherFeedback: teacherFeedback || null,
        },
        ...prev,
      ]);
      setConfirmOpen(false);
      closeReviewModal();
    });
  }

  async function handleBulkApprove() {
    if (bulkEligible.length === 0) return;
    startTransition(async () => {
      await bulkApproveReviews(bulkEligible);
      const approvedSet = new Set(bulkEligible);
      const approved = pending.filter((r) => approvedSet.has(r.id));
      const now = new Date();
      setPending((prev) => prev.filter((r) => !approvedSet.has(r.id)));
      setCompleted((prev) => [
        ...approved.map((r) => ({
          id: r.id,
          studentName: r.studentName,
          paperTitle: r.paperTitle,
          subjectName: r.subjectName,
          questionDisplay: r.questionDisplay,
          reviewerName: adminMode ? "Admin" : "You",
          completedAt: now,
          aiMarks: r.aiMarks,
          finalMarks: r.aiMarks,
          change: 0,
          agreeWithAI: true,
          overrideReason: null,
          teacherFeedback: "Approved — AI assessment accepted.",
        })),
        ...prev,
      ]);
      setSelected(new Set());
      setBulkConfirmOpen(false);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flag}
          iconColor="bg-amber-500/10 text-amber-600"
          label="Pending Reviews"
          value={String(stats.totalPending + stats.totalInProgress)}
          sub={`${stats.totalInProgress} in progress`}
        />
        <StatCard
          icon={CheckCircle2}
          iconColor="bg-emerald-500/10 text-emerald-600"
          label="Completed This Week"
          value={String(stats.completedThisWeek)}
          sub={`${stats.totalCompleted} total`}
        />
        <StatCard
          icon={Brain}
          iconColor="bg-purple-500/10 text-purple-600"
          label="Avg AI Confidence"
          value={stats.avgConfidencePending > 0 ? `${stats.avgConfidencePending}%` : "—"}
          sub="On pending reviews"
        />
        <StatCard
          icon={Clock}
          iconColor="bg-red-500/10 text-red-600"
          label="Oldest Pending"
          value={stats.oldestPendingDate ? formatDate(stats.oldestPendingDate) : "—"}
          sub={stats.oldestPendingDate ? "Needs attention" : "Up to date"}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            Pending
            {pending.length > 0 && (
              <span className="ml-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </TabsTrigger>
        </TabsList>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student, paper, question…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPendingPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <FilterSelect value={filterSubject} onChange={(v) => { setFilterSubject(v); setPendingPage(1); }}
              options={[{ value: "all", label: "All Subjects" }, ...subjects.map((s) => ({ value: s, label: s }))]} />
            <FilterSelect value={filterStatus} onChange={(v) => { setFilterStatus(v); setPendingPage(1); }}
              options={[{ value: "all", label: "All Status" }, { value: "PENDING", label: "Pending" }, { value: "IN_PROGRESS", label: "In Progress" }]} />
            <FilterSelect value={filterPriority} onChange={(v) => { setFilterPriority(v); setPendingPage(1); }}
              options={[{ value: "all", label: "All Priority" }, { value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]} />
            <FilterSelect value={filterConfidence} onChange={(v) => { setFilterConfidence(v); setPendingPage(1); }}
              options={[{ value: "all", label: "All Confidence" }, { value: "high", label: "High (≥85%)" }, { value: "medium", label: "Medium (70-84%)" }, { value: "low", label: "Low (<70%)" }]} />
            <FilterSelect value={sortBy} onChange={(v) => setSortBy(v as typeof sortBy)}
              options={[{ value: "requestedAt", label: "Sort: Date" }, { value: "priority", label: "Sort: Priority" }, { value: "aiConfidence", label: "Sort: Confidence" }]} />
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="px-2 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium"
            >
              {sortDir === "desc" ? "↓ Desc" : "↑ Asc"}
            </button>
          </div>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
              <span className="font-medium text-purple-700 dark:text-purple-300">{selected.size} selected</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{bulkEligible.length} eligible for bulk approve (AI confidence ≥85%)</span>
              <Button
                size="sm"
                disabled={bulkEligible.length === 0 || isPending}
                onClick={() => setBulkConfirmOpen(true)}
                className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Approve All Eligible ({bulkEligible.length})
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="h-7 text-xs">
                Clear
              </Button>
            </div>
          )}

          {/* Table */}
          {filteredPending.length === 0 ? (
            <EmptyState message="No reviews match your filters." />
          ) : (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={pagedPending.length > 0 && pagedPending.every((r) => selected.has(r.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelected((prev) => new Set([...prev, ...pagedPending.map((r) => r.id)]));
                            } else {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                pagedPending.forEach((r) => next.delete(r.id));
                                return next;
                              });
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="p-3 font-medium">Student</th>
                      <th className="p-3 font-medium">Paper / Question</th>
                      <th className="p-3 font-medium hidden md:table-cell">Subject</th>
                      <th className="p-3 font-medium hidden lg:table-cell">Submitted</th>
                      <th className="p-3 font-medium">AI Marks</th>
                      <th className="p-3 font-medium">Confidence</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Priority</th>
                      <th className="p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pagedPending.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={(e) => {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(r.id);
                                else next.delete(r.id);
                                return next;
                              });
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{r.studentName}</div>
                          <div className="text-xs text-muted-foreground">{r.grade}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-xs line-clamp-1">{r.paperTitle}</div>
                          <div className="text-xs text-muted-foreground">{r.questionDisplay}</div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{r.subjectName}</td>
                        <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{r.submittedAgo}</td>
                        <td className="p-3 font-semibold">
                          {r.aiMarks}/{r.marksAvailable}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceColor(r.aiConfidence)}`}>
                            {r.aiConfidence}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>
                            {r.status === "IN_PROGRESS" ? "In Review" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColor(r.priority)}`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            onClick={() => openReview(r.id)}
                            className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Review Now
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <span>
                  {filteredPending.length === 0
                    ? "No results"
                    : `${(pendingPage - 1) * PAGE_SIZE + 1}–${Math.min(pendingPage * PAGE_SIZE, filteredPending.length)} of ${filteredPending.length}`}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={pendingPage <= 1} onClick={() => setPendingPage((p) => p - 1)} className="h-7 w-7 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 py-1 text-xs font-medium">{pendingPage}/{totalPendingPages}</span>
                  <Button size="sm" variant="outline" disabled={pendingPage >= totalPendingPages} onClick={() => setPendingPage((p) => p + 1)} className="h-7 w-7 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ── Completed Tab ── */}
        <TabsContent value="completed" className="mt-4 space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews…"
              value={completedSearch}
              onChange={(e) => { setCompletedSearch(e.target.value); setCompletedPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {filteredCompleted.length === 0 ? (
            <EmptyState message="No completed reviews yet." />
          ) : (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Student</th>
                      <th className="p-3 font-medium">Paper / Question</th>
                      <th className="p-3 font-medium hidden md:table-cell">Subject</th>
                      <th className="p-3 font-medium hidden lg:table-cell">Reviewed By</th>
                      <th className="p-3 font-medium hidden lg:table-cell">Date</th>
                      <th className="p-3 font-medium">AI Marks</th>
                      <th className="p-3 font-medium">Final Marks</th>
                      <th className="p-3 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pagedCompleted.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{r.studentName}</td>
                        <td className="p-3">
                          <div className="font-medium text-xs line-clamp-1">{r.paperTitle}</div>
                          <div className="text-xs text-muted-foreground">{r.questionDisplay}</div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{r.subjectName}</td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">{r.reviewerName}</td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDate(r.completedAt)}</td>
                        <td className="p-3">{r.aiMarks}</td>
                        <td className="p-3 font-semibold">{r.finalMarks}</td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold ${r.change > 0 ? "text-emerald-600" : r.change < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                            {r.change > 0 ? `+${r.change}` : r.change === 0 ? "No change" : r.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                <span>
                  {filteredCompleted.length === 0
                    ? "No results"
                    : `${(completedPage - 1) * PAGE_SIZE + 1}–${Math.min(completedPage * PAGE_SIZE, filteredCompleted.length)} of ${filteredCompleted.length}`}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={completedPage <= 1} onClick={() => setCompletedPage((p) => p - 1)} className="h-7 w-7 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 py-1 text-xs font-medium">{completedPage}/{totalCompletedPages}</span>
                  <Button size="sm" variant="outline" disabled={completedPage >= totalCompletedPages} onClick={() => setCompletedPage((p) => p + 1)} className="h-7 w-7 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Review Detail Modal ── */}
      <Dialog open={reviewModalOpen} onOpenChange={(open: boolean) => { if (!open) closeReviewModal(); }}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0">
          {reviewLoading || !reviewDetail ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Flag className="h-5 w-5 text-amber-500" />
                  Manual Review — {reviewDetail.questionDisplay}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {reviewDetail.paperTitle} · {reviewDetail.subjectName}
                </p>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x">

                {/* LEFT: Student info + Question */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Student Info</h3>
                    <div className="space-y-2">
                      <InfoRow icon={User} label="Name" value={reviewDetail.studentName} />
                      <InfoRow icon={BarChart3} label="Grade" value={reviewDetail.grade} />
                      <InfoRow icon={BookOpen} label="Overall Score" value={`${reviewDetail.overallScore}%`} />
                      <InfoRow icon={Calendar} label="Submitted" value={reviewDetail.submittedAgo} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Question</h3>
                    <div className="p-3 bg-muted/30 rounded-lg border text-sm">
                      {reviewDetail.questionText}
                    </div>
                    <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Marking Scheme / Correct Answer</p>
                      <p className="text-sm">{reviewDetail.correctAnswer}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColor(reviewDetail.priority)}`}>
                        {reviewDetail.priority} Priority
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(reviewDetail.status)}`}>
                        {reviewDetail.status === "IN_PROGRESS" ? "In Review" : reviewDetail.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CENTER: Student answer + AI analysis */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Student&apos;s Answer</h3>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm min-h-[80px]">
                      {reviewDetail.studentAnswer || <span className="text-muted-foreground italic">No answer provided</span>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Analysis</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <span className="text-sm text-muted-foreground">AI Awarded</span>
                        <span className="font-bold text-lg">{reviewDetail.aiMarks}<span className="text-sm font-normal text-muted-foreground">/{reviewDetail.marksAvailable}</span></span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                        <span className="text-sm text-muted-foreground">AI Confidence</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${confidenceColor(reviewDetail.aiConfidence)}`}>
                          {reviewDetail.aiConfidence}%
                        </span>
                      </div>
                      {reviewDetail.aiFeedback && (
                        <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                            <Brain className="h-3 w-3" /> AI Feedback
                          </p>
                          <p className="text-sm text-muted-foreground">{reviewDetail.aiFeedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Teacher marking tools */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teacher Marking</h3>

                  {/* Marks input */}
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Final Marks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={reviewDetail.marksAvailable}
                        step={0.5}
                        value={finalMarks}
                        onChange={(e) => {
                          const v = e.target.value === "" ? "" : Number(e.target.value);
                          if (v !== "" && v > reviewDetail.marksAvailable) return;
                          setFinalMarks(v);
                          if (v !== "" && Number(v) !== reviewDetail.aiMarks) setAgreeWithAI(false);
                          else setAgreeWithAI(true);
                        }}
                        className="w-20 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-sm text-muted-foreground">/ {reviewDetail.marksAvailable}</span>
                      {finalMarks !== "" && Number(finalMarks) > reviewDetail.marksAvailable && (
                        <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Exceeds max</span>
                      )}
                    </div>
                  </div>

                  {/* Agree / Override radio */}
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Decision</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={agreeWithAI}
                          onChange={() => { setAgreeWithAI(true); setFinalMarks(reviewDetail.aiMarks); setOverrideReason(""); }}
                        />
                        <span className="text-sm">Agree with AI ({reviewDetail.aiMarks}/{reviewDetail.marksAvailable})</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!agreeWithAI}
                          onChange={() => setAgreeWithAI(false)}
                        />
                        <span className="text-sm">Override AI marks</span>
                      </label>
                    </div>
                  </div>

                  {/* Override reason */}
                  {!agreeWithAI && (
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Override Reason</label>
                      <select
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select reason…</option>
                        <option value="Partial credit deserved">Partial credit deserved</option>
                        <option value="Alternative correct answer accepted">Alternative correct answer accepted</option>
                        <option value="AI misread the answer">AI misread the answer</option>
                        <option value="Context not considered">Context not considered</option>
                        <option value="Spelling/grammar errors overlooked">Spelling/grammar errors overlooked</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  {/* Teacher feedback */}
                  <div>
                    <label className="text-sm font-medium block mb-1.5 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Feedback to Student
                      {!agreeWithAI && <span className="text-xs text-red-500">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Optional feedback visible to the student after review…"
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  {/* Warnings */}
                  {finalMarks !== "" && Number(finalMarks) !== reviewDetail.aiMarks && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>You are changing the AI marks. Please ensure your decision is justified.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="px-6 py-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button variant="outline" onClick={closeReviewModal} className="sm:mr-auto" disabled={isPending}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} disabled={isPending || finalMarks === ""}>
                  {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Save Draft
                </Button>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={isPending || finalMarks === "" || (typeof finalMarks === "number" && finalMarks > reviewDetail.marksAvailable)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve &amp; Notify Student
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirm Complete Modal ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Review Decision</DialogTitle>
          </DialogHeader>
          {reviewDetail && (
            <div className="space-y-3 text-sm">
              <p>You are about to finalise the review for <strong>{reviewDetail.questionDisplay}</strong> — <span className="text-muted-foreground">{reviewDetail.studentName}</span>.</p>
              <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">AI Marks</span><span>{reviewDetail.aiMarks}/{reviewDetail.marksAvailable}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Final Marks</span><span className="font-semibold">{finalMarks}/{reviewDetail.marksAvailable}</span></div>
                {!agreeWithAI && <div className="flex justify-between"><span className="text-muted-foreground">Reason</span><span>{overrideReason || "—"}</span></div>}
              </div>
              <p className="text-muted-foreground text-xs">The student will receive an in-app notification with your feedback.</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleCompleteReview} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Confirm &amp; Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Approve Confirm Modal ── */}
      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Approve {bulkEligible.length} Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>You are approving <strong>{bulkEligible.length}</strong> reviews where the AI confidence is ≥85%.</p>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>AI marks will be accepted as-is for all selected eligible reviews. Students will be notified automatically.</span>
            </div>
            {selected.size > bulkEligible.length && (
              <p className="text-xs text-muted-foreground">
                {selected.size - bulkEligible.length} selected reviews with confidence &lt;85% will be skipped and must be reviewed individually.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkConfirmOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleBulkApprove} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Approve {bulkEligible.length} Reviews
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconColor, label, value, sub }: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-5">
        <div className={`p-2.5 rounded-xl w-fit ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
