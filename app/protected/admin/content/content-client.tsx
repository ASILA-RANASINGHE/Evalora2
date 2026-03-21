"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  approveContent,
  flagContent,
  updateContentVisibility,
} from "@/lib/actions/admin";
import type { AdminContentItem } from "@/lib/actions/admin";
import {
  FileText,
  ClipboardList,
  HelpCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
} from "lucide-react";

const typeIcons = {
  note: FileText,
  paper: ClipboardList,
  quiz: HelpCircle,
};

const statusStyles: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  PENDING:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  FLAGGED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  DRAFT:    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

const statusIcons: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  PENDING:  Clock,
  FLAGGED:  AlertTriangle,
  DRAFT:    Clock,
};

const visibilityStyles: Record<string, string> = {
  PUBLIC:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PRIVATE:       "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  STUDENTS_ONLY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function ContentClient({ initialItems }: { initialItems: AdminContentItem[] }) {
  const [items, setItems] = useState<AdminContentItem[]>(initialItems);
  const [filterStatus, setFilterStatus] = useState<"all" | "PENDING" | "FLAGGED" | "APPROVED">("all");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = items.filter(
    (item) => filterStatus === "all" || item.status === filterStatus
  );

  const flaggedCount  = items.filter((i) => i.status === "FLAGGED").length;
  const pendingCount  = items.filter((i) => i.status === "PENDING").length;
  const approvedCount = items.filter((i) => i.status === "APPROVED").length;

  const handleApprove = (id: string, type: AdminContentItem["type"]) => {
    startTransition(async () => {
      const result = await approveContent(id, type);
      if (result.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "APPROVED" as const } : i))
        );
      } else {
        setErrorMsg("Failed to approve content");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    });
  };

  const handleFlag = (id: string, type: AdminContentItem["type"]) => {
    startTransition(async () => {
      const result = await flagContent(id, type);
      if (result.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "FLAGGED" as const } : i))
        );
      } else {
        setErrorMsg("Failed to flag content");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    });
  };

  const handleToggleVisibility = (id: string, type: AdminContentItem["type"], current: AdminContentItem["visibility"]) => {
    const next: AdminContentItem["visibility"] = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    startTransition(async () => {
      const result = await updateContentVisibility(id, type, next);
      if (result.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, visibility: next } : i))
        );
      } else {
        setErrorMsg("Failed to update visibility");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Content Review</h2>
        <p className="text-sm text-muted-foreground">
          Review and moderate uploaded content. Adjust visibility settings.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{flaggedCount}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "FLAGGED", "PENDING", "APPROVED"] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Content list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Moderation Queue ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Content</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Subject</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Author</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Visibility</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const TypeIcon   = typeIcons[item.type];
                  const StatusIcon = statusIcons[item.status] ?? Clock;
                  return (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize hidden sm:table-cell">{item.type}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.author}</td>
                      <td className="px-4 py-3">
                        <Badge className={`gap-1 border-0 ${statusStyles[item.status] ?? ""}`}>
                          <StatusIcon className="h-3 w-3" />
                          {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge className={`border-0 ${visibilityStyles[item.visibility] ?? ""}`}>
                          {item.visibility === "STUDENTS_ONLY" ? "Students" : item.visibility.charAt(0) + item.visibility.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {item.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => handleApprove(item.id, item.type)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {item.status !== "FLAGGED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => handleFlag(item.id, item.type)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Flag"
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => handleToggleVisibility(item.id, item.type, item.visibility)}
                            title={item.visibility === "PUBLIC" ? "Make Private" : "Make Public"}
                          >
                            {item.visibility === "PUBLIC" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No content matches your filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
