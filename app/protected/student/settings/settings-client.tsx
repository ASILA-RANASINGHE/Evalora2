"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Inbox, Palette, Save, Send, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchUsersDialog } from "@/components/relationships/search-users-dialog";
import { RequestsTab } from "@/components/relationships/requests-tab";
import { AcceptTab } from "@/components/relationships/accept-tab";
import { MyConnections } from "@/components/relationships/my-connections";
import { UserRole, RelationshipType } from "@/lib/generated/prisma/enums";
import { AvatarPicker } from "@/components/avatar-picker";
import { updateMyProfile } from "@/lib/actions/profile";
import { useStudentProfile } from "@/app/protected/student/components/student-header";

const GRADES = ["6", "7", "8", "9", "10", "11"];

interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarEmoji: string | null;
  studentDetails: { grade: string } | null;
}

export function StudentSettingsClient({ profile }: { profile: Profile }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [grade, setGrade] = useState(profile.studentDetails?.grade ?? GRADES[0]);
  const [avatar, setAvatar] = useState(profile.avatarEmoji ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setInitials: setHeaderInitials, setAvatarEmoji: setHeaderAvatar } = useStudentProfile();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMyProfile({
        firstName,
        lastName,
        avatarEmoji: avatar,
        grade,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setHeaderInitials(initials);
        setHeaderAvatar(avatar);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight">Settings ⚙️</h2>
          <p className="text-[#B7BDF7] mt-1 text-sm font-medium">
            Manage your account preferences and learning settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="accept">Accept</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvatarPicker value={avatar} initials={initials} onChange={setAvatar} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value="Student" disabled className="opacity-60" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={isPending}>
                {saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isPending ? "Saving..." : "Save Changes"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Connections
              </CardTitle>
              <CardDescription>Manage your connections with teachers and parents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MyConnections />
              <div className="flex gap-2 pt-4">
                <SearchUsersDialog
                  targetRole={"TEACHER" as UserRole}
                  relationshipType={"TEACHER_STUDENT" as RelationshipType}
                />
                <SearchUsersDialog
                  targetRole={"PARENT" as UserRole}
                  relationshipType={"PARENT_STUDENT" as RelationshipType}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                My Requests
              </CardTitle>
              <CardDescription>View and manage your sent connection requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accept" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Accept Requests
              </CardTitle>
              <CardDescription>Review and accept incoming connection requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <AcceptTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label>Quiz Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for upcoming quiz deadlines.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label>New Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me when new notes or papers are uploaded.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label>Leaderboard Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me when my rank changes.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" /> Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode.
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
