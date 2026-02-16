"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, RefreshCw } from "lucide-react";
import {
  getIncomingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  type RelationshipRequestData,
} from "@/lib/actions/relationships";

export function AcceptTab() {
  const [requests, setRequests] = useState<RelationshipRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getIncomingRequests();
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

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await acceptConnectionRequest(requestId);
      if (result.success) {
        await loadRequests();
      } else {
        alert(result.error || "Failed to accept request");
      }
    } catch (error) {
      console.error("Accept error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await rejectConnectionRequest(requestId);
      if (result.success) {
        await loadRequests();
      } else {
        alert(result.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pendingRequests.length} pending{" "}
          {pendingRequests.length === 1 ? "request" : "requests"}
        </p>
        <Button variant="outline" size="sm" onClick={loadRequests}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <Card
              key={request.id}
              className="border-purple-200 dark:border-purple-800"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {request.requester.firstName}{" "}
                      {request.requester.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.requester.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role: {request.requester.role.toLowerCase()}
                    </p>
                    {request.requester.grade && (
                      <p className="text-xs text-muted-foreground">
                        Grade: {request.requester.grade}
                      </p>
                    )}
                    {request.requester.subject && (
                      <p className="text-xs text-muted-foreground">
                        Subject: {request.requester.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested:{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {processedRequests.length > 0 && (
        <>
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Processed Requests</h3>
          </div>
          <div className="space-y-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-70">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {request.requester.firstName}{" "}
                        {request.requester.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.requester.email}
                      </p>
                    </div>
                    <Badge
                      className={`border-0 ${
                        request.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {request.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
