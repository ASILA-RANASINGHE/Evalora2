"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateUserRole } from "@/lib/actions/admin";
import type { AdminUser } from "@/lib/actions/admin";
import { Search, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import type { UserRole } from "@/lib/generated/prisma/enums";

const roleBadgeStyles: Record<string, string> = {
  STUDENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  TEACHER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  PARENT:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ADMIN:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const allRoles: UserRole[] = ["STUDENT", "TEACHER", "PARENT", "ADMIN"];

export function UsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "ALL">("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setEditingUserId(null);
        setSuccessId(userId);
        setTimeout(() => setSuccessId(null), 2000);
      } else {
        setErrorMsg(result.error ?? "Failed to update role");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground">Manage all platform users and their roles.</p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={filterRole === "ALL" ? "default" : "outline"} size="sm" onClick={() => setFilterRole("ALL")}>
            All
          </Button>
          {allRoles.map((role) => (
            <Button
              key={role}
              variant={filterRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRole(role)}
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} user{filtered.length !== 1 && "s"} found
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Details</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900/30 dark:text-purple-300">
                          {(user.firstName[0] ?? user.email[0] ?? "?").toUpperCase()}
                        </div>
                        {user.firstName} {user.lastName}
                        {successId === user.id && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center flex-wrap gap-1">
                          {allRoles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(user.id, role)}
                              disabled={isPending}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                                user.role === role
                                  ? roleBadgeStyles[role]
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {role.charAt(0) + role.slice(1).toLowerCase()}
                            </button>
                          ))}
                          {isPending && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                        </div>
                      ) : (
                        <Badge className={`border-0 ${roleBadgeStyles[user.role]}`}>
                          {user.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {user.grade ? `Grade ${user.grade}` : user.subject ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.createdAt}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                      >
                        {editingUserId === user.id ? "Done" : "Change Role"}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No users match your filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
