"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteNote } from "@/lib/actions/note";
import { deleteShortNote } from "@/lib/actions/short-note";
import { deleteQuiz } from "@/lib/actions/quiz";
import { deletePaper } from "@/lib/actions/paper";

interface Props {
  type: string;
  id: string;
  title: string;
  backHref: string;
}

export function DeleteContentButton({ type, id, title, backHref }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      switch (type) {
        case "notes": await deleteNote(id); break;
        case "short-notes": await deleteShortNote(id); break;
        case "quizzes": await deleteQuiz(id); break;
        case "papers": await deletePaper(id); break;
      }
      router.push(backHref);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
      Delete
    </Button>
  );
}
