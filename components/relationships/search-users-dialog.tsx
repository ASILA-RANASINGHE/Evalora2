"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, Loader2, X } from "lucide-react";
import {
  searchUsers,
  sendConnectionRequest,
  type UserSearchResult,
} from "@/lib/actions/relationships";
import type { UserRole, RelationshipType } from "@/lib/generated/prisma/enums";

interface SearchUsersDialogProps {
  targetRole: UserRole;
  relationshipType: RelationshipType;
  onRequestSent?: () => void;
}

const roleLabels: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

export function SearchUsersDialog({
  targetRole,
  relationshipType,
  onRequestSent,
}: SearchUsersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const label = roleLabels[targetRole] || targetRole;

  const handleSearch = async () => {
    if (query.length < 2) return;
    setIsSearching(true);
    try {
      const data = await searchUsers(query, targetRole);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setShowConfirmation(true);
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    setIsSending(true);
    try {
      const result = await sendConnectionRequest(
        selectedUser.id,
        relationshipType
      );
      if (result.success) {
        setShowConfirmation(false);
        setSelectedUser(null);
        setQuery("");
        setResults([]);
        setIsOpen(false);
        onRequestSent?.();
      } else {
        alert(result.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Send request error:", error);
      alert("Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedUser(null);
    setShowConfirmation(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Connect with {label}
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-space-grotesk">
                  Find {label}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  autoFocus
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || query.length < 2}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {results.length === 0 && !isSearching && (
                <p className="text-center text-muted-foreground py-8">
                  Search for {label.toLowerCase()}s to connect with
                </p>
              )}
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              )}
              {results.map((user) => (
                <Card
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {user.grade && (
                          <p className="text-xs text-muted-foreground">
                            Grade: {user.grade}
                          </p>
                        )}
                        {user.subject && (
                          <p className="text-xs text-muted-foreground">
                            Subject: {user.subject}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {user.connectionStatus === "connected" && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                            Connected
                          </Badge>
                        )}
                        {user.connectionStatus === "pending" && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                            {user.requestDirection === "sent"
                              ? "Request Sent"
                              : "Pending"}
                          </Badge>
                        )}
                        {user.canConnect && (
                          <Button
                            size="sm"
                            onClick={() => handleSelectUser(user)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                        {!user.canConnect &&
                          user.connectionStatus === "none" && (
                            <Badge variant="secondary">Cannot Connect</Badge>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <Card className="max-w-md w-full shadow-xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold font-space-grotesk">
                Confirm Connection Request
              </h3>
              <p className="text-sm text-muted-foreground">
                Send a connection request to:
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
                {selectedUser.grade && (
                  <p className="text-xs mt-1">Grade: {selectedUser.grade}</p>
                )}
                {selectedUser.subject && (
                  <p className="text-xs mt-1">
                    Subject: {selectedUser.subject}
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={isSending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
