"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, GripVertical, Check, Save, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { updateQuiz } from "@/lib/actions/quiz";
import { subjectTopics } from "@/lib/teacher-mock-data";

interface QuizQuestion {
  id: string;
  text: string;
  points: number;
  options: string[];
  correctAnswer: string;
}

interface Props {
  id: string;
  backHref: string;
  initialData: {
    title: string;
    subject: string;
    topic: string;
    duration: number;
    questions: QuizQuestion[];
  };
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyQuestion = (): QuizQuestion => ({
  id: generateId(),
  text: "",
  points: 1,
  options: ["", "", "", ""],
  correctAnswer: "",
});

export function QuizEditForm({ id, backHref, initialData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [topic, setTopic] = useState(initialData.topic);
  const [duration, setDuration] = useState(String(initialData.duration));
  const [visibility, setVisibility] = useState<"STUDENTS_ONLY" | "PUBLIC">("STUDENTS_ONLY");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialData.questions.map((q) => ({ ...q, id: q.id || generateId() }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableTopics = subjectTopics[initialData.subject] || [];
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (qid: string) => setQuestions((p) => p.filter((q) => q.id !== qid));

  const updateQuestion = (qid: string, updates: Partial<QuizQuestion>) =>
    setQuestions((p) => p.map((q) => (q.id === qid ? { ...q, ...updates } : q)));

  const updateOption = (qid: string, idx: number, val: string) =>
    setQuestions((p) =>
      p.map((q) => {
        if (q.id !== qid) return q;
        const opts = [...q.options];
        opts[idx] = val;
        return { ...q, options: opts };
      })
    );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!duration || parseInt(duration) <= 0) errs.duration = "Valid duration required";
    if (questions.length === 0) errs.questions = "At least one question required";
    questions.forEach((q) => {
      if (!q.text.trim()) errs[q.id] = "Question text required";
      else if (!q.correctAnswer.trim()) errs[q.id] = "Mark the correct answer";
      else if (q.options.filter((o) => o.trim()).length < 2) errs[q.id] = "Need at least 2 options";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      await updateQuiz(id, {
        title,
        topic,
        duration: parseInt(duration),
        visibility,
        questions: questions.map((q) => ({
          text: q.text,
          type: "MCQ" as const,
          points: q.points,
          options: q.options.filter((o) => o.trim()),
          correctAnswer: q.correctAnswer,
        })),
      });
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Edit Quiz</h2>
          <p className="text-sm text-muted-foreground">Subject: <strong>{initialData.subject}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Metadata */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Quiz Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className={errors.title ? "border-red-500" : ""} />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Topic</Label>
                {availableTopics.length > 0 ? (
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Free text below</option>
                    {availableTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : null}
                <Input
                  placeholder="Topic name"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number" min="1" value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Questions</h3>
              <p className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalPoints} total points
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>
          {errors.questions && <p className="text-xs text-red-500">{errors.questions}</p>}

          {questions.map((q, qi) => (
            <Card key={q.id} className="border-border/50 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-sm font-bold min-w-6">{qi + 1}.</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder="Enter question text..."
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          className={errors[q.id] ? "border-red-500" : ""}
                        />
                        {errors[q.id] && <p className="text-xs text-red-500">{errors[q.id]}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Label className="text-xs whitespace-nowrap">Points:</Label>
                        <Input
                          type="number" min="1" value={q.points}
                          onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                          className="h-8 w-16 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Options (click ● to mark correct)</Label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{String.fromCharCode(65 + oi)}.</span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            className="h-8 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { correctAnswer: opt })}
                            className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${q.correctAnswer === opt && opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-input hover:border-emerald-400"}`}
                          >
                            {q.correctAnswer === opt && opt && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    disabled={questions.length === 1}
                    className="text-muted-foreground hover:text-red-500 disabled:opacity-30 pt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-[#696FC7]/50 hover:bg-[#4D2FB2]/5 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Another Question
          </button>
        </div>

        {/* Visibility & Submit */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
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
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Link href={backHref}><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit" disabled={saving} className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
