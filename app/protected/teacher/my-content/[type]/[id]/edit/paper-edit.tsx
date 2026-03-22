"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Check, Eye, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { updatePaperMetadata, updatePaperQuestion } from "@/lib/actions/paper";
import type { PaperTerm } from "@/lib/generated/prisma/enums";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const TERMS: { label: string; value: PaperTerm }[] = [
  { label: "Term 1", value: "TERM_1" },
  { label: "Term 2", value: "TERM_2" },
  { label: "Term 3", value: "TERM_3" },
];

interface PaperQuestion {
  id: string;
  text: string;
  type: string;
  points: number;
  options: string[];
  correctAnswer: string;
  order: number;
}

interface Props {
  id: string;
  backHref: string;
  initialData: {
    title: string;
    subject: string;
    term: string;
    grade: string;
    year: number | null;
    duration: number;
    isModel: boolean;
    passPercentage: number;
    instructions: string | null;
    visibility: string;
    mcqCount: number;
    mcqMarks: number;
    essayCount: number;
    totalMarks: number;
    questions: PaperQuestion[];
  };
}

export function PaperEditForm({ id, backHref, initialData }: Props) {
  const router = useRouter();

  // Metadata state
  const [title, setTitle] = useState(initialData.title);
  const [term, setTerm] = useState<PaperTerm>(initialData.term as PaperTerm);
  const [grade, setGrade] = useState(initialData.grade);
  const [year, setYear] = useState(initialData.year ? String(initialData.year) : "");
  const [duration, setDuration] = useState(String(initialData.duration));
  const [isModel, setIsModel] = useState(initialData.isModel);
  const [passPercentage, setPassPercentage] = useState(String(initialData.passPercentage));
  const [instructions, setInstructions] = useState(initialData.instructions || "");
  const [visibility, setVisibility] = useState<"STUDENTS_ONLY" | "PUBLIC">(
    initialData.visibility === "PUBLIC" ? "PUBLIC" : "STUDENTS_ONLY"
  );

  // Question editing state (MCQ only — editable)
  const mcqQuestions = initialData.questions.filter((q) => q.type === "MCQ" || q.type === "TRUE_FALSE");
  const [editedQuestions, setEditedQuestions] = useState<PaperQuestion[]>(mcqQuestions);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [savingQ, setSavingQ] = useState<string | null>(null);
  const [savedQ, setSavedQ] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQ = (qid: string, updates: Partial<PaperQuestion>) =>
    setEditedQuestions((p) => p.map((q) => (q.id === qid ? { ...q, ...updates } : q)));

  const updateQOption = (qid: string, idx: number, val: string) =>
    setEditedQuestions((p) =>
      p.map((q) => {
        if (q.id !== qid) return q;
        const opts = [...q.options];
        opts[idx] = val;
        return { ...q, options: opts };
      })
    );

  const saveQuestion = async (q: PaperQuestion) => {
    setSavingQ(q.id);
    try {
      await updatePaperQuestion(q.id, { text: q.text, options: q.options, correctAnswer: q.correctAnswer });
      setSavedQ((p) => new Set([...p, q.id]));
    } catch {
      alert("Failed to save question.");
    } finally {
      setSavingQ(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await updatePaperMetadata(id, {
        title,
        grade,
        term,
        duration: parseInt(duration) || 0,
        year: year ? parseInt(year) : undefined,
        isModel,
        passPercentage: parseInt(passPercentage) || 35,
        instructions: instructions || undefined,
        visibility,
      });
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Edit Paper</h2>
          <p className="text-sm text-muted-foreground">Subject: <strong>{initialData.subject}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Metadata Card */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Paper Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Term</Label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as PaperTerm)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {TERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Year (optional)</Label>
                <Input type="number" min="2000" max="2099" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pass Percentage (%)</Label>
                <Input type="number" min="1" max="100" value={passPercentage} onChange={(e) => setPassPercentage(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Paper Type</Label>
                <div className="flex gap-2 pt-1">
                  {[{ label: "Past Paper", val: false }, { label: "Model Paper", val: true }].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setIsModel(opt.val)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isModel === opt.val ? "border-[#4D2FB2] bg-[#4D2FB2]/10 text-[#4D2FB2]" : "border-border text-muted-foreground"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instructions (optional)</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add instructions for students..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Paper summary (read-only) */}
        <Card className="border-border/50 shadow-sm bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">Paper Structure (read-only)</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary">{initialData.mcqCount} MCQ × {initialData.mcqMarks} mark{initialData.mcqMarks !== 1 ? "s" : ""}</Badge>
              {initialData.essayCount > 0 && <Badge variant="secondary">{initialData.essayCount} Structured Questions</Badge>}
              <Badge variant="secondary">Total: {initialData.totalMarks} marks</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Question counts and marks cannot be changed after creation. Edit individual MCQ question content below.</p>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Visibility</span>
            </div>
            <div className="flex gap-3">
              {(["STUDENTS_ONLY", "PUBLIC"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`flex-1 p-3 rounded-lg border-2 text-left transition-colors ${visibility === v ? "border-[#4D2FB2] bg-[#4D2FB2]/5" : "border-border hover:border-[#696FC7]/50"}`}
                >
                  <p className="text-sm font-semibold">{v === "STUDENTS_ONLY" ? "Your Students Only" : "All Evalora Students"}</p>
                  <p className="text-xs text-muted-foreground">{v === "STUDENTS_ONLY" ? "Only your assigned students" : "Visible to every student"}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-3">
          <Link href={backHref}><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={saving} className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
          </Button>
        </div>
      </form>

      {/* MCQ Question Editor (separate from form submit) */}
      {editedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Edit MCQ Questions</h3>
          <p className="text-sm text-muted-foreground">Save each question individually after editing.</p>
          {editedQuestions.map((q, qi) => (
            <Card key={q.id} className="border-border/50 shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground">Q{qi + 1}</span>
                  <span className="text-sm font-medium truncate max-w-sm">{q.text || "Untitled question"}</span>
                  <Badge variant="outline" className="text-xs">{q.type} · {q.points} pt{q.points !== 1 ? "s" : ""}</Badge>
                  {savedQ.has(q.id) && <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>}
                </div>
                {expandedQ === q.id ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              </button>

              {expandedQ === q.id && (
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input value={q.text} onChange={(e) => updateQ(q.id, { text: e.target.value })} />
                  </div>

                  {q.type === "MCQ" && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Options (click ● to mark correct)</Label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{String.fromCharCode(65 + oi)}.</span>
                          <Input value={opt} onChange={(e) => updateQOption(q.id, oi, e.target.value)} className="h-8 text-sm" />
                          <button
                            type="button"
                            onClick={() => updateQ(q.id, { correctAnswer: opt })}
                            className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${q.correctAnswer === opt && opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-input hover:border-emerald-400"}`}
                          >
                            {q.correctAnswer === opt && opt && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "TRUE_FALSE" && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Correct Answer</Label>
                      <div className="flex gap-3">
                        {["True", "False"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateQ(q.id, { correctAnswer: v })}
                            className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${q.correctAnswer === v ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "border-border"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingQ === q.id}
                      onClick={() => saveQuestion(q)}
                      className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white"
                    >
                      {savingQ === q.id ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving...</> : <><Save className="h-3 w-3 mr-1" />Save Question</>}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
