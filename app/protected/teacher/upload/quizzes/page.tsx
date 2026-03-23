"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Upload,
  BrainCircuit,
  Eye,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { subjectTopics } from "@/lib/teacher-mock-data";
import { getTeacherSubjects } from "@/lib/actions/teacher";
import { createQuiz } from "@/lib/actions/quiz";
import type { QuizType } from "@/lib/generated/prisma/enums";

const quizTypes = ["Subject", "Topic"];
const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const EXTRA_SUBJECTS = ["English", "Geography", "Civic Education", "Health"];

const quizTypeMap: Record<string, QuizType> = {
  "Topic-based": "TOPIC_BASED",
  "Unit Review": "UNIT_REVIEW",
  "Diagnostic": "DIAGNOSTIC",
  "Practice": "PRACTICE",
};

async function compressImage(file: File, maxWidth = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

interface QuizQuestion {
  id: string;
  text: string;
  points: number;
  options: string[];
  correctAnswer: string;
  imageData?: string;
}

interface FormErrors {
  title?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  type?: string;
  duration?: string;
  questions?: string;
  questionErrors?: Record<string, string>;
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

export default function UploadQuizzesPage() {
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [quizType, setQuizType] = useState("");
  const [duration, setDuration] = useState("");
  const [visibility, setVisibility] = useState<"STUDENTS_ONLY" | "PUBLIC">("STUDENTS_ONLY");
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compressingImage, setCompressingImage] = useState<string | null>(null);
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  useEffect(() => {
    getTeacherSubjects().then(setAllowedSubjects);
  }, []);

  const subjectOptions = [...new Set([...allowedSubjects, ...EXTRA_SUBJECTS])];
  const availableTopics = subject ? subjectTopics[subject] || [] : [];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!grade) newErrors.grade = "Please select a grade";
    if (!subject) newErrors.subject = "Please select a subject";
    if (quizType === "Topic" && !topic) newErrors.topic = "Please select a topic";
    if (!quizType) newErrors.type = "Please select quiz type";
    if (!duration || parseInt(duration) <= 0) newErrors.duration = "Enter a valid duration";
    if (questions.length === 0) newErrors.questions = "Add at least one question";

    const qErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (!q.text.trim()) qErrors[q.id] = "Question text is required";
      else if (!q.correctAnswer.trim()) qErrors[q.id] = "Please mark the correct answer";
      else if (q.options.filter((o) => o.trim()).length < 2)
        qErrors[q.id] = "MCQ needs at least 2 options";
    });
    if (Object.keys(qErrors).length > 0) newErrors.questionErrors = qErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(qErrors).length === 0;
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
    if (errors.questionErrors?.[id]) {
      setErrors((p) => {
        const qe = { ...p.questionErrors };
        delete qe[id];
        return { ...p, questionErrors: qe };
      });
    }
  };

  const updateOption = (questionId: string, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createQuiz({
        title,
        grade: grade || undefined,
        subject,
        topic,
        type: quizTypeMap[quizType] || "TOPIC_BASED",
        duration: parseInt(duration),
        visibility,
        questions: questions.map((q) => ({
          text: q.text,
          type: "MCQ" as const,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageData || undefined,
        })),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold font-space-grotesk">Quiz Created!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          &quot;{title}&quot; — {questions.length} questions, {totalPoints} total points
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setGrade(""); setSubject(""); setTopic(""); setQuizType(""); setDuration(""); setQuestions([emptyQuestion()]); }}>
            Create Another
          </Button>
          <Link href="/protected/teacher/upload">
            <Button>Back to Upload Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/protected/teacher/upload" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">Create Quiz</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Build interactive MCQ quizzes for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Metadata */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="e.g. Algebra Fundamentals Quiz"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => { setGrade(e.target.value); if (errors.grade) setErrors((p) => ({ ...p, grade: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.grade ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select grade</option>
                  {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
              </div>

              <div className="space-y-2">
                <Label>Quiz Type</Label>
                <select
                  value={quizType}
                  onChange={(e) => { setQuizType(e.target.value); setTopic(""); if (errors.type) setErrors((p) => ({ ...p, type: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.type ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select type</option>
                  {quizTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className={`grid gap-4 ${quizType === "Topic" ? "sm:grid-cols-2" : ""}`}>
              <div className="space-y-2">
                <Label>Subject</Label>
                <select
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setTopic(""); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.subject ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select subject</option>
                  {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>

              {quizType === "Topic" && (
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <select
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); if (errors.topic) setErrors((p) => ({ ...p, topic: undefined })); }}
                    disabled={!subject}
                    className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 ${errors.topic ? "border-red-500" : "border-input"}`}
                  >
                    <option value="">Select topic</option>
                    {availableTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={duration}
                onChange={(e) => { setDuration(e.target.value); if (errors.duration) setErrors((p) => ({ ...p, duration: undefined })); }}
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Questions Builder — MCQ Only */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Questions</h3>
              <p className="text-sm text-muted-foreground">{questions.length} question{questions.length !== 1 ? "s" : ""} &middot; {totalPoints} total points &middot; All MCQ</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>
          {errors.questions && <p className="text-xs text-red-500">{errors.questions}</p>}

          {questions.map((q, qIndex) => (
            <Card key={q.id} className="border-border/50 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-sm font-bold min-w-6">{qIndex + 1}.</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Enter question text..."
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          className={errors.questionErrors?.[q.id] ? "border-red-500" : ""}
                        />
                        {errors.questionErrors?.[q.id] && (
                          <p className="text-xs text-red-500">{errors.questionErrors[q.id]}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">Points:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={q.points}
                          onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                          className="h-8 w-16 text-xs"
                        />
                      </div>
                    </div>

                    {/* Image upload */}
                    <div>
                      {q.imageData ? (
                        <div className="relative inline-block">
                          <img src={q.imageData} alt="Question image" className="max-h-36 rounded-lg border object-contain" />
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { imageData: undefined })}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          ><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground border border-dashed rounded-md px-3 py-1.5 hover:border-purple-400 transition-colors">
                          {compressingImage === q.id ? <><Loader2 className="h-3 w-3 animate-spin" /> Compressing...</> : <><ImagePlus className="h-3 w-3" /> Attach Image (optional)</>}
                          <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setCompressingImage(q.id);
                            try {
                              const data = await compressImage(file);
                              updateQuestion(q.id, { imageData: data });
                            } catch { alert("Failed to process image."); }
                            finally { setCompressingImage(null); }
                            e.target.value = "";
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Options (click circle to mark correct answer)</Label>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{String.fromCharCode(65 + optIndex)}.</span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            className="h-8 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { correctAnswer: opt })}
                            className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${q.correctAnswer === opt && opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-input hover:border-emerald-400"}`}
                            title="Mark as correct"
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
                    className="text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors pt-2"
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
            className="w-full py-3 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Another Question
          </button>
        </div>

        {/* Visibility & Submit */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{questions.length} Questions &middot; {totalPoints} Points</p>
                    <p className="text-xs text-muted-foreground">All Multiple Choice &middot; Auto-marked</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
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
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link href="/protected/teacher/upload">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
