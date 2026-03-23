"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload, Eye, GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Shuffle, ImagePlus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { getTeacherSubjects } from "@/lib/actions/teacher";
import { createPaper, type SelectionRule } from "@/lib/actions/paper";
import type { PaperTerm } from "@/lib/generated/prisma/enums";

const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const terms = ["Term 1", "Term 2", "Term 3"];
const EXTRA_SUBJECTS = ["Geography", "Health", "Civic Education", "English"];

const termMap: Record<string, PaperTerm> = {
  "Term 1": "TERM_1",
  "Term 2": "TERM_2",
  "Term 3": "TERM_3",
};

// Roman numerals for sub-sub labels
const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const subLabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

/** Compress an image file client-side and return a base64 JPEG data URL */
async function compressImage(file: File, maxWidth = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
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

interface McqPassageSub {
  qType: "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "FILL_BLANK_OPTIONS" | "MATCH_COLUMN";
  text: string;
  options: string[];
  correctAnswer: string;
  answers: string[];            // FILL_BLANK / FILL_BLANK_OPTIONS / MATCH_COLUMN col A
  matchDistractors?: string[];  // MATCH_COLUMN extra wrong B items
  blankOptions?: string[][];    // FILL_BLANK_OPTIONS per-blank option lists
}

interface McqQuestion {
  qType: "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "FILL_BLANK_OPTIONS" | "MATCH_COLUMN" | "PASSAGE_MCQ";
  text: string;
  options: string[];   // MCQ: 4 options; MATCH_COLUMN: correct Column B items (parallel to answers)
  correctAnswer: string;
  answers: string[];   // FILL_BLANK/FILL_BLANK_OPTIONS: per-blank answers; MATCH_COLUMN: Column A items
  imageData?: string;
  matchDistractors?: string[];  // MATCH_COLUMN: extra Column B distractors
  blankOptions?: string[][];    // FILL_BLANK_OPTIONS: per-blank option arrays
  passageText?: string;               // PASSAGE_MCQ: the scenario paragraph
  passageSubQuestions?: McqPassageSub[]; // PASSAGE_MCQ: sub-questions
}

interface StructuredSubSub {
  text: string;
  answer: string;
  marks: number;
  imageData?: string;
}

interface StructuredSub {
  text: string;
  answer: string;
  marks: number;
  subSubs: StructuredSubSub[];
  imageData?: string;
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

function getMcqFlatCount(qs: McqQuestion[]): number {
  return qs.reduce(
    (s, q) => s + (q.qType === "PASSAGE_MCQ" ? (q.passageSubQuestions?.length || 0) : 1),
    0
  );
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
  const [compressingImage, setCompressingImage] = useState<string | null>(null);

  useEffect(() => {
    getTeacherSubjects().then(setAllowedSubjects);
  }, []);

  const subjectOptions = [...new Set([...allowedSubjects, ...EXTRA_SUBJECTS])];

  // Sync MCQ question array with count
  const mcqCountNum = parseInt(mcqCount) || 0;
  useEffect(() => {
    setMcqQuestions((prev) => {
      const flatCount = getMcqFlatCount(prev);
      if (mcqCountNum === 0) return [];
      if (mcqCountNum > flatCount) {
        const toAdd = mcqCountNum - flatCount;
        return [...prev, ...Array.from({ length: toAdd }, () => ({ qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] }))];
      }
      if (mcqCountNum < flatCount) {
        let remaining = mcqCountNum;
        const result: McqQuestion[] = [];
        for (const q of prev) {
          if (remaining <= 0) break;
          if (q.qType === "PASSAGE_MCQ") {
            const subs = q.passageSubQuestions || [];
            if (subs.length <= remaining) { result.push(q); remaining -= subs.length; }
            else { result.push({ ...q, passageSubQuestions: subs.slice(0, remaining) }); remaining = 0; }
          } else { result.push(q); remaining -= 1; }
        }
        return result;
      }
      return prev;
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
    () =>
      mcqCountNum * (parseInt(mcqMarks) || 0) +
      structuredTotalMarks,
    [mcqCountNum, mcqMarks, structuredTotalMarks]
  );

  const totalMcqFlat = getMcqFlatCount(mcqQuestions);
  const totalQuestions = totalMcqFlat + essayCountNum;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!subject) newErrors.subject = "Please select a subject";
    if (!term) newErrors.term = "Please select a term";
    if (!grade) newErrors.grade = "Please select a grade";
    if (!duration || parseInt(duration) <= 0) newErrors.duration = "Enter a valid duration";
    if (getMcqFlatCount(mcqQuestions) === 0 && essayCountNum === 0) newErrors.mcqCount = "Add at least one question type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Build flat question array
      const mcqFlat: Parameters<typeof createPaper>[0]["questions"] = [];
      let mcqOrderIdx = 0;
      mcqQuestions.forEach((q) => {
        if (q.qType === "PASSAGE_MCQ") {
          (q.passageSubQuestions || []).forEach((sub) => {
            const desc = q.passageText || undefined;
            const pts = parseInt(mcqMarks) || 1;
            if (sub.qType === "TRUE_FALSE") {
              mcqFlat.push({ text: sub.text, type: "TRUE_FALSE" as const, points: pts, options: ["True", "False"], correctAnswer: sub.correctAnswer || "True", order: mcqOrderIdx++, description: desc });
            } else if (sub.qType === "FILL_BLANK") {
              mcqFlat.push({ text: sub.text, type: "FILL_BLANK" as const, points: pts, options: sub.answers, correctAnswer: sub.answers.join("|"), order: mcqOrderIdx++, description: desc });
            } else if (sub.qType === "FILL_BLANK_OPTIONS") {
              mcqFlat.push({ text: sub.text, type: "FILL_BLANK_OPTIONS" as const, points: pts, options: (sub.blankOptions || []).map((opts) => opts.join("|")), correctAnswer: sub.answers.join("|"), order: mcqOrderIdx++, description: desc });
            } else if (sub.qType === "MATCH_COLUMN") {
              const allB = [...(sub.options || []), ...(sub.matchDistractors || [])];
              mcqFlat.push({ text: sub.text, type: "MATCH_COLUMN" as const, points: pts, options: allB, correctAnswer: (sub.answers || []).map((a, idx) => `${a}::${sub.options[idx] || ""}`).join("|"), order: mcqOrderIdx++, description: desc });
            } else {
              mcqFlat.push({ text: sub.text, type: "MCQ" as const, points: pts, options: sub.options.filter((o) => o.trim()), correctAnswer: sub.correctAnswer, order: mcqOrderIdx++, description: desc });
            }
          });
        } else if (q.qType === "TRUE_FALSE") {
          mcqFlat.push({
            text: q.text,
            type: "TRUE_FALSE" as const,
            points: parseInt(mcqMarks) || 1,
            options: ["True", "False"],
            correctAnswer: q.correctAnswer || "True",
            order: mcqOrderIdx++,
            imageUrl: q.imageData || undefined,
          });
        } else if (q.qType === "FILL_BLANK") {
          mcqFlat.push({
            text: q.text,
            type: "FILL_BLANK" as const,
            points: parseInt(mcqMarks) || 1,
            options: q.answers,
            correctAnswer: q.answers.join("|"),
            order: mcqOrderIdx++,
            imageUrl: q.imageData || undefined,
          });
        } else if (q.qType === "FILL_BLANK_OPTIONS") {
          mcqFlat.push({
            text: q.text,
            type: "FILL_BLANK_OPTIONS" as const,
            points: parseInt(mcqMarks) || 1,
            options: (q.blankOptions || []).map((opts) => opts.join("|")),
            correctAnswer: q.answers.join("|"),
            order: mcqOrderIdx++,
            imageUrl: q.imageData || undefined,
          });
        } else if (q.qType === "MATCH_COLUMN") {
          const allBItems = [...(q.options || []), ...(q.matchDistractors || [])];
          mcqFlat.push({
            text: q.text,
            type: "MATCH_COLUMN" as const,
            points: parseInt(mcqMarks) || 1,
            options: allBItems,
            correctAnswer: (q.answers || []).map((a, idx) => `${a}::${q.options[idx] || ""}`).join("|"),
            order: mcqOrderIdx++,
            imageUrl: q.imageData || undefined,
          });
        } else {
          mcqFlat.push({
            text: q.text,
            type: "MCQ" as const,
            points: parseInt(mcqMarks) || 1,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: mcqOrderIdx++,
            imageUrl: q.imageData || undefined,
          });
        }
      });

      let orderOffset = mcqFlat.length;
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
              imageUrl: sub.imageData || undefined,
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
                imageUrl: ss.imageData || undefined,
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
        mcqCount: mcqFlat.length,
        mcqMarks: parseInt(mcqMarks) || 0,
        essayCount: essayCountNum,
        essayMarks: 0,
        tfCount: 0,
        tfMarks: 0,
        fbCount: 0,
        fbMarks: 0,
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

  async function handleImageUpload(
    file: File,
    setter: (data: string) => void,
    key: string
  ) {
    setCompressingImage(key);
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch {
      alert("Failed to process image. Please try a different file.");
    } finally {
      setCompressingImage(null);
    }
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

  // ── Passage MCQ helpers ──────────────────────────────────────────────────────

  const addPassageBlock = () => {
    setMcqQuestions((prev) => [
      ...prev,
      {
        qType: "PASSAGE_MCQ" as const,
        text: "",
        passageText: "",
        passageSubQuestions: [
          { qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] },
          { qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] },
        ],
        options: [],
        correctAnswer: "",
        answers: [],
      },
    ]);
  };

  const removeQEntry = (idx: number) => {
    setMcqQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePassageSub = (qIdx: number, sIdx: number, patch: Partial<McqPassageSub>) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const subs = (q.passageSubQuestions || []).map((s, si) => (si === sIdx ? { ...s, ...patch } : s));
        return { ...q, passageSubQuestions: subs };
      })
    );
  };

  const updatePassageSubOption = (qIdx: number, sIdx: number, oIdx: number, val: string) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const subs = (q.passageSubQuestions || []).map((s, si) => {
          if (si !== sIdx) return s;
          const opts = [...s.options];
          opts[oIdx] = val;
          return { ...s, options: opts };
        });
        return { ...q, passageSubQuestions: subs };
      })
    );
  };

  const addPassageSub = (qIdx: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          passageSubQuestions: [
            ...(q.passageSubQuestions || []),
            { qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] },
          ],
        };
      })
    );
  };

  const removePassageSub = (qIdx: number, sIdx: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const subs = (q.passageSubQuestions || []).filter((_, si) => si !== sIdx);
        return { ...q, passageSubQuestions: subs };
      })
    );
  };

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
                    <Label className="text-xs">Number of Part 1 Questions</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={mcqCount}
                      onChange={(e) => { setMcqCount(e.target.value); if (errors.mcqCount) setErrors((p) => ({ ...p, mcqCount: undefined })); }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Marks per Question</Label>
                    <Input type="number" min="0" placeholder="0" value={mcqMarks} onChange={(e) => setMcqMarks(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Subtotal: {mcqCountNum * (parseInt(mcqMarks) || 0)} marks — includes MCQ, True/False, and Fill in the Blank</p>
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

        {/* Part 1 Question Builder */}
        {mcqCountNum > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Part 1 Questions ({totalMcqFlat})
              <span className="text-sm font-normal text-muted-foreground ml-1">MCQ · True/False · Fill in Blank · Match Column</span>
            </h3>
            {mcqQuestions.map((q, i) => {
              const startNum = getMcqFlatCount(mcqQuestions.slice(0, i)) + 1;
              if (q.qType === "PASSAGE_MCQ") {
                const endNum = startNum + (q.passageSubQuestions?.length || 0) - 1;
                return (
                  <Card key={i} className="border-[#4D2FB2]/40 shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#4D2FB2] text-white">Passage Block</span>
                          <span className="text-sm font-semibold text-muted-foreground">
                            Questions {startNum}–{endNum}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQEntry(i)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          title="Remove passage block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Passage text */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Passage / Scenario Text</Label>
                        <textarea
                          placeholder="Enter the reading passage or scenario that all questions in this block are based on..."
                          value={q.passageText || ""}
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[i] = { ...updated[i], passageText: e.target.value };
                            setMcqQuestions(updated);
                          }}
                          rows={5}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        />
                      </div>

                      {/* Sub-questions */}
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold text-[#4D2FB2]">Questions based on this passage</Label>
                        {(q.passageSubQuestions || []).map((sub, si) => (
                          <div key={si} className="border border-[#B7BDF7]/50 rounded-lg p-3 bg-[#4D2FB2]/3 space-y-2">
                            {/* Sub-question header */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#4D2FB2]">Q{startNum + si}</span>
                              {(q.passageSubQuestions?.length || 0) > 1 && (
                                <button type="button" onClick={() => removePassageSub(i, si)} className="text-muted-foreground hover:text-red-500">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>

                            {/* Mini type switcher */}
                            <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-md w-fit">
                              {(["MCQ", "TRUE_FALSE", "FILL_BLANK", "FILL_BLANK_OPTIONS", "MATCH_COLUMN"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => updatePassageSub(i, si, {
                                    qType: t,
                                    correctAnswer: t === "TRUE_FALSE" ? "True" : "",
                                    options: t === "MCQ" ? ["", "", "", ""] : [],
                                    answers: [],
                                    matchDistractors: [],
                                    blankOptions: [],
                                    text: t === "FILL_BLANK" || t === "FILL_BLANK_OPTIONS" ? "" : sub.text,
                                  })}
                                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${sub.qType === t ? "bg-white dark:bg-gray-700 shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                  {t === "MCQ" ? "MCQ" : t === "TRUE_FALSE" ? "T/F" : t === "FILL_BLANK" ? "Fill Blank" : t === "FILL_BLANK_OPTIONS" ? "Blank+Opts" : "Match"}
                                </button>
                              ))}
                            </div>

                            {/* Question text */}
                            <Input
                              placeholder={`Question ${startNum + si} text${sub.qType === "FILL_BLANK" || sub.qType === "FILL_BLANK_OPTIONS" ? " (use ___ for blanks)" : ""}...`}
                              value={sub.text}
                              onChange={(e) => {
                                if (sub.qType === "FILL_BLANK" || sub.qType === "FILL_BLANK_OPTIONS") {
                                  const newText = e.target.value;
                                  const blankCount = (newText.match(/___/g) || []).length;
                                  updatePassageSub(i, si, {
                                    text: newText,
                                    answers: Array.from({ length: blankCount }, (_, bi) => sub.answers[bi] || ""),
                                    blankOptions: Array.from({ length: blankCount }, (_, bi) => sub.blankOptions?.[bi] || []),
                                  });
                                } else {
                                  updatePassageSub(i, si, { text: e.target.value });
                                }
                              }}
                              className="h-8 text-sm"
                            />

                            {/* MCQ options */}
                            {sub.qType === "MCQ" && (
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Options (click ● to mark correct)</Label>
                                {sub.options.map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-4">{String.fromCharCode(65 + oi)}.</span>
                                    <Input value={opt} placeholder={`Option ${String.fromCharCode(65 + oi)}`} onChange={(e) => updatePassageSubOption(i, si, oi, e.target.value)} className="h-7 text-xs" />
                                    <button type="button" onClick={() => updatePassageSub(i, si, { correctAnswer: opt })} className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${sub.correctAnswer === opt && opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-input hover:border-emerald-400"}`}>
                                      {sub.correctAnswer === opt && opt && <Check className="h-3 w-3" />}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* True/False */}
                            {sub.qType === "TRUE_FALSE" && (
                              <div className="flex gap-2">
                                {(["True", "False"] as const).map((v) => (
                                  <button key={v} type="button" onClick={() => updatePassageSub(i, si, { correctAnswer: v })}
                                    className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-bold transition-colors ${sub.correctAnswer === v ? (v === "True" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-input hover:border-gray-400"}`}>
                                    {v === "True" ? "✓ True" : "✗ False"}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Fill in Blank */}
                            {sub.qType === "FILL_BLANK" && (() => {
                              const bc = (sub.text.match(/___/g) || []).length;
                              return bc === 0 ? (
                                <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Type ___ in the question above for each blank</p>
                              ) : (
                                <div className="space-y-1">
                                  {Array.from({ length: bc }, (_, bi) => (
                                    <div key={bi} className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-[#4D2FB2] w-16 shrink-0">Blank {bi + 1}:</span>
                                      <Input placeholder={`Answer ${bi + 1}`} value={sub.answers[bi] || ""} onChange={(e) => { const a = [...sub.answers]; a[bi] = e.target.value; updatePassageSub(i, si, { answers: a }); }} className="h-7 text-xs" />
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* Fill in Blank with Options */}
                            {sub.qType === "FILL_BLANK_OPTIONS" && (() => {
                              const bc = (sub.text.match(/___/g) || []).length;
                              return bc === 0 ? (
                                <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Type ___ in the question above for each blank</p>
                              ) : (
                                <div className="space-y-2">
                                  {Array.from({ length: bc }, (_, bi) => {
                                    const opts = sub.blankOptions?.[bi] || [];
                                    return (
                                      <div key={bi} className="border rounded p-2 space-y-1 bg-muted/20">
                                        <p className="text-xs font-semibold text-[#4D2FB2]">Blank {bi + 1}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {opts.map((opt, oi) => (
                                            <span key={oi} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sub.answers[bi] === opt ? "bg-green-100 border-green-400 text-green-800" : "bg-white border-gray-300 text-gray-700"}`}>
                                              {opt}
                                              <button type="button" onClick={() => { const nb = [...(sub.blankOptions || [])]; nb[bi] = opts.filter((_, oi2) => oi2 !== oi); const na = [...sub.answers]; if (na[bi] === opt) na[bi] = ""; updatePassageSub(i, si, { blankOptions: nb, answers: na }); }} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                                            </span>
                                          ))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Input placeholder="Add option, press Enter" className="h-6 text-xs" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (!val) return; const nb = [...(sub.blankOptions || [])]; if (!nb[bi]) nb[bi] = []; if (!nb[bi].includes(val)) nb[bi] = [...nb[bi], val]; updatePassageSub(i, si, { blankOptions: nb }); (e.target as HTMLInputElement).value = ""; } }} />
                                          <Label className="text-xs text-muted-foreground whitespace-nowrap">Correct:</Label>
                                          <select value={sub.answers[bi] || ""} onChange={(e) => { const na = [...sub.answers]; na[bi] = e.target.value; updatePassageSub(i, si, { answers: na }); }} className="h-6 text-xs border rounded px-1">
                                            <option value="">—</option>
                                            {opts.map((o, oi) => <option key={oi} value={o}>{o}</option>)}
                                          </select>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            {/* Match Column */}
                            {sub.qType === "MATCH_COLUMN" && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Column A → Column B pairs</Label>
                                {(sub.answers || []).map((colA, pi) => (
                                  <div key={pi} className="flex items-center gap-1">
                                    <Input value={colA} placeholder="Column A" onChange={(e) => { const a = [...(sub.answers || [])]; a[pi] = e.target.value; updatePassageSub(i, si, { answers: a }); }} className="h-7 text-xs" />
                                    <span className="text-xs text-muted-foreground">→</span>
                                    <Input value={sub.options[pi] || ""} placeholder="Column B" onChange={(e) => { const o = [...(sub.options || [])]; o[pi] = e.target.value; updatePassageSub(i, si, { options: o }); }} className="h-7 text-xs" />
                                    <button type="button" onClick={() => { const a = (sub.answers || []).filter((_, idx) => idx !== pi); const o = (sub.options || []).filter((_, idx) => idx !== pi); updatePassageSub(i, si, { answers: a, options: o }); }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => updatePassageSub(i, si, { answers: [...(sub.answers || []), ""], options: [...(sub.options || []), ""] })} className="text-xs text-[#4D2FB2] flex items-center gap-1"><Plus className="h-3 w-3" /> Add pair</button>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPassageSub(i)}
                          className="w-full py-2 border border-dashed border-[#696FC7]/50 rounded-lg text-xs font-medium text-[#4D2FB2] hover:bg-[#4D2FB2]/5 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Question to Passage
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-bold min-w-6">{startNum}.</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Question type switcher */}
                      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                        {(["MCQ", "TRUE_FALSE", "FILL_BLANK", "FILL_BLANK_OPTIONS", "MATCH_COLUMN"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              const updated = [...mcqQuestions];
                              updated[i] = {
                                ...updated[i],
                                qType: t,
                                correctAnswer: t === "TRUE_FALSE" ? "True" : "",
                                answers: [],
                                options: t === "MCQ" ? ["","","",""] : [],
                                matchDistractors: [],
                                blankOptions: [],
                              };
                              setMcqQuestions(updated);
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                              q.qType === t
                                ? "bg-white dark:bg-gray-700 shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {t === "MCQ" ? "MCQ" : t === "TRUE_FALSE" ? "True / False" : t === "FILL_BLANK" ? "Fill in Blank" : t === "FILL_BLANK_OPTIONS" ? "Blank + Options" : "Match Column"}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...mcqQuestions];
                            updated[i] = {
                              ...updated[i],
                              qType: "PASSAGE_MCQ",
                              passageText: "",
                              passageSubQuestions: [
                                { qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] },
                                { qType: "MCQ" as const, text: "", options: ["", "", "", ""], correctAnswer: "", answers: [] },
                              ],
                              text: "",
                              options: [],
                              correctAnswer: "",
                              answers: [],
                            };
                            setMcqQuestions(updated);
                          }}
                          className="px-3 py-1 rounded-md text-xs font-semibold transition-colors text-[#4D2FB2] bg-[#B7BDF7]/30 hover:bg-[#4D2FB2]/10"
                        >
                          Passage
                        </button>
                      </div>

                      <Input
                        placeholder="Enter question text..."
                        value={q.text}
                        onChange={(e) => {
                          if (q.qType === "FILL_BLANK" || q.qType === "FILL_BLANK_OPTIONS") {
                            const updated = [...mcqQuestions];
                            const newText = e.target.value;
                            const blankCount = (newText.match(/___/g) || []).length;
                            const newAnswers = Array.from({ length: blankCount }, (_, bi) => updated[i].answers[bi] || "");
                            const newBlankOptions = Array.from({ length: blankCount }, (_, bi) => updated[i].blankOptions?.[bi] || []);
                            updated[i] = { ...updated[i], text: newText, answers: newAnswers, blankOptions: newBlankOptions };
                            setMcqQuestions(updated);
                          } else {
                            const updated = [...mcqQuestions];
                            updated[i] = { ...updated[i], text: e.target.value };
                            setMcqQuestions(updated);
                          }
                        }}
                      />
                      {/* Image upload */}
                      <div className="space-y-1">
                        {q.imageData ? (
                          <div className="relative inline-block">
                            <img src={q.imageData} alt="Question image" className="max-h-36 rounded-lg border object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...mcqQuestions];
                                updated[i] = { ...updated[i], imageData: undefined };
                                setMcqQuestions(updated);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground border border-dashed rounded-md px-3 py-1.5 hover:border-purple-400 transition-colors">
                            {compressingImage === `mcq-${i}` ? (
                              <><Loader2 className="h-3 w-3 animate-spin" /> Compressing...</>
                            ) : (
                              <><ImagePlus className="h-3 w-3" /> Attach Image (optional)</>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                handleImageUpload(file, (data) => {
                                  const updated = [...mcqQuestions];
                                  updated[i] = { ...updated[i], imageData: data };
                                  setMcqQuestions(updated);
                                }, `mcq-${i}`);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* MCQ options */}
                      {q.qType === "MCQ" && (
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
                      )}

                      {/* True/False options */}
                      {q.qType === "TRUE_FALSE" && (
                        <div className="space-y-2">
                          <div className="flex gap-3">
                            {(["True", "False"] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const updated = [...mcqQuestions];
                                  updated[i] = { ...updated[i], correctAnswer: opt };
                                  setMcqQuestions(updated);
                                }}
                                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${
                                  q.correctAnswer === opt
                                    ? opt === "True"
                                      ? "border-green-500 bg-green-50 text-green-700"
                                      : "border-red-500 bg-red-50 text-red-700"
                                    : "border-input hover:border-gray-400"
                                }`}
                              >
                                {opt === "True" ? "✓ True" : "✗ False"}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Click to set the correct answer</p>
                        </div>
                      )}

                      {/* Fill in Blank */}
                      {q.qType === "FILL_BLANK" && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">___</code> in your question text for each blank</p>
                          {(() => {
                            const blankCount = (q.text.match(/___/g) || []).length;
                            if (blankCount === 0) return (
                              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Type ___ in the question above to add blanks</p>
                            );
                            return (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Correct answers for each blank:</p>
                                {Array.from({ length: blankCount }, (_, bi) => (
                                  <div key={bi} className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-purple-600 w-16 shrink-0">Blank {bi + 1}:</span>
                                    <Input
                                      placeholder={`Answer for blank ${bi + 1}`}
                                      value={q.answers[bi] || ""}
                                      onChange={(e) => {
                                        const updated = [...mcqQuestions];
                                        const newAnswers = [...(updated[i].answers || [])];
                                        newAnswers[bi] = e.target.value;
                                        updated[i] = { ...updated[i], answers: newAnswers };
                                        setMcqQuestions(updated);
                                      }}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Fill in Blank with Options */}
                      {q.qType === "FILL_BLANK_OPTIONS" && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">___</code> in your question text. For each blank, enter the options students can choose from.</p>
                          {(() => {
                            const blankCount = (q.text.match(/___/g) || []).length;
                            if (blankCount === 0) return (
                              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Type ___ in the question above to add blanks</p>
                            );
                            return (
                              <div className="space-y-3">
                                {Array.from({ length: blankCount }, (_, bi) => {
                                  const opts = q.blankOptions?.[bi] || [];
                                  const correctAns = q.answers[bi] || "";
                                  return (
                                    <div key={bi} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                                      <p className="text-xs font-semibold text-purple-700">Blank {bi + 1}</p>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Options (press Enter or comma to add)</Label>
                                        <div className="flex flex-wrap gap-1 mb-1">
                                          {opts.map((opt, oi) => (
                                            <span key={oi} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${correctAns === opt ? "bg-green-100 border-green-400 text-green-800" : "bg-white border-gray-300 text-gray-700"}`}>
                                              {opt}
                                              <button type="button" onClick={() => {
                                                const updated = [...mcqQuestions];
                                                const newOpts = opts.filter((_, idx) => idx !== oi);
                                                const newBlankOptions = [...(updated[i].blankOptions || [])];
                                                newBlankOptions[bi] = newOpts;
                                                const newAnswers = [...updated[i].answers];
                                                if (newAnswers[bi] === opt) newAnswers[bi] = "";
                                                updated[i] = { ...updated[i], blankOptions: newBlankOptions, answers: newAnswers };
                                                setMcqQuestions(updated);
                                              }} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                                            </span>
                                          ))}
                                        </div>
                                        <Input
                                          placeholder="Type an option and press Enter"
                                          className="h-8 text-sm"
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === ",") {
                                              e.preventDefault();
                                              const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, "");
                                              if (!val) return;
                                              const updated = [...mcqQuestions];
                                              const newBlankOptions = [...(updated[i].blankOptions || [])];
                                              if (!newBlankOptions[bi]) newBlankOptions[bi] = [];
                                              if (!newBlankOptions[bi].includes(val)) {
                                                newBlankOptions[bi] = [...newBlankOptions[bi], val];
                                              }
                                              updated[i] = { ...updated[i], blankOptions: newBlankOptions };
                                              setMcqQuestions(updated);
                                              (e.target as HTMLInputElement).value = "";
                                            }
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Correct answer</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {opts.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">Add options above first</p>
                                          ) : opts.map((opt, oi) => (
                                            <button key={oi} type="button" onClick={() => {
                                              const updated = [...mcqQuestions];
                                              const newAnswers = [...updated[i].answers];
                                              newAnswers[bi] = opt;
                                              updated[i] = { ...updated[i], answers: newAnswers };
                                              setMcqQuestions(updated);
                                            }} className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${correctAns === opt ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-400"}`}>
                                              {opt}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Match Column */}
                      {q.qType === "MATCH_COLUMN" && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">Add pairs: each Column A item must match one Column B item. Optionally add extra Column B distractors.</p>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Label className="text-xs font-semibold text-blue-700">Column A</Label>
                              <Label className="text-xs font-semibold text-purple-700">Column B (correct match)</Label>
                            </div>
                            {(q.answers || []).map((aItem, pi) => (
                              <div key={pi} className="grid grid-cols-2 gap-2 items-center">
                                <Input
                                  placeholder={`A${pi + 1} item`}
                                  value={aItem}
                                  onChange={(e) => {
                                    const updated = [...mcqQuestions];
                                    const newAnswers = [...(updated[i].answers || [])];
                                    newAnswers[pi] = e.target.value;
                                    updated[i] = { ...updated[i], answers: newAnswers };
                                    setMcqQuestions(updated);
                                  }}
                                  className="h-8 text-sm"
                                />
                                <div className="flex items-center gap-1">
                                  <Input
                                    placeholder={`B${pi + 1} match`}
                                    value={q.options[pi] || ""}
                                    onChange={(e) => {
                                      const updated = [...mcqQuestions];
                                      const newOpts = [...(updated[i].options || [])];
                                      newOpts[pi] = e.target.value;
                                      updated[i] = { ...updated[i], options: newOpts };
                                      setMcqQuestions(updated);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                  <button type="button" onClick={() => {
                                    const updated = [...mcqQuestions];
                                    const newAnswers = (updated[i].answers || []).filter((_, idx) => idx !== pi);
                                    const newOpts = (updated[i].options || []).filter((_, idx) => idx !== pi);
                                    updated[i] = { ...updated[i], answers: newAnswers, options: newOpts };
                                    setMcqQuestions(updated);
                                  }} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            ))}
                            <button type="button" onClick={() => {
                              const updated = [...mcqQuestions];
                              updated[i] = { ...updated[i], answers: [...(updated[i].answers || []), ""], options: [...(updated[i].options || []), ""] };
                              setMcqQuestions(updated);
                            }} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1">
                              <Plus className="h-3 w-3" /> Add pair
                            </button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Extra Column B distractors (optional — these appear as wrong choices)</Label>
                            <div className="flex flex-wrap gap-1">
                              {(q.matchDistractors || []).map((d, di) => (
                                <span key={di} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-50 border border-orange-300 text-orange-800">
                                  {d}
                                  <button type="button" onClick={() => {
                                    const updated = [...mcqQuestions];
                                    updated[i] = { ...updated[i], matchDistractors: (updated[i].matchDistractors || []).filter((_, idx) => idx !== di) };
                                    setMcqQuestions(updated);
                                  }} className="text-orange-400 hover:text-red-500">×</button>
                                </span>
                              ))}
                            </div>
                            <Input
                              placeholder="Type a distractor and press Enter"
                              className="h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = (e.target as HTMLInputElement).value.trim();
                                  if (!val) return;
                                  const updated = [...mcqQuestions];
                                  updated[i] = { ...updated[i], matchDistractors: [...(updated[i].matchDistractors || []), val] };
                                  setMcqQuestions(updated);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQEntry(i)}
                      className="shrink-0 pt-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          <button
            type="button"
            onClick={addPassageBlock}
            className="w-full py-3 border-2 border-dashed border-[#4D2FB2]/30 rounded-xl text-sm font-medium text-[#4D2FB2] hover:bg-[#4D2FB2]/5 hover:border-[#4D2FB2]/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Passage Block (scenario + multiple questions)
          </button>
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
                            <div className="flex items-start gap-2">
                              {showSubLabel && (
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem] pt-2">
                                  {subLabelStr})
                                </span>
                              )}
                              <div className="flex-1 space-y-2">
                                <textarea
                                  placeholder={`Sub-question ${showSubLabel ? subLabelStr + ") " : ""}text... (Enter for new line)`}
                                  value={sub.text}
                                  onChange={(e) => updateSub(mainIdx, subIdx, { text: e.target.value })}
                                  rows={2}
                                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[2.5rem]"
                                />
                                {sub.subSubs.length === 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground">Marks:</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={sub.marks}
                                      onChange={(e) => updateSub(mainIdx, subIdx, { marks: parseInt(e.target.value) || 0 })}
                                      className="h-7 text-sm w-16 text-center"
                                      title="Marks"
                                    />
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSub(mainIdx, subIdx)}
                                className="text-red-400 hover:text-red-600 transition-colors shrink-0 mt-1"
                                title="Remove sub-question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Image upload for sub-question */}
                            {sub.subSubs.length === 0 && (
                              <div className="space-y-1">
                                {sub.imageData ? (
                                  <div className="relative inline-block">
                                    <img src={sub.imageData} alt="Question image" className="max-h-32 rounded-lg border object-contain" />
                                    <button
                                      type="button"
                                      onClick={() => updateSub(mainIdx, subIdx, { imageData: undefined })}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                      title="Remove image"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground border border-dashed rounded-md px-3 py-1.5 hover:border-purple-400 transition-colors">
                                    {compressingImage === `sub-${mainIdx}-${subIdx}` ? (
                                      <><Loader2 className="h-3 w-3 animate-spin" /> Compressing...</>
                                    ) : (
                                      <><ImagePlus className="h-3 w-3" /> Attach Image (optional)</>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        handleImageUpload(file, (data) => updateSub(mainIdx, subIdx, { imageData: data }), `sub-${mainIdx}-${subIdx}`);
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            )}
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
                                    <div className="flex items-start gap-2">
                                      <span className="text-xs font-bold text-purple-500 min-w-[1.75rem] pt-2">
                                        {romanNumerals[ssIdx]})
                                      </span>
                                      <div className="flex-1 space-y-1">
                                        <textarea
                                          placeholder={`Sub-part ${romanNumerals[ssIdx]}) text... (Enter for new line)`}
                                          value={ss.text}
                                          onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { text: e.target.value })}
                                          rows={2}
                                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[2.5rem]"
                                        />
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs text-muted-foreground">Marks:</span>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={ss.marks}
                                            onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { marks: parseInt(e.target.value) || 0 })}
                                            className="h-7 text-sm w-16 text-center"
                                            title="Marks"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeSubSub(mainIdx, subIdx, ssIdx)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <div className="ml-[1.75rem] space-y-1.5">
                                      {ss.imageData ? (
                                        <div className="relative inline-block">
                                          <img src={ss.imageData} alt="Question image" className="max-h-28 rounded-lg border object-contain" />
                                          <button
                                            type="button"
                                            onClick={() => updateSubSub(mainIdx, subIdx, ssIdx, { imageData: undefined })}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground border border-dashed rounded-md px-3 py-1.5 hover:border-purple-400 transition-colors">
                                          {compressingImage === `ss-${mainIdx}-${subIdx}-${ssIdx}` ? (
                                            <><Loader2 className="h-3 w-3 animate-spin" /> Compressing...</>
                                          ) : (
                                            <><ImagePlus className="h-3 w-3" /> Attach Image</>
                                          )}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              handleImageUpload(file, (data) => updateSubSub(mainIdx, subIdx, ssIdx, { imageData: data }), `ss-${mainIdx}-${subIdx}-${ssIdx}`);
                                              e.target.value = "";
                                            }}
                                          />
                                        </label>
                                      )}
                                      <textarea
                                        placeholder="Reference answer..."
                                        value={ss.answer}
                                        onChange={(e) => updateSubSub(mainIdx, subIdx, ssIdx, { answer: e.target.value })}
                                        rows={2}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                      />
                                    </div>
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
            <div className="space-y-2">
              <Label>Paper Type</Label>
              <div className="flex gap-3">
                {([{ label: "Past Paper", val: false }, { label: "Model Paper", val: true }] as const).map((opt) => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => setIsModel(opt.val)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${isModel === opt.val ? "border-[#4D2FB2] bg-[#4D2FB2]/10 text-[#4D2FB2]" : "border-border text-muted-foreground hover:border-[#696FC7]/50"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select whether this is an original past paper or a model/sample paper</p>
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
