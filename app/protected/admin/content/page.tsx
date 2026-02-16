"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockContent, type ContentItem } from "@/lib/admin-mock-data";
import {
  FileText,
  ClipboardList,
  HelpCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

const typeIcons = {
  note: FileText,
  paper: ClipboardList,
  quiz: HelpCircle,
};

const statusStyles = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  flagged: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const statusIcons = {
  approved: CheckCircle2,
  pending: Clock,
  flagged: AlertTriangle,
};

const visibilityStyles = {
  public: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  private: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function ContentReviewPage() {
  const [items, setItems] = useState<ContentItem[]>(mockContent);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "flagged" | "approved">("all");

  const filtered = items.filter(
    (item) => filterStatus === "all" || item.status === filterStatus
  );

  const flaggedCount = items.filter((i) => i.status === "flagged").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "approved" as const } : i))
    );
  };

  const toggleVisibility = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, visibility: i.visibility === "public" ? "private" : "public" }
          : i
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">
          Content Review
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and moderate uploaded content. Adjust visibility settings.
        </p>
      </div>

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
              <p className="text-2xl font-bold">
                {items.filter((i) => i.status === "approved").length}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "flagged", "pending", "approved"] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Subject</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Visibility</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const TypeIcon = typeIcons[item.type];
                  const StatusIcon = statusIcons[item.status];
                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{item.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.subject}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.author}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`gap-1 border-0 ${statusStyles[item.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`border-0 ${visibilityStyles[item.visibility]}`}>
                          {item.visibility}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {item.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(item.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleVisibility(item.id)}
                          >
                            {item.visibility === "public" ? (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
