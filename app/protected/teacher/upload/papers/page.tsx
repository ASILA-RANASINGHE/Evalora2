"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload, Eye, GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Shuffle } from "lucide-react";
import Link from "next/link";
import { getTeacherSubjects } from "@/lib/actions/teacher";
import { createPaper, type SelectionRule } from "@/lib/actions/paper";
import type { PaperTerm } from "@/lib/generated/prisma/enums";

const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const terms = ["Term 1", "Term 2", "Term 3", "Mid-Year", "End-of-Year"];
const EXTRA_SUBJECTS = ["Geography", "Health"];

const termMap: Record<string, PaperTerm> = {
  "Term 1": "TERM_1",
  "Term 2": "TERM_2",
  "Term 3": "TERM_3",
  "Mid-Year": "MID_YEAR",
  "End-of-Year": "END_OF_YEAR",
};

// Roman numerals for sub-sub labels
const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const subLabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

interface McqQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface StructuredSubSub {
  text: string;
  answer: string;
  marks: number;
}

interface StructuredSub {
  text: string;
  answer: string;
  marks: number;
  subSubs: StructuredSubSub[];
}

interface StructuredMain {
  number: number;
  description: string;
  subs: StructuredSub[];
}

interface FormErrors {
  title?: string;
  subject?: string;
  term?: string;
  grade?: string;
  duration?: string;
  mcqCount?: string;
}

function newSub(): StructuredSub {
  return { text: "", answer: "", marks: 2, subSubs: [] };
}

function newSubSub(): StructuredSubSub {
  return { text: "", answer: "", marks: 1 };
}

function mainQuestionTotalMarks(main: StructuredMain): number {
  return main.subs.reduce((total, sub) => {
    if (sub.subSubs.length === 0) return total + sub.marks;
    return total + sub.subSubs.reduce((t, ss) => t + ss.marks, 0);
  }, 0);
}

