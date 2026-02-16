"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockUsers, type MockUser, type UserRole } from "@/lib/admin-mock-data";
import { Search, ChevronDown } from "lucide-react";

const roleBadgeStyles: Record<UserRole, string> = {
  STUDENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  TEACHER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  PARENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const allRoles: UserRole[] = ["STUDENT", "TEACHER", "PARENT", "ADMIN"];

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "ALL">("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setEditingUserId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage all platform users and their roles.
        </p>
      </div>

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
        <div className="flex gap-2">
          <Button
            variant={filterRole === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRole("ALL")}
          >
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
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-1">
                          {allRoles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(user.id, role)}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                user.role === role
                                  ? roleBadgeStyles[role]
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {role.charAt(0) + role.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Badge
                          className={`border-0 ${roleBadgeStyles[user.role]}`}
                        >
                          {user.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          user.status === "active"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingUserId(
                            editingUserId === user.id ? null : user.id
                          )
                        }
                      >
                        {editingUserId === user.id ? "Done" : "Change Role"}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
