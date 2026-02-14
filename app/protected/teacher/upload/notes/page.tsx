"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Heading2,
  Paperclip,
  X,
  Upload,
  Check,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { subjects, subjectTopics } from "@/lib/teacher-mock-data";
import { createNote } from "@/lib/actions/note";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain"];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"];

interface FormErrors {
  title?: string;
  subject?: string;
  topic?: string;
  content?: string;
}

export default function UploadNotesPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTopics = subject ? subjectTopics[subject] || [] : [];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!subject) newErrors.subject = "Please select a subject";
    if (!topic) newErrors.topic = "Please select a topic";
    if (!content.trim()) newErrors.content = "Note content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 10MB limit`);
        return false;
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        alert(`${file.name} is not a supported file type`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createNote({
        title,
        subject,
        topic,
        content,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to upload note:", err);
      alert("Failed to upload note. Please try again.");
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
        <h2 className="text-2xl font-bold font-space-grotesk">Notes Uploaded!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          &quot;{title}&quot; has been uploaded and is now visible to your students.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setSubject(""); setTopic(""); setContent(""); setFiles([]); }}>
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
          <h2 className="font-space-grotesk text-2xl font-bold">Upload Notes</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Share study materials with your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to Quadratic Equations"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Subject & Topic */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setTopic(""); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.subject ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); if (errors.topic) setErrors((p) => ({ ...p, topic: undefined })); }}
                  disabled={!subject}
                  className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 ${errors.topic ? "border-red-500" : "border-input"}`}
                >
                  <option value="">Select topic</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rich Text Editor */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content</CardTitle>
            <CardDescription>Write or paste your note content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1 p-1 border rounded-lg bg-muted/30">
              <ToolbarButton icon={Bold} label="Bold" />
              <ToolbarButton icon={Italic} label="Italic" />
              <ToolbarButton icon={Underline} label="Underline" />
              <div className="w-px bg-border mx-1" />
              <ToolbarButton icon={Heading2} label="Heading" />
              <ToolbarButton icon={List} label="Bullet List" />
              <ToolbarButton icon={ListOrdered} label="Numbered List" />
              <div className="w-px bg-border mx-1" />
              <ToolbarButton icon={AlignLeft} label="Align Left" />
              <ToolbarButton icon={AlignCenter} label="Align Center" />
            </div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors((p) => ({ ...p, content: undefined })); }}
              placeholder="Start writing your notes here..."
              rows={12}
              className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.content ? "border-red-500" : "border-input"}`}
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attachments</CardTitle>
            <CardDescription>PDF, DOCX, PPT, TXT — up to 10MB each</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
            >
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to attach files</p>
              <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileAdd}
              className="hidden"
            />
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visibility & Submit */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Visibility:</span>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                  Your Students Only
                </Badge>
              </div>
              <div className="flex gap-3">
                <Link href="/protected/teacher/upload">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? "Uploading..." : "Upload Notes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function ToolbarButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
