"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Inbox, Check, RotateCcw, MessageSquare } from "lucide-react";

interface FlaggedItem {
  id: string;
  student: string;
  question: string;
  subject: string;
  answer: string;
  reason: string;
  submittedAt: string;
}

const initialFlagged: FlaggedItem[] = [];

export default function ReviewFlaggedPage() {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>(initialFlagged);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const handleApprove = (id: string) => {
    setReviewedIds((prev) => new Set([...prev, id]));
  };

  const handleResubmit = (id: string) => {
    setReviewedIds((prev) => new Set([...prev, id]));
  };

  const pendingItems = flaggedItems.filter((item) => !reviewedIds.has(item.id));
  const reviewedItems = flaggedItems.filter((item) => reviewedIds.has(item.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold flex items-center gap-2">
          <Flag className="h-6 w-6 text-amber-500" />
          Review Flagged Answers
        </h2>
        <p className="text-muted-foreground mt-1">Review student answers that need manual grading</p>
      </div>

      {flaggedItems.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground max-w-md text-sm">
              There are no flagged answers waiting for your review. When students submit answers
              that require manual grading (e.g., essay questions or ambiguous responses), they&apos;ll
              appear here for you to review, approve, or request a resubmission.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 gap-1">
                <Check className="h-3 w-3" /> Approve correct answers
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 gap-1">
                <RotateCcw className="h-3 w-3" /> Request resubmission
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 gap-1">
                <MessageSquare className="h-3 w-3" /> Add feedback
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Review ({pendingItems.length})
              </h3>
              {pendingItems.map((item) => (
                <FlaggedCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onResubmit={handleResubmit}
                />
              ))}
            </div>
          )}

          {reviewedItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Reviewed ({reviewedItems.length})
              </h3>
              {reviewedItems.map((item) => (
                <Card key={item.id} className="border-border/50 shadow-sm opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.student} — {item.question}</p>
                        <p className="text-xs text-muted-foreground">{item.subject}</p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                        Reviewed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlaggedCard({
  item,
  onApprove,
  onResubmit,
}: {
  item: FlaggedItem;
  onApprove: (id: string) => void;
  onResubmit: (id: string) => void;
}) {
  return (
    <Card className="border-border/50 shadow-sm border-l-4 border-l-amber-400">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{item.student}</span>
              <Badge variant="outline" className="text-xs">{item.subject}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.question}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.submittedAt}</span>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Student&apos;s Answer:</p>
          <p className="text-sm">{item.answer}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <Flag className="h-3 w-3" />
          {item.reason}
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={() => onApprove(item.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Check className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResubmit(item.id)}>
            <RotateCcw className="h-3 w-3 mr-1" /> Request Resubmit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
