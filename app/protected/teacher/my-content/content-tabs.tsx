"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  StickyNote,
  BrainCircuit,
  ClipboardList,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { deleteNote } from "@/lib/actions/note";
import { deleteShortNote } from "@/lib/actions/short-note";
import { deleteQuiz } from "@/lib/actions/quiz";
import { deletePaper } from "@/lib/actions/paper";

interface ContentItem {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  grade?: string;
  status: string;
  createdAt: Date;
  questionCount?: number;
  totalMarks?: number;
}

interface ContentTabsProps {
  notes: ContentItem[];
  shortNotes: ContentItem[];
  quizzes: ContentItem[];
  papers: ContentItem[];
}

const tabs = [
  { key: "notes", label: "Notes", icon: FileText },
  { key: "shortNotes", label: "Short Notes", icon: StickyNote },
  { key: "quizzes", label: "Quizzes", icon: BrainCircuit },
  { key: "papers", label: "Papers", icon: ClipboardList },
] as const;

const routeMap: Record<string, string> = {
  notes: "notes",
  shortNotes: "short-notes",
  quizzes: "quizzes",
  papers: "papers",
};

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  DRAFT: "bg-gray-100 text-gray-700",
  FLAGGED: "bg-red-100 text-red-700",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function handleDelete(type: string, id: string): Promise<void> {
  switch (type) {
    case "notes": await deleteNote(id); break;
    case "shortNotes": await deleteShortNote(id); break;
    case "quizzes": await deleteQuiz(id); break;
    case "papers": await deletePaper(id); break;
  }
}

export function ContentTabs({
  notes,
  shortNotes,
  quizzes,
  papers,
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("notes");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const basePath = pathname.startsWith("/protected/admin")
    ? "/protected/admin/my-content"
    : "/protected/teacher/my-content";

  const contentMap: Record<string, ContentItem[]> = {
    notes,
    shortNotes,
    quizzes,
    papers,
  };

  const items = contentMap[activeTab] ?? [];

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {contentMap[tab.key]?.length ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No{" "}
              {tabs.find((t) => t.key === activeTab)?.label.toLowerCase() ??
                "content"}{" "}
              uploaded yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:border-[#696FC7]/50 transition-all hover:shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <Link
                  href={`${basePath}/${routeMap[activeTab]}/${item.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium group-hover:text-[#4D2FB2] transition-colors truncate">
                        {item.title}
                      </p>
                      <Eye className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 text-[#4D2FB2] transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.subject}
                      {item.topic && ` · ${item.topic}`}
                      {item.grade && ` · Grade ${item.grade}`}
                      {item.questionCount != null && ` · ${item.questionCount} questions`}
                      {item.totalMarks != null && ` · ${item.totalMarks} marks`}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Badge variant="secondary" className={statusColors[item.status] ?? ""}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {formatDate(item.createdAt)}
                  </span>
                  <Link href={`${basePath}/${routeMap[activeTab]}/${item.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#4D2FB2]" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    title="Delete"
                    disabled={deletingId === item.id}
                    onClick={async () => {
                      if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
                      setDeletingId(item.id);
                      try {
                        await handleDelete(activeTab, item.id);
                        router.refresh();
                      } catch (e) {
                        alert("Failed to delete. Please try again.");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
