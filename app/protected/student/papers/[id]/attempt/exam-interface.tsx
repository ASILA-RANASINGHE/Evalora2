"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Flag,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Home,
  Eye,
  RotateCcw,
  BookOpen,
  Save,
  Loader2,
  Brain,
} from "lucide-react";
import {
  startPaperAttempt,
  autoSavePaperAnswers,
  submitPaperAttempt,
  requestManualReview,
  type ExamPaperData,
  type ExamQuestion,
  type ExamResults,
  type QuestionResult,
  type SelectionRule,
} from "@/lib/actions/paper";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamScreen =
  | "loading"
  | "resume_prompt"
  | "exam"
  | "submit_confirm"
  | "processing"
  | "results"
  | "review";

interface QuestionState extends ExamQuestion {
  studentAnswer: string;
  isAnswered: boolean;
  isFlagged: boolean;
  timeSpent: number;
}

type ReviewFilter = "all" | "correct" | "incorrect" | "flagged" | "partial";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a display label like "1(a)(i)" for structured questions, or just the sequential number for MCQ */
function buildQuestionLabel(q: ExamQuestion): string {
  if (q.type === "MCQ" || q.type === "TRUE_FALSE" || q.type === "FILL_BLANK" || !q.questionNumber) return String(q.number);
  let label = String(q.questionNumber);
  if (q.subLabel) label += `(${q.subLabel})`;
  if (q.subSubLabel) label += `(${q.subSubLabel})`;
  return label;
}

/** Return the selection rule this question belongs to, or null */
function getSelectionRule(q: ExamQuestion, rules: SelectionRule[] | null | undefined): SelectionRule | null {
  if (!rules || !q.questionNumber) return null;
  return rules.find((r) => r.questionNumbers.includes(q.questionNumber!)) ?? null;
}

