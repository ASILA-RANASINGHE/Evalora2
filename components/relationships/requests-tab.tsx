"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, RefreshCw } from "lucide-react";
import {
  getOutgoingRequests,
  cancelConnectionRequest,
  type RelationshipRequestData,
} from "@/lib/actions/relationships";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function RequestsTab() {
  const [requests, setRequests] = useState<RelationshipRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getOutgoingRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      const result = await cancelConnectionRequest(requestId);
      if (result.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        alert(result.error || "Failed to cancel request");
      }
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {requests.length} outgoing{" "}
          {requests.length === 1 ? "request" : "requests"}
        </p>
        <Button variant="outline" size="sm" onClick={loadRequests}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No outgoing requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {request.receiver.firstName} {request.receiver.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.receiver.email}
                    </p>
                    {request.receiver.grade && (
                      <p className="text-xs text-muted-foreground">
                        Grade: {request.receiver.grade}
                      </p>
                    )}
                    {request.receiver.subject && (
                      <p className="text-xs text-muted-foreground">
                        Subject: {request.receiver.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent:{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`border-0 ${statusStyles[request.status] || ""}`}>
                      {request.status.toLowerCase()}
                    </Badge>
                    {request.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(request.id)}
                        disabled={cancellingId === request.id}
                      >
                        {cancellingId === request.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
