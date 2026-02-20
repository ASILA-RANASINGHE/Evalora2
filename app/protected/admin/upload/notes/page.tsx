"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS } from "@/lib/admin-mock-data";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
import {
  ArrowLeft,
  Upload,
  FileUp,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Heading2,
  Link as LinkIcon,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createNote } from "@/lib/actions/note";

const ACCEPTED_TYPES = ".pdf,.docx,.ppt,.pptx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadNotesPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const valid = Array.from(selected).filter((f) => f.size <= MAX_FILE_SIZE);
    setFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createNote({ title, subject, grade, topic, content });
      setSubmitted(true);
      setTitle("");
      setSubject("");
      setGrade("");
      setTopic("");
      setContent("");
      setFiles([]);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  const insertFormatting = (tag: string) => {
    setContent((prev) => prev + tag);
  };

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-3">
        <Link href="/protected/admin/upload">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">
            Upload Notes
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and publish study notes for students.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <Card>
              <CardContent className="p-5">
                <Label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                  Note Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            {/* Rich Text Editor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Toolbar */}
                <div className="mb-2 flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted/50 p-1.5">
                  <button
                    type="button"
                    onClick={() => insertFormatting("**bold**")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("*italic*")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("__underline__")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </button>
                  <div className="mx-1 w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n## Heading\n")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Heading"
                  >
                    <Heading2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n- item\n")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n1. item\n")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <div className="mx-1 w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("[link](url)")}
                    className="rounded p-1.5 hover:bg-muted"
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 hover:bg-muted"
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 hover:bg-muted"
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  className="min-h-[250px] w-full rounded-b-md border bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Write your note content here... (Supports Markdown)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            {/* File Attachments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">File Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, PPT, TXT (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span className="truncate text-sm">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar options */}
          <div className="space-y-6">
            {/* Subject, Grade & Topic */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">
                    Subject
                  </Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">
                    Grade
                  </Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select grade...</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">
                    Topic
                  </Label>
                  <Input
                    placeholder="e.g. World War II"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visibility */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="border-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  All Evalora Students
                </Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  Admin content is visible to all students on the platform.
                </p>
              </CardContent>
            </Card>

            {/* Submit */}
            {error && (
              <p className="text-sm text-red-500 mb-2">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!title || !subject || !grade || !topic || !content || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : submitted ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Published!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Publish Note
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