/** Short label for navigation grid, e.g. "1a" or "2bi" */
function buildShortLabel(q: ExamQuestion): string {
  if (q.type === "MCQ" || q.type === "TRUE_FALSE" || q.type === "FILL_BLANK" || !q.questionNumber) return String(q.number);
  let label = String(q.questionNumber);
  if (q.subLabel) label += q.subLabel;
  if (q.subSubLabel) label += q.subSubLabel;
  return label;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function getTimerColor(remaining: number, total: number): string {
  if (remaining > 30 * 60) return "text-green-600";
  if (remaining > 10 * 60) return "text-yellow-600";
  if (remaining > 5 * 60) return "text-red-500";
  return "text-red-600 animate-pulse";
}

function getTimerBg(remaining: number, total: number): string {
  if (remaining > 30 * 60) return "bg-green-50 border-green-200";
  if (remaining > 10 * 60) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

const processingSteps = [
  "Submitting your answers...",
  "Processing questions...",
  "Analysing your responses...",
  "Calculating your score...",
  "Generating feedback...",
  "Finalising results...",
];

const tips = [
  "💡 Reviewing your notes after the exam helps retention by 35%!",
  "📚 Spaced repetition is one of the most effective study techniques.",
  "🧠 Getting enough sleep consolidates memory and improves recall.",
  "✏️  Practice with past papers is the best exam preparation.",
  "⏰ Managing your time well in exams can boost your grade significantly.",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircularProgress({
  percentage,
  size = 120,
}: {
  percentage: number;
  size?: number;
}) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color =
    percentage >= 75
      ? "#16a34a"
      : percentage >= 55
        ? "#ca8a04"
        : percentage >= 35
          ? "#ea580c"
          : "#dc2626";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ExamInterfaceProps {
  paperId: string;
  paperTitle: string;
  incompleteAttempt: { attemptId: string; startedAt: Date } | null;
}

export default function ExamInterface({
  paperId,
  paperTitle,
  incompleteAttempt,
}: ExamInterfaceProps) {
  const router = useRouter();

  // Core state
  const [screen, setScreen] = useState<ExamScreen>("loading");
  const [paper, setPaper] = useState<ExamPaperData | null>(null);
  const [attemptId, setAttemptId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timeSinceStart, setTimeSinceStart] = useState(0);

  // UI state
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "failed" | "idle">("idle");
  const [isOnline, setIsOnline] = useState(true);
  const [manualSaveVisible, setManualSaveVisible] = useState(false);
  const [sessionExpireVisible, setSessionExpireVisible] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [submitConfirmText, setSubmitConfirmText] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [processingTip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  const [results, setResults] = useState<ExamResults | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewRequestSent, setReviewRequestSent] = useState<Set<string>>(new Set());
  const [reviewRequestModal, setReviewRequestModal] = useState<string | null>(null);
  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const [markingSchemeVisible, setMarkingSchemeVisible] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load exam ──────────────────────────────────────────────────────────────

  useEffect(() => {
    // Show resume prompt if there is an incomplete attempt
    if (incompleteAttempt) {
      setScreen("resume_prompt");
    } else {
      loadExam(false);
    }
  }, []);

  async function loadExam(forceNew: boolean) {
    setScreen("loading");
    try {
      // Try to restore from localStorage first
      const cached = localStorage.getItem(`exam_${paperId}`);
      let cachedData: {
        attemptId: string;
        answers: Record<string, string>;
        flagged: string[];
        timeElapsed: number;
      } | null = null;
      if (cached) {
        try { cachedData = JSON.parse(cached); } catch {}
      }

      const data = await startPaperAttempt(paperId);
      const timeLimitSec = data.paper.duration * 60;
      const used = forceNew ? 0 : data.timeElapsed;
      const remaining = Math.max(timeLimitSec - used, 0);

      setAttemptId(data.attemptId);
      setPaper(data.paper);
      setTotalTime(timeLimitSec);
      setTimeRemaining(remaining);
      setTimeSinceStart(used);

      // Merge server answers with cached answers (local takes precedence for recency)
      const serverAnswers = data.existingAnswers;
      const localAnswers = cachedData?.attemptId === data.attemptId ? cachedData.answers : {};
      const mergedAnswers = { ...serverAnswers, ...localAnswers };
      const mergedFlagged = data.existingFlagged;

      const qs: QuestionState[] = data.paper.questions.map((q) => ({
        ...q,
        studentAnswer: mergedAnswers[q.id] ?? "",
        isAnswered: !!(mergedAnswers[q.id]?.trim()),
        isFlagged: mergedFlagged.includes(q.id),
        timeSpent: 0,
      }));
      setQuestions(qs);
      setScreen("exam");
    } catch (err) {
      console.error(err);
    }
  }

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "exam") return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleTimerExpired();
          return 0;
        }
        return t - 1;
      });
      setTimeSinceStart((t) => t + 1);
      setQuestions((qs) =>
        qs.map((q, i) => (i === currentIndex ? { ...q, timeSpent: q.timeSpent + 1 } : q))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, currentIndex]);

  async function handleTimerExpired() {
    await doSubmit();
  }

  // ── Online/offline detection ───────────────────────────────────────────────

  useEffect(() => {
    function onOnline() { setIsOnline(true); setManualSaveVisible(false); }
    function onOffline() { setIsOnline(false); }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ── Session expire detection ───────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "exam") return;
    function resetActivity() { setLastActivityTime(Date.now()); setSessionExpireVisible(false); }
    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime > 30 * 60 * 1000) {
        setSessionExpireVisible(true);
      }
    }, 60 * 1000);
    return () => {
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      clearInterval(interval);
    };
  }, [screen, lastActivityTime]);

  // ── Auto-save ──────────────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(
    (qs: QuestionState[], fId: string) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        setAutoSaveStatus("saving");
        try {
          const answers: Record<string, string> = {};
          const flagged: string[] = [];
          qs.forEach((q) => {
            answers[q.id] = q.studentAnswer;
            if (q.isFlagged) flagged.push(q.id);
          });
          // Save to localStorage as backup
          localStorage.setItem(
            `exam_${paperId}`,
            JSON.stringify({ attemptId: fId, answers, flagged, timeElapsed: timeSinceStart })
          );
          await autoSavePaperAnswers(fId, answers, flagged);
          setAutoSaveStatus("saved");
          setManualSaveVisible(false);
        } catch {
          setAutoSaveStatus("failed");
          setManualSaveVisible(true);
        }
      }, 2000);
    },
    [paperId, timeSinceStart]
  );

  // ── Answer / Flag / Clear ──────────────────────────────────────────────────

  function handleAnswer(value: string) {
    const updated = questions.map((q, i) =>
      i === currentIndex
        ? { ...q, studentAnswer: value, isAnswered: value.trim().length > 0 }
        : q
    );
    setQuestions(updated);
    scheduleAutoSave(updated, attemptId);
  }

  function handleFlag() {
    const updated = questions.map((q, i) =>
      i === currentIndex ? { ...q, isFlagged: !q.isFlagged } : q
    );
    setQuestions(updated);
    scheduleAutoSave(updated, attemptId);
  }

  function handleClearAnswer() {
    setClearConfirmVisible(false);
    const updated = questions.map((q, i) =>
      i === currentIndex ? { ...q, studentAnswer: "", isAnswered: false } : q
    );
    setQuestions(updated);
    scheduleAutoSave(updated, attemptId);
  }

  function navigateTo(index: number) {
    setCurrentIndex(index);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  async function handleManualSave() {
    setAutoSaveStatus("saving");
    try {
      const answers: Record<string, string> = {};
      const flagged: string[] = [];
      questions.forEach((q) => {
        answers[q.id] = q.studentAnswer;
        if (q.isFlagged) flagged.push(q.id);
      });
      await autoSavePaperAnswers(attemptId, answers, flagged);
      setAutoSaveStatus("saved");
      setManualSaveVisible(false);
    } catch {
      setAutoSaveStatus("failed");
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function doSubmit() {
    setScreen("processing");
    const answers: Record<string, string> = {};
    const flagged: string[] = [];
    questions.forEach((q) => {
      answers[q.id] = q.studentAnswer;
      if (q.isFlagged) flagged.push(q.id);
    });

    // Animate processing steps
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      setProcessingStep(step);
      if (step >= processingSteps.length - 1) clearInterval(stepInterval);
    }, 800);

    try {
      const res = await submitPaperAttempt(attemptId, answers, flagged, timeSinceStart);
      clearInterval(stepInterval);
      setProcessingStep(processingSteps.length - 1);
      // Clear local cache
      localStorage.removeItem(`exam_${paperId}`);
      setTimeout(() => {
        setResults(res);
        setScreen("results");
      }, 1000);
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setScreen("exam");
      alert("Submission failed. Please try again.");
    }
  }

  async function handleRequestReview(questionId: string) {
    try {
      await requestManualReview(attemptId, questionId);
      setReviewRequestSent((s) => new Set([...s, questionId]));
      setReviewRequestModal(questionId);
    } catch {}
  }

  // ── Review helpers ─────────────────────────────────────────────────────────

  function getFilteredResults(): QuestionResult[] {
    if (!results) return [];
    switch (reviewFilter) {
      case "correct":
        return results.questionResults.filter((r) => r.isCorrect);
      case "incorrect":
        return results.questionResults.filter((r) => !r.isCorrect && !r.isPartial);
      case "partial":
        return results.questionResults.filter((r) => r.isPartial);
      case "flagged": {
        const flagged = questions.filter((q) => q.isFlagged).map((q) => q.id);
        return results.questionResults.filter((r) => flagged.includes(r.questionId));
      }
      default:
        return results.questionResults;
    }
  }

  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const flaggedCount = questions.filter((q) => q.isFlagged).length;
  const unansweredCount = questions.length - answeredCount;
  const question = questions[currentIndex];

  // ────────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ────────────────────────────────────────────────────────────────────────────

  // ── Loading ────────────────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="text-lg font-medium text-gray-700">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ── Resume Prompt ──────────────────────────────────────────────────────────
  if (screen === "resume_prompt" && incompleteAttempt) {
    const elapsed = Math.floor(
      (Date.now() - new Date(incompleteAttempt.startedAt).getTime()) / 1000
    );
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold">Incomplete Exam Found</h2>
            <p className="text-muted-foreground text-sm">
              You have an incomplete attempt for{" "}
              <strong>{paperTitle}</strong>, started{" "}
              {elapsed > 3600
                ? `${Math.floor(elapsed / 3600)}h ago`
                : elapsed > 60
                  ? `${Math.floor(elapsed / 60)}m ago`
                  : `${elapsed}s ago`}
              . Would you like to resume?
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="bg-purple-600 hover:bg-purple-700 h-12"
              onClick={() => loadExam(false)}
            >
              Resume Exam
            </Button>
            <Button
              variant="outline"
              className="h-12 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => loadExam(true)}
            >
              Abandon & Start New Attempt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (screen === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center space-y-8 max-w-sm px-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-purple-100 animate-ping opacity-40" />
            <div className="relative w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">
              {processingSteps[Math.min(processingStep, processingSteps.length - 1)]}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(((processingStep + 1) / processingSteps.length) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This usually takes 30–60 seconds
          </p>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-700">
            {processingTip}
          </div>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (screen === "results" && results) {
    const timeTakenLabel = (() => {
      const h = Math.floor(results.timeTaken / 3600);
      const m = Math.floor((results.timeTaken % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    })();
    const timeLimitLabel = (() => {
      const h = Math.floor(totalTime / 3600);
      const m = Math.floor((totalTime % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    })();
    const gradeColor: Record<string, string> = {
      "A+": "text-green-600",
      A: "text-green-500",
      "B+": "text-blue-600",
      B: "text-blue-500",
      C: "text-yellow-600",
      S: "text-orange-500",
      F: "text-red-600",
    };

    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Exam Complete!</h1>
            <div className="relative inline-flex items-center justify-center">
              <CircularProgress percentage={results.percentage} size={160} />
              <div className="absolute text-center">
                <p className="text-4xl font-bold text-gray-800">{results.percentage}%</p>
                <p
                  className={`text-2xl font-bold ${gradeColor[results.grade] ?? "text-gray-700"}`}
                >
                  {results.grade}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-800">
                  {results.totalScore}/{results.totalMarks}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Marks</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p
                  className={`text-2xl font-bold ${gradeColor[results.grade] ?? "text-gray-700"}`}
                >
                  {results.grade}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Grade</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-800">{timeTakenLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Time Taken / {timeLimitLabel}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p
                  className={`text-sm font-bold ${results.percentage >= 50 ? "text-green-600" : "text-red-500"}`}
                >
                  {results.percentage >= 75
                    ? "Excellent"
                    : results.percentage >= 55
                      ? "Above Average"
                      : results.percentage >= 35
                        ? "Below Average"
                        : "Needs Work"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Performance</p>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          {results.sectionBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <h2 className="font-bold text-lg">Section Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="pb-3 pr-4">Section</th>
                      <th className="pb-3 pr-4 text-center">Questions</th>
                      <th className="pb-3 pr-4 text-center">Correct</th>
                      <th className="pb-3 pr-4 text-center">Incorrect</th>
                      <th className="pb-3 pr-4 text-center">Marks</th>
                      <th className="pb-3 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.sectionBreakdown.map((s) => (
                      <tr key={s.section}>
                        <td className="py-3 pr-4 font-medium">
                          {s.section}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({s.type})
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center">{s.questions}</td>
                        <td className="py-3 pr-4 text-center text-green-600 font-medium">
                          {s.correct}
                        </td>
                        <td className="py-3 pr-4 text-center text-red-500 font-medium">
                          {s.incorrect}
                        </td>
                        <td className="py-3 pr-4 text-center font-semibold">
                          {s.marksObtained}/{s.totalMarks}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`font-bold ${
                              s.percentage >= 65
                                ? "text-green-600"
                                : s.percentage >= 35
                                  ? "text-yellow-600"
                                  : "text-red-500"
                            }`}
                          >
                            {s.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mini bar chart */}
              <div className="space-y-2 pt-2">
                {results.sectionBreakdown.map((s) => (
                  <div key={s.section} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-muted-foreground shrink-0">{s.type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          s.percentage >= 65
                            ? "bg-green-500"
                            : s.percentage >= 35
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-medium shrink-0">
                      {s.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 h-12"
              onClick={() => {
                setReviewIndex(0);
                setReviewFilter("all");
                setScreen("review");
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Detailed Answers
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setMarkingSchemeVisible(true)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Show Marking Scheme
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => router.push("/protected/student/papers")}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Marking Scheme Modal */}
        {markingSchemeVisible && results && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">Marking Scheme</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMarkingSchemeVisible(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="overflow-y-auto p-6 space-y-6">
                {results.questionResults.map((qr) => {
                  const qLabel = qr.mainQuestionNumber != null
                    ? `Q${qr.mainQuestionNumber}${qr.subLabel ? `(${qr.subLabel})` : ""}${qr.subSubLabel ? `(${qr.subSubLabel})` : ""}`
                    : `Q${qr.questionNumber}`;
                  return (
                    <div key={qr.questionId} className="border rounded-xl p-4 space-y-2">
                      <p className="font-semibold text-sm text-muted-foreground">
                        {qLabel} – {qr.marksAvailable} mark{qr.marksAvailable !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium">{qr.questionText}</p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">Model Answer</p>
                        <p className="text-sm text-green-800">{qr.correctAnswer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Answer Review ──────────────────────────────────────────────────────────
  if (screen === "review" && results) {
    const filtered = getFilteredResults();
    const currentReview = filtered[reviewIndex];

    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScreen("results")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Results
            </Button>
            <h1 className="font-bold text-xl">Answer Review</h1>
            <div />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "correct", "incorrect", "partial", "flagged"] as ReviewFilter[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => { setReviewFilter(f); setReviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    reviewFilter === f
                      ? "bg-purple-600 text-white"
                      : "bg-white border hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {f === "all"
                    ? `All (${results.questionResults.length})`
                    : f === "correct"
                      ? `Correct (${results.questionResults.filter((r) => r.isCorrect).length})`
                      : f === "incorrect"
                        ? `Incorrect (${results.questionResults.filter((r) => !r.isCorrect && !r.isPartial).length})`
                        : f === "partial"
                          ? `Partial (${results.questionResults.filter((r) => r.isPartial).length})`
                          : `Flagged (${questions.filter((q) => q.isFlagged).length})`}
                </button>
              )
            )}
            {/* Jump to question */}
            <select
              className="px-3 py-1.5 rounded-lg text-sm border bg-white text-gray-600 ml-auto"
              value={reviewIndex}
              onChange={(e) => setReviewIndex(Number(e.target.value))}
            >
              {filtered.map((r, i) => {
                const label = r.mainQuestionNumber != null
                  ? `Q${r.mainQuestionNumber}${r.subLabel ? `(${r.subLabel})` : ""}${r.subSubLabel ? `(${r.subSubLabel})` : ""}`
                  : `Q${r.questionNumber}`;
                return (
                  <option key={r.questionId} value={i}>
                    {label} – {r.questionType}
                  </option>
                );
              })}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No questions match this filter.
            </div>
          ) : currentReview ? (
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
              {/* Question header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge
                  className={`text-sm px-3 py-1 ${
                    currentReview.isCorrect
                      ? "bg-green-100 text-green-700"
                      : currentReview.isPartial
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentReview.isCorrect
                    ? "✓ Correct"
                    : currentReview.isPartial
                      ? "~ Partial"
                      : "✗ Incorrect"}
                  {" · "}
                  {currentReview.marksAwarded}/{currentReview.marksAvailable} marks
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {reviewIndex + 1} of {filtered.length}
                </span>
              </div>

              {/* Description (if any) */}
              {currentReview.description && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Context</p>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{currentReview.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Question {
                    currentReview.mainQuestionNumber != null
                      ? `${currentReview.mainQuestionNumber}${currentReview.subLabel ? `(${currentReview.subLabel})` : ""}${currentReview.subSubLabel ? `(${currentReview.subSubLabel})` : ""}`
                      : currentReview.questionNumber
                  }
                  {" "}({currentReview.marksAvailable} mark{currentReview.marksAvailable !== 1 ? "s" : ""})
                </p>
                <p className="text-base font-medium leading-relaxed">
                  {currentReview.questionText}
                </p>
              </div>

              {/* MCQ options */}
              {currentReview.questionType === "MCQ" && currentReview.options.length > 0 && (
                <div className="space-y-2">
                  {currentReview.options.map((opt) => {
                    const isStudent = currentReview.studentAnswer === opt;
                    const isCorrect =
                      currentReview.correctAnswer === opt ||
                      currentReview.correctAnswer.includes(opt);
                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                          isStudent && isCorrect
                            ? "bg-green-50 border-green-400"
                            : isStudent && !isCorrect
                              ? "bg-red-50 border-red-400"
                              : isCorrect
                                ? "bg-green-50 border-green-300"
                                : "border-gray-200"
                        }`}
                      >
                        {isStudent && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        )}
                        {isStudent && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        {!isStudent && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        {!isStudent && !isCorrect && (
                          <span className="w-4 h-4 shrink-0" />
                        )}
                        <span>{opt}</span>
                        {isStudent && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Your answer
                          </span>
                        )}
                        {!isStudent && isCorrect && (
                          <span className="ml-auto text-xs text-green-600 font-medium">
                            Correct answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False review */}
              {currentReview.questionType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  {["True", "False"].map((opt) => {
                    const isStudent = currentReview.studentAnswer === opt;
                    const isCorrect = currentReview.correctAnswer === opt;
                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                          isStudent && isCorrect
                            ? "bg-green-50 border-green-400"
                            : isStudent && !isCorrect
                              ? "bg-red-50 border-red-400"
                              : isCorrect
                                ? "bg-green-50 border-green-300"
                                : "border-gray-200"
                        }`}
                      >
                        {isStudent && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                        {isStudent && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                        {!isStudent && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                        {!isStudent && !isCorrect && <span className="w-4 h-4 shrink-0" />}
                        <span className="font-medium">{opt}</span>
                        {isStudent && <span className="ml-auto text-xs text-muted-foreground">Your answer</span>}
                        {!isStudent && isCorrect && <span className="ml-auto text-xs text-green-600 font-medium">Correct answer</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fill in the Blank review */}
              {currentReview.questionType === "FILL_BLANK" && (
                <div className="space-y-3">
                  {currentReview.correctAnswer.split("|").map((correct, bi) => {
                    const studentVal = currentReview.studentAnswer ? currentReview.studentAnswer.split("|")[bi] || "" : "";
                    const isBlankCorrect = studentVal.trim().toLowerCase() === correct.trim().toLowerCase();
                    return (
                      <div key={bi} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${isBlankCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
                        {isBlankCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                        <span className="text-muted-foreground min-w-16">Blank {bi + 1}:</span>
                        <span className={`font-medium ${isBlankCorrect ? "text-green-700" : "text-red-600"}`}>{studentVal || <em className="text-muted-foreground not-italic">empty</em>}</span>
                        {!isBlankCorrect && <span className="ml-auto text-xs text-green-700">Correct: <strong>{correct}</strong></span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Structured side-by-side */}
              {currentReview.questionType === "SHORT" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Your Answer
                    </p>
                    <div
                      className={`p-4 rounded-xl border-2 min-h-[100px] text-sm whitespace-pre-wrap ${
                        currentReview.isCorrect
                          ? "border-green-400 bg-green-50"
                          : currentReview.isPartial
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-red-400 bg-red-50"
                      }`}
                    >
                      {currentReview.studentAnswer || (
                        <span className="text-muted-foreground italic">
                          No answer provided
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Model Answer
                    </p>
                    <div className="p-4 rounded-xl border-2 border-green-400 bg-green-50 min-h-[100px] text-sm whitespace-pre-wrap">
                      {currentReview.correctAnswer}
                    </div>
                  </div>
                </div>
              )}

              {/* Marks breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold">Marks Breakdown</p>
                <div className="flex items-center gap-2 text-sm">
                  {currentReview.isCorrect ? (
                    <span className="text-green-600">
                      ✓ Full marks awarded ({currentReview.marksAwarded}/
                      {currentReview.marksAvailable})
                    </span>
                  ) : currentReview.isPartial ? (
                    <span className="text-yellow-600">
                      ~ Partial credit ({currentReview.marksAwarded}/
                      {currentReview.marksAvailable})
                    </span>
                  ) : (
                    <span className="text-red-500">
                      ✗ No marks awarded (0/{currentReview.marksAvailable})
                    </span>
                  )}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    AI Feedback
                  </p>
                  <Badge
                    className={`text-xs ${
                      currentReview.aiConfidence >= 80
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {currentReview.aiConfidence >= 80
                      ? `AI Confidence: ${currentReview.aiConfidence}%`
                      : `⚠ AI Confidence: ${currentReview.aiConfidence}% – Pending Teacher Review`}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentReview.aiFeedback}
                </p>
                {currentReview.requiresManualReview && (
                  <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    ⚠ This answer has been flagged for teacher review. Final marks may change.
                  </p>
                )}
              </div>

              {/* Request Manual Review */}
              {!reviewRequestSent.has(currentReview.questionId) ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => handleRequestReview(currentReview.questionId)}
                >
                  <Flag className="h-3.5 w-3.5 mr-1.5" />
                  Request Manual Review
                </Button>
              ) : (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Manual review requested. A teacher will review within 24 hours.
                </p>
              )}
            </div>
          ) : null}

          {/* Navigation */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                disabled={reviewIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {reviewIndex + 1} / {filtered.length}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setReviewIndex((i) => Math.min(filtered.length - 1, i + 1))
                }
                disabled={reviewIndex === filtered.length - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Request modal */}
        {reviewRequestModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold">Request Submitted</h2>
              <p className="text-muted-foreground text-sm">
                Your request has been submitted. A teacher will review this
                question within 24 hours.
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => setReviewRequestModal(null)}
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Exam Interface ─────────────────────────────────────────────────────────
  if (screen !== "exam" && screen !== "submit_confirm") return null;
  if (!paper || !question) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-sm px-4 py-2 flex items-center gap-2 justify-center z-10">
          <WifiOff className="h-4 w-4" />
          ⚠ Connection lost. Your answers are saved locally and will sync when
          connection is restored. You can continue answering questions.
        </div>
      )}
      {autoSaveStatus === "failed" && isOnline && (
        <div className="bg-red-600 text-white text-sm px-4 py-2 flex items-center gap-2 justify-center z-10">
          <AlertTriangle className="h-4 w-4" />
          🚨 Unable to save your answers. Please check your internet connection.{" "}
          <strong>DO NOT close this tab.</strong>
          <button
            onClick={handleManualSave}
            className="ml-3 px-3 py-0.5 bg-white text-red-600 rounded font-semibold text-xs hover:bg-red-50"
          >
            Manual Save
          </button>
        </div>
      )}

      {/* ── Sticky Exam Header ── */}
      <header className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-4 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{paper.title}</p>
          <p className="text-xs text-muted-foreground">{paper.subject}</p>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-2xl ${getTimerBg(timeRemaining, totalTime)}`}
        >
          <span className={getTimerColor(timeRemaining, totalTime)}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        <div className="flex-1 flex justify-end gap-3 items-center min-w-0">
          {/* Auto-save indicator */}
          <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
            {autoSaveStatus === "saving" && (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
            )}
            {autoSaveStatus === "saved" && (
              <><CheckCircle2 className="h-3 w-3 text-green-500" /> Saved</>
            )}
            {autoSaveStatus === "failed" && (
              <><AlertTriangle className="h-3 w-3 text-red-500" /> Save failed</>
            )}
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-500 ml-1" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500 ml-1" />
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 shrink-0"
            onClick={() => setScreen("submit_confirm")}
          >
            End Exam
          </Button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="bg-white border-b px-4 py-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                question.type === "SHORT"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {question.type === "SHORT"
                ? "Part 2 · Structured"
                : question.type === "TRUE_FALSE"
                  ? "Part 1 · True / False"
                  : question.type === "FILL_BLANK"
                    ? "Part 1 · Fill in Blank"
                    : "Part 1 · MCQ"}
            </span>
            Q {currentIndex + 1} of {questions.length}
          </span>
          <span>
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <Progress
          value={Math.round((answeredCount / questions.length) * 100)}
          className="h-2"
        />
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT PANEL - Question */}
        <div className="flex-[3] overflow-y-auto p-6 border-r bg-white">
          <div className="max-w-2xl space-y-5">
            {/* Question label + marks badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                Question {buildQuestionLabel(question)}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {question.points} mark{question.points !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  question.type === "MCQ"
                    ? "text-blue-600 border-blue-200"
                    : question.type === "TRUE_FALSE"
                      ? "text-amber-600 border-amber-200"
                      : question.type === "FILL_BLANK"
                        ? "text-teal-600 border-teal-200"
                        : "text-orange-600 border-orange-200"
                }`}
              >
                {question.type === "MCQ"
                  ? "Multiple Choice"
                  : question.type === "TRUE_FALSE"
                    ? "True / False"
                    : question.type === "FILL_BLANK"
                      ? "Fill in the Blank"
                      : "Structured"}
              </Badge>
              {/* Total marks for the main question group (structured only) */}
              {question.type === "SHORT" && question.questionNumber != null && (() => {
                const groupTotal = questions
                  .filter((q) => q.questionNumber === question.questionNumber && q.type === "SHORT")
                  .reduce((s, q) => s + q.points, 0);
                return groupTotal > question.points ? (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Q{question.questionNumber} total: <span className="font-semibold text-foreground">{groupTotal} marks</span>
                  </span>
                ) : null;
              })()}
            </div>

            {/* Selection group banner */}
            {(() => {
              const rule = getSelectionRule(question, paper.selectionRules);
              if (!rule) return null;
              const answeredInGroup = questions.filter(
                (q) => q.questionNumber != null && rule.questionNumbers.includes(q.questionNumber) && q.isAnswered
              );
              const uniqueAnsweredMains = [...new Set(answeredInGroup.map((q) => q.questionNumber))];
              const count = uniqueAnsweredMains.length;
              const done = count >= rule.required;
              return (
                <div className={`rounded-xl px-4 py-3 border ${done ? "bg-emerald-50 border-emerald-300" : "bg-orange-50 border-orange-300"}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${done ? "text-emerald-700" : "text-orange-700"}`}>
                        Optional Question Group
                      </p>
                      <p className={`text-sm font-medium ${done ? "text-emerald-800" : "text-orange-800"}`}>
                        {rule.label
                          ? rule.label
                          : `Answer any ${rule.required} of these ${rule.questionNumbers.length} questions`}
                      </p>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${done ? "bg-emerald-200 text-emerald-800" : "bg-orange-200 text-orange-800"}`}>
                      {count}/{rule.required} answered
                    </span>
                  </div>
                  {count > rule.required && (
                    <p className="text-xs text-orange-600 mt-1.5">
                      You&apos;ve answered {count} of {rule.required} required — your {rule.required} best-scoring will be counted.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Description */}
            {question.description && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Context</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{question.description}</p>
              </div>
            )}

            <p className="text-base leading-relaxed font-medium text-gray-800 whitespace-pre-wrap">
              {question.text}
            </p>

            {/* Question image */}
            {question.imageUrl && (
              <div className="rounded-xl border overflow-hidden bg-gray-50">
                <img
                  src={question.imageUrl}
                  alt="Question image"
                  className="max-w-full max-h-64 object-contain mx-auto block"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Answer + Nav */}
        <div className="flex-[2] overflow-y-auto flex flex-col bg-gray-50">
          <div className="flex-1 p-5 space-y-5">
            {/* Answer input */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Your Answer</p>

              {question.type === "MCQ" ? (
                <RadioGroup
                  value={question.studentAnswer}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {question.options.map((opt, oi) => {
                    const label = ["A", "B", "C", "D", "E"][oi] ?? String(oi + 1);
                    const selected = question.studentAnswer === opt;
                    const optId = `opt-${question.id}-${oi}`;
                    return (
                      <div
                        key={`mcq-opt-${oi}`}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                        onClick={() => handleAnswer(opt)}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                            selected
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {label}
                        </div>
                        <RadioGroupItem value={opt} id={optId} className="hidden" />
                        <Label htmlFor={optId} className="cursor-pointer flex-1 text-sm leading-relaxed">
                          {opt}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : question.type === "TRUE_FALSE" ? (
                <div className="space-y-3">
                  {["True", "False"].map((option) => {
                    const selected = question.studentAnswer === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswer(option)}
                        className={`w-full p-4 rounded-xl border-2 text-left font-semibold text-lg transition-all flex items-center gap-3 ${
                          selected
                            ? option === "True"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-gray-700"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          selected
                            ? option === "True" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {option === "True" ? "T" : "F"}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : question.type === "FILL_BLANK" ? (
                (() => {
                  const parts = question.text.split("___");
                  const filledValues = question.studentAnswer ? question.studentAnswer.split("|") : [];
                  return (
                    <div className="space-y-4">
                      <div className="leading-relaxed text-base flex flex-wrap items-center gap-1">
                        {parts.map((part, pi) => (
                          <React.Fragment key={pi}>
                            <span className="text-gray-800">{part}</span>
                            {pi < parts.length - 1 && (
                              <input
                                type="text"
                                value={filledValues[pi] || ""}
                                onChange={(e) => {
                                  const newValues = [...Array(parts.length - 1)].map((_, bi) =>
                                    bi === pi ? e.target.value : (filledValues[bi] || "")
                                  );
                                  handleAnswer(newValues.join("|"));
                                }}
                                className="border-b-2 border-purple-400 bg-transparent text-center text-sm font-medium focus:outline-none focus:border-purple-600 px-2 min-w-[80px] max-w-[150px]"
                                placeholder={`blank ${pi + 1}`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {parts.length - 1} blank{parts.length - 1 !== 1 ? "s" : ""} to fill in
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your answer here. Press Enter to start a new paragraph..."
                    value={question.studentAnswer}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="min-h-[220px] text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-blue-600 font-medium">
                      {question.points} mark{question.points !== 1 ? "s" : ""} — write clearly and in full sentences
                    </span>
                    <span>
                      {question.studentAnswer.trim() === ""
                        ? "0 words"
                        : `${question.studentAnswer.trim().split(/\s+/).length} words`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 gap-1.5 ${question.isFlagged ? "border-yellow-400 bg-yellow-50 text-yellow-700" : ""}`}
                onClick={handleFlag}
              >
                <Flag className="h-3.5 w-3.5" />
                {question.isFlagged ? "Flagged" : "Flag"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => question.isAnswered && setClearConfirmVisible(true)}
                disabled={!question.isAnswered}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700 gap-1.5"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-muted-foreground"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous Question
              </Button>
            )}
          </div>

          {/* Question Navigation Grid */}
          <div className="p-5 border-t bg-white shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Questions
            </p>
            {/* Part 1: MCQ / True/False / Fill in Blank */}
            {paper.mcqCount > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-blue-600 mb-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Part 1 — Questions ({paper.mcqCount})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {questions
                    .filter((q) => q.type === "MCQ" || q.type === "TRUE_FALSE" || q.type === "FILL_BLANK")
                    .map((q) => {
                      const i = questions.indexOf(q);
                      const isCurrent = i === currentIndex;
                      const isAns = q.isAnswered;
                      const isFlag = q.isFlagged;
                      const label = buildShortLabel(q);
                      const typeTag = q.type === "TRUE_FALSE" ? " T/F" : q.type === "FILL_BLANK" ? " FB" : "";
                      return (
                        <button
                          key={q.id}
                          onClick={() => navigateTo(i)}
                          title={`${q.type === "TRUE_FALSE" ? "True/False" : q.type === "FILL_BLANK" ? "Fill Blank" : "MCQ"} ${q.number} — ${q.points} mark${q.points !== 1 ? "s" : ""}`}
                          className={`min-w-[2rem] h-8 px-1.5 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-2 ring-blue-300"
                              : isFlag
                                ? "bg-yellow-400 text-white"
                                : isAns
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {label}{typeTag}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
            {/* Part 2: Structured */}
            {paper.essayCount > 0 && (
              <div className="mb-1">
                <p className="text-xs font-semibold text-purple-600 mb-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Part 2 — Structured ({paper.essayCount})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {questions.filter((q) => q.type === "SHORT").map((q) => {
                    const i = questions.indexOf(q);
                    const isCurrent = i === currentIndex;
                    const isAns = q.isAnswered;
                    const isFlag = q.isFlagged;
                    const label = buildShortLabel(q);
                    const isOptional = !!getSelectionRule(q, paper.selectionRules);
                    return (
                      <div key={q.id} className="relative">
                        <button
                          onClick={() => navigateTo(i)}
                          title={`Question ${buildQuestionLabel(q)} — ${q.points} mark${q.points !== 1 ? "s" : ""}${isOptional ? " (optional group)" : ""}`}
                          className={`min-w-[2rem] h-8 px-1.5 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-2 ring-blue-300"
                              : isFlag
                                ? "bg-yellow-400 text-white"
                                : isAns
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                        {isOptional && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-white" title="Optional group" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-400 rounded" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-600 rounded" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-200 rounded" /> Unanswered
              </span>
              {paper.selectionRules && paper.selectionRules.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Optional group
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Clear Confirm Dialog ── */}
      {clearConfirmVisible && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-lg">Clear Answer?</h3>
            <p className="text-muted-foreground text-sm">
              This will remove your answer for Question {question.number}. Are
              you sure?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setClearConfirmVisible(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleClearAnswer}
              >
                Clear Answer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Session Expiry Modal ── */}
      {sessionExpireVisible && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <h3 className="font-bold text-lg">Session About to Expire</h3>
            <p className="text-muted-foreground text-sm">
              Your session is about to expire due to inactivity. Do you want to
              continue?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  setSessionExpireVisible(false);
                  await handleManualSave();
                  router.push("/protected/student/papers");
                }}
              >
                Save & Exit
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setLastActivityTime(Date.now());
                  setSessionExpireVisible(false);
                }}
              >
                Continue Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirm Modal ── */}
      {screen === "submit_confirm" && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Ready to Submit?</h2>
              <p className="text-muted-foreground text-sm">
                Please review your progress before submitting.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-gray-700">Answered</span>
                <span className="font-bold text-green-700">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-yellow-50 rounded-xl">
                <span className="text-sm text-gray-700">Flagged for review</span>
                <span className="font-bold text-yellow-700">{flaggedCount}</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-gray-700">Unanswered</span>
                <span className="font-bold text-red-600">{unansweredCount}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-gray-700">Time remaining</span>
                <span className="font-bold text-blue-700">
                  {formatMinSec(timeRemaining)}
                </span>
              </div>

              {/* Optional group status */}
              {paper?.selectionRules && paper.selectionRules.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optional Groups</p>
                  {paper.selectionRules.map((rule) => {
                    const answeredMains = [...new Set(
                      questions
                        .filter((q) => q.questionNumber != null && rule.questionNumbers.includes(q.questionNumber) && q.isAnswered)
                        .map((q) => q.questionNumber)
                    )];
                    const count = answeredMains.length;
                    const ok = count >= rule.required;
                    return (
                      <div key={rule.id} className={`flex justify-between p-3 rounded-xl ${ok ? "bg-emerald-50" : "bg-orange-50"}`}>
                        <span className="text-sm text-gray-700">
                          {rule.label || `Answer ${rule.required} of Q${rule.questionNumbers.join(", Q")}`}
                        </span>
                        <span className={`font-bold text-sm ${ok ? "text-emerald-700" : "text-orange-600"}`}>
                          {count}/{rule.required} {ok ? "✓" : "⚠"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-xs text-orange-700 font-medium">
                ⚠ Once you submit, you cannot make any changes to your answers.
              </p>
            </div>

            {/* Type SUBMIT to confirm */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Type <strong>SUBMIT</strong> to confirm
              </Label>
              <input
                type="text"
                value={submitConfirmText}
                onChange={(e) => setSubmitConfirmText(e.target.value)}
                placeholder="Type SUBMIT here..."
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col gap-3">
              {flaggedCount > 0 && (
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    const firstFlagged = questions.findIndex((q) => q.isFlagged);
                    if (firstFlagged >= 0) setCurrentIndex(firstFlagged);
                    setScreen("exam");
                  }}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Review Flagged Questions ({flaggedCount})
                </Button>
              )}
              <Button
                variant="outline"
                className="h-11"
                onClick={() => {
                  setScreen("exam");
                  setSubmitConfirmText("");
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Continue Exam
              </Button>
              <Button
                className="h-11 bg-red-600 hover:bg-red-700"
                disabled={submitConfirmText !== "SUBMIT"}
                onClick={doSubmit}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