export default function UploadPapersPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("");
  const [mcqCount, setMcqCount] = useState("");
  const [mcqMarks, setMcqMarks] = useState("");
  const [essayCount, setEssayCount] = useState("");
  const [isModel, setIsModel] = useState(false);
  const [passPercentage, setPassPercentage] = useState("35");
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState<"STUDENTS_ONLY" | "PUBLIC">("STUDENTS_ONLY");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([]);
  const [structuredMains, setStructuredMains] = useState<StructuredMain[]>([]);
  const [selectionRules, setSelectionRules] = useState<SelectionRule[]>([]);

  useEffect(() => {
    getTeacherSubjects().then(setAllowedSubjects);
  }, []);

  const subjectOptions = [...new Set([...allowedSubjects, ...EXTRA_SUBJECTS])];

  // Sync MCQ question array with count
  const mcqCountNum = parseInt(mcqCount) || 0;
  useEffect(() => {
    setMcqQuestions((prev) => {
      if (mcqCountNum === 0) return [];
      if (mcqCountNum > prev.length)
        return [...prev, ...Array.from({ length: mcqCountNum - prev.length }, () => ({ text: "", options: ["", "", "", ""], correctAnswer: "" }))];
      return prev.slice(0, mcqCountNum);
    });
  }, [mcqCountNum]);

  // Sync structured main question array with count
  const essayCountNum = parseInt(essayCount) || 0;
  useEffect(() => {
    setStructuredMains((prev) => {
      if (essayCountNum === 0) return [];
      if (essayCountNum > prev.length) {
        const toAdd = essayCountNum - prev.length;
        const nextNum = prev.length + 1;
        return [
          ...prev,
          ...Array.from({ length: toAdd }, (_, i) => ({
            number: nextNum + i,
            description: "",
            subs: [newSub()],
          })),
        ];
      }
      return prev.slice(0, essayCountNum).map((m, i) => ({ ...m, number: i + 1 }));
    });
  }, [essayCountNum]);

  const structuredTotalMarks = useMemo(
    () => structuredMains.reduce((t, m) => t + mainQuestionTotalMarks(m), 0),
    [structuredMains]
  );

  const totalMarks = useMemo(
    () => mcqCountNum * (parseInt(mcqMarks) || 0) + structuredTotalMarks,
    [mcqCountNum, mcqMarks, structuredTotalMarks]
  );

  const totalQuestions = mcqCountNum + essayCountNum;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!subject) newErrors.subject = "Please select a subject";
    if (!term) newErrors.term = "Please select a term";
    if (!grade) newErrors.grade = "Please select a grade";
    if (!duration || parseInt(duration) <= 0) newErrors.duration = "Enter a valid duration";
    if (!mcqCount && !essayCount) newErrors.mcqCount = "Add at least one question type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Build flat question array
      const mcqFlat = mcqQuestions.map((q, i) => ({
        text: q.text,
        type: "MCQ" as const,
        points: parseInt(mcqMarks) || 1,
        options: q.options,
        correctAnswer: q.correctAnswer,
        order: i,
      }));

      let orderOffset = mcqCountNum;
      const structuredFlat: Parameters<typeof createPaper>[0]["questions"] = [];
      for (const main of structuredMains) {
        const isFirstOfMain = true;
        let firstInGroup = true;
        for (let si = 0; si < main.subs.length; si++) {
          const sub = main.subs[si];
          const subLabelStr = main.subs.length === 1 ? undefined : subLabels[si];
          if (sub.subSubs.length === 0) {
            structuredFlat.push({
              text: sub.text,
              type: "SHORT" as const,
              points: sub.marks,
              options: [],
              correctAnswer: sub.answer,
              order: orderOffset++,
              questionNumber: main.number,
              subLabel: subLabelStr,
              subSubLabel: undefined,
              description: firstInGroup && main.description ? main.description : undefined,
            });
            firstInGroup = false;
          } else {
            for (let ssi = 0; ssi < sub.subSubs.length; ssi++) {
              const ss = sub.subSubs[ssi];
              structuredFlat.push({
                text: ss.text,
                type: "SHORT" as const,
                points: ss.marks,
                options: [],
                correctAnswer: ss.answer,
                order: orderOffset++,
                questionNumber: main.number,
                subLabel: subLabelStr,
                subSubLabel: romanNumerals[ssi],
                description: firstInGroup && ssi === 0 && main.description ? main.description : undefined,
              });
              firstInGroup = false;
            }
          }
        }
        void isFirstOfMain;
      }

      await createPaper({
        title,
        subject,
        term: termMap[term] || "TERM_1",
        grade,
        duration: parseInt(duration),
        isModel,
        mcqCount: mcqCountNum,
        mcqMarks: parseInt(mcqMarks) || 0,
        essayCount: essayCountNum,
        essayMarks: 0,
        totalMarks,
        passPercentage: parseInt(passPercentage) || 35,
        instructions: notes || undefined,
        visibility,
        selectionRules: selectionRules.length > 0 ? selectionRules : undefined,
        questions: [...mcqFlat, ...structuredFlat].length > 0 ? [...mcqFlat, ...structuredFlat] : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to create paper:", err);
      alert("Failed to create paper. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Structured question helpers ──────────────────────────────────────────────

  function updateMain(idx: number, patch: Partial<StructuredMain>) {
    setStructuredMains((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  function updateSub(mainIdx: number, subIdx: number, patch: Partial<StructuredSub>) {
    setStructuredMains((prev) =>
      prev.map((m, i) => {
        if (i !== mainIdx) return m;
        return { ...m, subs: m.subs.map((s, si) => (si === subIdx ? { ...s, ...patch } : s)) };
      })
    );
  }

  function addSub(mainIdx: number) {
    setStructuredMains((prev) =>
      prev.map((m, i) => (i === mainIdx ? { ...m, subs: [...m.subs, newSub()] } : m))
    );
  }

  function removeSub(mainIdx: number, subIdx: number) {
    setStructuredMains((prev) =>
      prev.map((m, i) => {
        if (i !== mainIdx) return m;
        const subs = m.subs.filter((_, si) => si !== subIdx);
        return { ...m, subs: subs.length === 0 ? [newSub()] : subs };
      })
    );
  }

  function addSubSub(mainIdx: number, subIdx: number) {
    setStructuredMains((prev) =>
      prev.map((m, i) => {
        if (i !== mainIdx) return m;
        return {
          ...m,
          subs: m.subs.map((s, si) =>
            si === subIdx ? { ...s, subSubs: [...s.subSubs, newSubSub()] } : s
          ),
        };
      })
    );
  }

  function removeSubSub(mainIdx: number, subIdx: number, ssIdx: number) {
    setStructuredMains((prev) =>
      prev.map((m, i) => {
        if (i !== mainIdx) return m;
        return {
          ...m,
          subs: m.subs.map((s, si) =>
            si === subIdx ? { ...s, subSubs: s.subSubs.filter((_, k) => k !== ssIdx) } : s
          ),
        };
      })
    );
  }

  function updateSubSub(mainIdx: number, subIdx: number, ssIdx: number, patch: Partial<StructuredSubSub>) {
    setStructuredMains((prev) =>
      prev.map((m, i) => {
        if (i !== mainIdx) return m;
        return {
          ...m,
          subs: m.subs.map((s, si) =>
            si === subIdx
              ? { ...s, subSubs: s.subSubs.map((ss, k) => (k === ssIdx ? { ...ss, ...patch } : ss)) }
              : s
          ),
        };
      })
    );
  }

  // ── Success screen ───────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold font-space-grotesk">Paper Created!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          &quot;{title}&quot; — {totalQuestions} question groups, {totalMarks} total marks
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setTitle(""); setSubject(""); setTerm(""); setGrade(""); setDuration("");
              setMcqCount(""); setMcqMarks(""); setEssayCount("");
              setIsModel(false); setPassPercentage("35"); setNotes("");
              setMcqQuestions([]); setStructuredMains([]); setSelectionRules([]);
            }}
          >
            Create Another
          </Button>
          <Link href="/protected/teacher/upload">
            <Button>Back to Upload Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/protected/teacher/upload" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">Upload Papers</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Create structured exam papers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Paper Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Paper Title</Label>
              <Input
                id="title"
                placeholder="e.g. Mathematics Mid-Year Examination 2025"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Subject</Label>
                <select
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.subject ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select</option>
                  {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <select
                  value={term}
                  onChange={(e) => { setTerm(e.target.value); if (errors.term) setErrors((p) => ({ ...p, term: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.term ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select</option>
                  {terms.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.term && <p className="text-xs text-red-500">{errors.term}</p>}
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => { setGrade(e.target.value); if (errors.grade) setErrors((p) => ({ ...p, grade: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.grade ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select</option>
                  {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="e.g. 120"
                value={duration}
                onChange={(e) => { setDuration(e.target.value); if (errors.duration) setErrors((p) => ({ ...p, duration: undefined })); }}
                className={`max-w-48 ${errors.duration ? "border-red-500" : ""}`}
              />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Paper Structure */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Paper Structure</CardTitle>
            <CardDescription>Define the question types and marks distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* MCQ Section */}
              <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Multiple Choice Questions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Number of MCQs</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={mcqCount}
                      onChange={(e) => { setMcqCount(e.target.value); if (errors.mcqCount) setErrors((p) => ({ ...p, mcqCount: undefined })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Marks per MCQ</Label>
                    <Input type="number" min="0" placeholder="0" value={mcqMarks} onChange={(e) => setMcqMarks(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Subtotal: {mcqCountNum * (parseInt(mcqMarks) || 0)} marks</p>
              </div>

              {/* Structured Section */}
              <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Structured Questions
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Number of Main Questions</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={essayCount}
                    onChange={(e) => { setEssayCount(e.target.value); if (errors.mcqCount) setErrors((p) => ({ ...p, mcqCount: undefined })); }}
                    className="max-w-32"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Subtotal: {structuredTotalMarks} marks — marks set per sub-question below
                </p>
              </div>
            </div>
            {errors.mcqCount && <p className="text-xs text-red-500">{errors.mcqCount}</p>}

            {/* Summary */}
            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
              <div>
                <p className="text-xs text-muted-foreground">Total Question Groups</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{totalQuestions}</p>
              </div>
              <div className="w-px bg-purple-200 dark:bg-purple-800" />
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{totalMarks}</p>
              </div>
              <div className="w-px bg-purple-200 dark:bg-purple-800" />
              <div>
                <p className="text-xs text-muted-foreground">Pass Mark ({passPercentage}%)</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {Math.ceil(totalMarks * (parseInt(passPercentage) || 0) / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Question Builder */}
        {mcqCountNum > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              MCQ Questions ({mcqCountNum})
            </h3>
            {mcqQuestions.map((q, i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-bold min-w-6">{i + 1}.</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Enter question text..."
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...mcqQuestions];
                          updated[i] = { ...updated[i], text: e.target.value };
                          setMcqQuestions(updated);
                        }}
                      />
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Options (click circle to mark correct answer)</Label>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-5">{String.fromCharCode(65 + optIdx)}.</span>
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...mcqQuestions];
                                const newOpts = [...updated[i].options];
                                newOpts[optIdx] = e.target.value;
                                updated[i] = { ...updated[i], options: newOpts };
                                setMcqQuestions(updated);
                              }}
                              className="h-8 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...mcqQuestions];
                                updated[i] = { ...updated[i], correctAnswer: opt };
                                setMcqQuestions(updated);
                              }}
                              className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${q.correctAnswer === opt && opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-input hover:border-emerald-400"}`}
                              title="Mark as correct"
                            >
                              {q.correctAnswer === opt && opt && <Check className="h-3 w-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Structured Question Builder */}
        {essayCountNum > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              Structured Questions ({essayCountNum} main question{essayCountNum !== 1 ? "s" : ""})
            </h3>

            {structuredMains.map((main, mainIdx) => {
              const totalMarksForMain = mainQuestionTotalMarks(main);
              return (
                <Card key={mainIdx} className="border-purple-200 dark:border-purple-800 shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300">
                          {main.number}
                        </div>
                        <span className="font-semibold text-sm">Question {main.number}</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md">
                        Total: {totalMarksForMain} mark{totalMarksForMain !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    {/* Optional description */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Question Description <span className="text-muted-foreground/60">(optional — shown to students at the top of this question)</span>
                      </Label>
                      <textarea
                        placeholder="e.g. Read the following passage and answer the questions below..."
                        value={main.description}
                        onChange={(e) => updateMain(mainIdx, { description: e.target.value })}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    {/* Sub-questions */}
                    <div className="space-y-3">
                      {main.subs.map((sub, subIdx) => {
                        const showSubLabel = main.subs.length > 1 || sub.subSubs.length > 0;
                        const subLabelStr = subLabels[subIdx];
                        return (
                          <div key={subIdx} className="border rounded-lg p-3 bg-muted/10 space-y-3">
                            {/* Sub-question header */}
                            <div className="flex items-center gap-2">
                              {showSubLabel && (
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">
                                  {subLabelStr})
                                </span>
                              )}
                              <div className="flex-1 grid grid-cols-[1fr_auto] gap-2">
                                <Input
                                  placeholder={`Sub-question ${showSubLabel ? subLabelStr + ") " : ""}text...`}
                                  value={sub.text}
                                  onChange={(e) => updateSub(mainIdx, subIdx, { text: e.target.value })}
                                  className="h-8 text-sm"
                                />
                                {sub.subSubs.length === 0 && (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={sub.marks}
                                      onChange={(e) => updateSub(mainIdx, subIdx, { marks: parseInt(e.target.value) || 0 })}
                                      className="h-8 text-sm w-16 text-center"
                                      title="Marks"
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">mk</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSub(mainIdx, subIdx)}
                                className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                title="Remove sub-question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Reference answer (only if no sub-subs) */}
                            {sub.subSubs.length === 0 && (
                              <textarea
                                placeholder="Reference answer / marking guide..."
                                value={sub.answer}
                                onChange={(e) => updateSub(mainIdx, subIdx, { answer: e.target.value })}
                                rows={2}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              />
                            )}

                            {/* Sub-sub questions */}
                            {sub.subSubs.length > 0 && (
                              <div className="space-y-2 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                                {sub.subSubs.map((ss, ssIdx) => (
                                  <div key={ssIdx} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-purple-500 min-w-[1.75rem]">
                                        {romanNumerals[ssIdx]})
                                      </span>
                                      <Input
                                        placeholder={`Sub-part ${romanNumerals[ssIdx]}) text...`}
                                        value={ss.text}
                                        onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { text: e.target.value })}
                                        className="h-8 text-sm flex-1"
                                      />
                                      <Input
                                        type="number"
                                        min="0"
                                        value={ss.marks}
                                        onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { marks: parseInt(e.target.value) || 0 })}
                                        className="h-8 text-sm w-16 text-center"
                                        title="Marks"
                                      />
                                      <span className="text-xs text-muted-foreground">mk</span>
                                      <button
                                        type="button"
                                        onClick={() => removeSubSub(mainIdx, subIdx, ssIdx)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <textarea
                                      placeholder="Reference answer..."
                                      value={ss.answer}
                                      onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { answer: e.target.value })}
                                      rows={2}
                                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-[1.75rem]"
                                    />
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 text-xs ml-[1.75rem]"
                                  onClick={() => addSubSub(mainIdx, subIdx)}
                                  disabled={sub.subSubs.length >= romanNumerals.length}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add sub-part ({romanNumerals[sub.subSubs.length]})
                                </Button>
                              </div>
                            )}

                            {/* Add sub-sub toggle */}
                            {sub.subSubs.length === 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-purple-600 h-7 text-xs"
                                onClick={() => addSubSub(mainIdx, subIdx)}
                              >
                                <ChevronRight className="h-3 w-3 mr-1" />
                                Add sub-parts (i, ii, iii...)
                              </Button>
                            )}
                          </div>
                        );
                      })}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 h-8"
                        onClick={() => addSub(mainIdx)}
                        disabled={main.subs.length >= subLabels.length}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add sub-question ({subLabels[main.subs.length]})
                      </Button>
                    </div>

                    {/* Total marks footer */}
                    <div className="flex justify-end">
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5 flex items-center gap-1.5">
                        <ChevronDown className="h-3 w-3" />
                        Question {main.number} total: <span className="font-bold text-foreground">{totalMarksForMain} mark{totalMarksForMain !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Optional Question Rules */}
        {essayCountNum > 1 && (
          <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-base">Optional Question Rules</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Define groups where students must answer only a set number of questions.
                e.g. &quot;Answer any 2 of questions 1, 2, 3&quot;
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectionRules.map((rule, rIdx) => (
                <div key={rule.id} className="border rounded-lg p-4 bg-orange-50/50 dark:bg-orange-900/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      Group {rIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectionRules((prev) => prev.filter((_, i) => i !== rIdx))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Required count */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Students must answer</span>
                    <Input
                      type="number"
                      min="1"
                      max={rule.questionNumbers.length || 1}
                      value={rule.required}
                      onChange={(e) =>
                        setSelectionRules((prev) =>
                          prev.map((r, i) =>
                            i === rIdx ? { ...r, required: Math.max(1, parseInt(e.target.value) || 1) } : r
                          )
                        )
                      }
                      className="w-16 h-8 text-sm text-center"
                    />
                    <span className="text-sm text-muted-foreground">
                      of the following {rule.questionNumbers.length} question{rule.questionNumbers.length !== 1 ? "s" : ""}:
                    </span>
                  </div>

                  {/* Optional label */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Label shown to students (optional)</Label>
                    <Input
                      placeholder={`e.g. Answer any ${rule.required} of the following questions`}
                      value={rule.label ?? ""}
                      onChange={(e) =>
                        setSelectionRules((prev) =>
                          prev.map((r, i) => (i === rIdx ? { ...r, label: e.target.value } : r))
                        )
                      }
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Question checkboxes */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Select which questions are in this group</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {structuredMains.map((main) => {
                        const checked = rule.questionNumbers.includes(main.number);
                        const inOtherGroup = selectionRules.some(
                          (r, i) => i !== rIdx && r.questionNumbers.includes(main.number)
                        );
                        return (
                          <button
                            key={main.number}
                            type="button"
                            disabled={inOtherGroup}
                            onClick={() =>
                              setSelectionRules((prev) =>
                                prev.map((r, i) => {
                                  if (i !== rIdx) return r;
                                  const nums = checked
                                    ? r.questionNumbers.filter((n) => n !== main.number)
                                    : [...r.questionNumbers, main.number].sort((a, b) => a - b);
                                  return { ...r, questionNumbers: nums };
                                })
                              )
                            }
                            className={`h-8 min-w-[2.5rem] px-2 rounded-lg text-xs font-bold border-2 transition-colors ${
                              checked
                                ? "bg-orange-500 border-orange-500 text-white"
                                : inOtherGroup
                                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-white border-gray-300 text-gray-600 hover:border-orange-400"
                            }`}
                          >
                            Q{main.number}
                          </button>
                        );
                      })}
                    </div>
                    {rule.questionNumbers.length < 2 && (
                      <p className="text-xs text-orange-600">Select at least 2 questions for a group to make sense.</p>
                    )}
                    {rule.required >= rule.questionNumbers.length && rule.questionNumbers.length > 0 && (
                      <p className="text-xs text-orange-600">
                        Required count should be less than the total in the group.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 h-8"
                onClick={() =>
                  setSelectionRules((prev) => [
                    ...prev,
                    { id: Date.now(), label: "", questionNumbers: [], required: 1 },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add optional group rule
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Additional Options */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={isModel}
                onClick={() => setIsModel(!isModel)}
                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isModel ? "bg-purple-600 border-purple-600 text-white" : "border-input"}`}
              >
                {isModel && <Check className="h-3 w-3" />}
              </button>
              <div>
                <Label className="cursor-pointer" onClick={() => setIsModel(!isModel)}>Model Paper</Label>
                <p className="text-xs text-muted-foreground">Mark this as a model/sample paper for reference</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pass">Pass Percentage (%)</Label>
                <Input
                  id="pass"
                  type="number"
                  min="1"
                  max="100"
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                  className="max-w-32"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Instructions (optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes for this paper..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility & Submit */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Visibility</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility("STUDENTS_ONLY")}
                  className={`flex-1 p-3 rounded-lg border-2 text-left transition-colors ${visibility === "STUDENTS_ONLY" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-border hover:border-purple-300"}`}
                >
                  <p className="text-sm font-semibold">Your Students Only</p>
                  <p className="text-xs text-muted-foreground">Only students assigned to you can see this</p>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("PUBLIC")}
                  className={`flex-1 p-3 rounded-lg border-2 text-left transition-colors ${visibility === "PUBLIC" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-border hover:border-purple-300"}`}
                >
                  <p className="text-sm font-semibold">All Evalora Students</p>
                  <p className="text-xs text-muted-foreground">Visible to every student on the platform</p>
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/protected/teacher/upload">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Paper"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
