"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload, Eye } from "lucide-react";
import Link from "next/link";
import { getTeacherSubjects } from "@/lib/actions/teacher";
import { createShortNote } from "@/lib/actions/short-note";

const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const EXTRA_SUBJECTS = ["Geography", "Health"];

interface FormErrors {
  title?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  content?: string;
}

export default function UploadShortNotesPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"STUDENTS_ONLY" | "PUBLIC">("STUDENTS_ONLY");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  useEffect(() => {
    getTeacherSubjects().then(setAllowedSubjects);
  }, []);

  const subjectOptions = [...new Set([...allowedSubjects, ...EXTRA_SUBJECTS])];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!subject) newErrors.subject = "Please select a subject";
    if (!grade) newErrors.grade = "Please select a grade";
    if (!topic.trim()) newErrors.topic = "Please enter a topic";
    if (!content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createShortNote({
        title,
        subject,
        grade,
        topic,
        content,
        visibility,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to upload short note:", err);
      alert("Failed to upload short note. Please try again.");
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
        <h2 className="text-2xl font-bold font-space-grotesk">Short Note Uploaded!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          &quot;{title}&quot; has been uploaded and is now visible to your students.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setSubject(""); setGrade(""); setTopic(""); setContent(""); }}>
            Upload Another
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
          <h2 className="font-space-grotesk text-2xl font-bold">Upload Short Notes</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Create quick reference cards for student revision</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title, Subject & Topic */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Key Dates of World War II"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.subject ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select subject</option>
                  {subjectOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => { setGrade(e.target.value); if (errors.grade) setErrors((p) => ({ ...p, grade: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.grade ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select grade</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g. World War II"
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); if (errors.topic) setErrors((p) => ({ ...p, topic: undefined })); }}
                  className={errors.topic ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content</CardTitle>
            <CardDescription>Write a concise summary or quick reference note</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors((p) => ({ ...p, content: undefined })); }}
              placeholder="Write your short note content here..."
              rows={6}
              className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.content ? "border-red-500" : "border-input"}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
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
                  {saving ? "Uploading..." : "Upload Short Note"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
