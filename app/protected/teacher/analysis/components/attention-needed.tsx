"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Mail, BookOpen, CheckCircle } from "lucide-react";
import { assignPractice, sendMessageToStudent } from "@/lib/actions/teacher";
import type { Student } from "@/lib/teacher-mock-data";

interface AttentionNeededProps {
  students: Student[];
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const STATUS_STYLES = {
  "At Risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export function AttentionNeeded({ students }: AttentionNeededProps) {
  const [isPending, startTransition] = useTransition();

  // Assign Practice dialog state
  const [practiceTarget, setPracticeTarget] = useState<Student | null>(null);
  const [practiceTopic, setPracticeTopic] = useState("");
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Send Message dialog state
  const [messageTarget, setMessageTarget] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);

  const sorted = [...students].sort((a, b) => {
    const aHigh = a.riskSignals.some((s) => s.severity === "high") ? 0 : 1;
    const bHigh = b.riskSignals.some((s) => s.severity === "high") ? 0 : 1;
    return aHigh - bHigh;
  });

  function openPractice(student: Student) {
    setPracticeTarget(student);
    setPracticeTopic("");
    setPracticeSuccess(false);
  }

  function openMessage(student: Student) {
    setMessageTarget(student);
    setMessageText("");
    setMessageSuccess(false);
  }

  function handleAssignPractice() {
    if (!practiceTarget || !practiceTopic.trim()) return;
    startTransition(async () => {
      const subject = practiceTarget.subjects[0] ?? "General";
      await assignPractice(practiceTarget.uuid, subject, practiceTopic.trim());
      setPracticeSuccess(true);
    });
  }

  function handleSendMessage() {
    if (!messageTarget || !messageText.trim()) return;
    startTransition(async () => {
      await sendMessageToStudent(messageTarget.uuid, messageText.trim());
      setMessageSuccess(true);
    });
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Students Needing Attention
          </CardTitle>
          <CardDescription>{students.length} students require follow-up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All students are on track!</p>
          ) : (
            sorted.map((student) => (
              <div key={student.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white text-xs font-bold shrink-0">
                    {initials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{student.name}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLES[student.status]}`}>
                        {student.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{student.grade} · {student.avgScore}% avg</p>
                  </div>
                </div>
                {/* Risk signals */}
                <div className="flex flex-wrap gap-1.5 ml-12">
                  {student.riskSignals.map((sig, i) => (
                    <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sig.severity === "high" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"}`}>
                      {sig.label}
                    </span>
                  ))}
                </div>
                {/* Actions */}
                <div className="flex gap-2 ml-12">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => openPractice(student)}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Assign Practice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => openMessage(student)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Send Message
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Assign Practice Dialog */}
      <Dialog open={!!practiceTarget} onOpenChange={(open) => !open && setPracticeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Assign Practice
            </DialogTitle>
          </DialogHeader>

          {practiceSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-medium text-center">Practice assigned!</p>
              <p className="text-sm text-muted-foreground text-center">
                {practiceTarget?.name} has been notified to practice &quot;{practiceTopic}&quot;.
              </p>
              <Button onClick={() => setPracticeTarget(null)} className="mt-2">Done</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Student</p>
                  <p className="font-medium">{practiceTarget?.name}</p>
                  <p className="text-xs text-muted-foreground">{practiceTarget?.grade} · {practiceTarget?.subjects.join(", ")}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Topic / Area to Practice</label>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. World War II, Algebra, Essay Writing..."
                    value={practiceTopic}
                    onChange={(e) => setPracticeTopic(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Subject: {practiceTarget?.subjects[0] ?? "General"}
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPracticeTarget(null)}>Cancel</Button>
                <Button
                  onClick={handleAssignPractice}
                  disabled={!practiceTopic.trim() || isPending}
                  className="bg-[#4D2FB2] hover:bg-[#3d249a] text-white"
                >
                  {isPending ? "Sending..." : "Assign Practice"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={!!messageTarget} onOpenChange={(open) => !open && setMessageTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600" />
              Send Message
            </DialogTitle>
          </DialogHeader>

          {messageSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-medium text-center">Message sent!</p>
              <p className="text-sm text-muted-foreground text-center">
                {messageTarget?.name} will see your message in their notifications.
              </p>
              <Button onClick={() => setMessageTarget(null)} className="mt-2">Done</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">To</p>
                  <p className="font-medium">{messageTarget?.name}</p>
                  <p className="text-xs text-muted-foreground">{messageTarget?.grade}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Write your message to the student..."
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setMessageTarget(null)}>Cancel</Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isPending}
                  className="bg-[#4D2FB2] hover:bg-[#3d249a] text-white"
                >
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
