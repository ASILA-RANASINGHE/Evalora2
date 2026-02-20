"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  StickyNote,
  BrainCircuit,
  ClipboardList,
  Eye,
} from "lucide-react";

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

export function ContentTabs({
  notes,
  shortNotes,
  quizzes,
  papers,
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("notes");
  const pathname = usePathname();

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
            <Link
              key={item.id}
              href={`${basePath}/${routeMap[activeTab]}/${item.id}`}
              className="block group"
            >
              <Card className="hover:border-purple-300 transition-all hover:shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium group-hover:text-purple-700 transition-colors">
                        {item.title}
                      </p>
                      <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.subject}
                      {item.topic && ` \u00b7 ${item.topic}`}
                      {item.grade && ` \u00b7 Grade ${item.grade}`}
                      {item.questionCount != null &&
                        ` \u00b7 ${item.questionCount} questions`}
                      {item.totalMarks != null &&
                        ` \u00b7 ${item.totalMarks} marks`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={statusColors[item.status] ?? ""}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
