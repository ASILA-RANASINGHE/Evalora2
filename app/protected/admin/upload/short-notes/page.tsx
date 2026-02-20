"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS, TOPICS_BY_SUBJECT } from "@/lib/admin-mock-data";
import { ArrowLeft, Upload, Check } from "lucide-react";
import Link from "next/link";
import { createShortNote } from "@/lib/actions/short-note";

export default function UploadShortNotesPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const topics = subject ? TOPICS_BY_SUBJECT[subject] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createShortNote({
        title,
        subject,
        topic,
        content,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to upload short note:", err);
      alert("Failed to upload short note. Please try again.");
    } finally {
      setSaving(false);
    }
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
            Upload Short Notes
          </h2>
          <p className="text-sm text-muted-foreground">
            Create quick reference cards and summary notes for students.
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
                  Short Note Title
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

            {/* Content */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="min-h-[180px] w-full rounded-md border bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Write your short note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar options */}
          <div className="space-y-6">
            {/* Subject & Topic */}
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
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setTopic("");
                    }}
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
                    Topic
                  </Label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={!subject}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select topic...</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
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
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!title || !subject || !topic || !content || saving}
            >
              {submitted ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Published!
                </>
              ) : saving ? (
                "Publishing..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Publish Short Note
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
