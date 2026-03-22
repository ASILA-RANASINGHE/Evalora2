"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { getNoteById, updateNote } from "@/lib/actions/note";
import { getShortNoteById, updateShortNote } from "@/lib/actions/short-note";
import { getQuizDetails } from "@/lib/actions/quiz";
import { getPaperWithQuestions } from "@/lib/actions/paper";
import { QuizEditForm } from "@/app/protected/teacher/my-content/[type]/[id]/edit/quiz-edit";
import { PaperEditForm } from "@/app/protected/teacher/my-content/[type]/[id]/edit/paper-edit";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

export default function AdminEditContentPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const backHref = `/protected/admin/my-content/${type}/${id}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notes / short-notes state
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [content, setContent] = useState("");

  // Quiz / paper state
  const [quizData, setQuizData] = useState<any>(null);
  const [paperData, setPaperData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (type === "notes") {
          const data = await getNoteById(id);
          if (!data) { router.push("/protected/admin/my-content"); return; }
          setTitle(data.title);
          setTopic(data.topic || "");
          setGrade(data.grade || "");
          setContent(data.content || "");
        } else if (type === "short-notes") {
          const data = await getShortNoteById(id);
          if (!data) { router.push("/protected/admin/my-content"); return; }
          setTitle(data.title);
          setTopic(data.topic || "");
          setGrade(data.grade || "");
          setContent(data.content || "");
        } else if (type === "quizzes") {
          const data = await getQuizDetails(id);
          if (!data) { router.push("/protected/admin/my-content"); return; }
          setQuizData(data);
        } else if (type === "papers") {
          const data = await getPaperWithQuestions(id);
          if (!data) { router.push("/protected/admin/my-content"); return; }
          setPaperData(data);
        } else {
          router.push("/protected/admin/my-content");
          return;
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (type === "notes") await updateNote(id, { title, topic, grade, content });
      else if (type === "short-notes") await updateShortNote(id, { title, topic, grade, content });
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (type === "quizzes" && quizData) {
    return (
      <QuizEditForm
        id={id}
        backHref={backHref}
        initialData={{
          title: quizData.title,
          subject: quizData.subject,
          topic: quizData.topic,
          duration: quizData.duration,
          questions: quizData.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        }}
      />
    );
  }

  if (type === "papers" && paperData) {
    return (
      <PaperEditForm
        id={id}
        backHref={backHref}
        initialData={paperData}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Edit {type === "notes" ? "Note" : "Short Note"}</h2>
          <p className="text-sm text-muted-foreground">Update your content below</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select grade...</option>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-[250px] w-full rounded-md border bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href={backHref}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
