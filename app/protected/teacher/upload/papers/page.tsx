"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Upload } from "lucide-react";
import Link from "next/link";
import { subjects } from "@/lib/teacher-mock-data";
import { createPaper } from "@/lib/actions/paper";
import type { PaperTerm } from "@/lib/generated/prisma/enums";

const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const terms = ["Term 1", "Term 2", "Term 3", "Mid-Year", "End-of-Year"];

const termMap: Record<string, PaperTerm> = {
  "Term 1": "TERM_1",
  "Term 2": "TERM_2",
  "Term 3": "TERM_3",
  "Mid-Year": "MID_YEAR",
  "End-of-Year": "END_OF_YEAR",
};

interface FormErrors {
  title?: string;
  subject?: string;
  term?: string;
  grade?: string;
  duration?: string;
  mcqCount?: string;
  essayCount?: string;
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
  const [essayMarks, setEssayMarks] = useState("");
  const [isModel, setIsModel] = useState(false);
  const [passPercentage, setPassPercentage] = useState("35");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalQuestions = (parseInt(mcqCount) || 0) + (parseInt(essayCount) || 0);
  const totalMarks = useMemo(() => {
    const mcqTotal = (parseInt(mcqCount) || 0) * (parseInt(mcqMarks) || 0);
    const essayTotal = (parseInt(essayCount) || 0) * (parseInt(essayMarks) || 0);
    return mcqTotal + essayTotal;
  }, [mcqCount, mcqMarks, essayCount, essayMarks]);

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
      await createPaper({
        title,
        subject,
        term: termMap[term] || "TERM_1",
        grade,
        duration: parseInt(duration),
        isModel,
        mcqCount: parseInt(mcqCount) || 0,
        mcqMarks: parseInt(mcqMarks) || 0,
        essayCount: parseInt(essayCount) || 0,
        essayMarks: parseInt(essayMarks) || 0,
        totalMarks,
        passPercentage: parseInt(passPercentage) || 35,
        instructions: notes || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to create paper:", err);
      alert("Failed to create paper. Please try again.");
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
        <h2 className="text-2xl font-bold font-space-grotesk">Paper Created!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          &quot;{title}&quot; — {totalQuestions} questions, {totalMarks} total marks
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setSubject(""); setTerm(""); setGrade(""); setDuration(""); setMcqCount(""); setMcqMarks(""); setEssayCount(""); setEssayMarks(""); setIsModel(false); setPassPercentage("35"); setNotes(""); }}>
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
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
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
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={mcqMarks}
                      onChange={(e) => setMcqMarks(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Subtotal: {(parseInt(mcqCount) || 0) * (parseInt(mcqMarks) || 0)} marks
                </p>
              </div>

              {/* Essay Section */}
              <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  Essay Questions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Number of Essays</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={essayCount}
                      onChange={(e) => { setEssayCount(e.target.value); if (errors.mcqCount) setErrors((p) => ({ ...p, mcqCount: undefined })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Marks per Essay</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={essayMarks}
                      onChange={(e) => setEssayMarks(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Subtotal: {(parseInt(essayCount) || 0) * (parseInt(essayMarks) || 0)} marks
                </p>
              </div>
            </div>
            {errors.mcqCount && <p className="text-xs text-red-500">{errors.mcqCount}</p>}

            {/* Auto-calculated summary */}
            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
              <div>
                <p className="text-xs text-muted-foreground">Total Questions</p>
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
              <Label htmlFor="notes">Notes (optional)</Label>
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

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/protected/teacher/upload">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
            <Upload className="h-4 w-4 mr-2" />
            {saving ? "Creating..." : "Create Paper"}
          </Button>
        </div>
      </form>
    </div>
  );
}
