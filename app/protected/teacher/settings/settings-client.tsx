"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchUsersDialog } from "@/components/relationships/search-users-dialog";
import { RequestsTab } from "@/components/relationships/requests-tab";
import { AcceptTab } from "@/components/relationships/accept-tab";
import { MyConnections } from "@/components/relationships/my-connections";
import { UserRole, RelationshipType } from "@/lib/generated/prisma/enums";
import {
  User,
  BookOpen,
  Bell,
  Shield,
  Save,
  Check,
  Palette,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AvatarPicker } from "@/components/avatar-picker";
import { updateMyProfile } from "@/lib/actions/profile";
import { useTeacherProfile } from "@/components/teacher/teacher-shell";

const ALL_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English Language",
  "Sinhala Language", "Tamil Language", "History", "Geography",
  "Civic Education", "ICT", "Economics", "Commerce", "Business Studies",
  "Art", "Music", "Drama", "Physical Education", "Health",
  "Agriculture Science", "Buddhism", "Hinduism", "Christianity", "Islam",
];

interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarEmoji: string | null;
  teacherDetails: { subject: string; department: string | null } | null;
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function TeacherSettingsClient({ profile }: { profile: Profile }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [subject, setSubject] = useState(
    profile.teacherDetails?.subject ?? ALL_SUBJECTS[0]
  );
  const [avatar, setAvatar] = useState(profile.avatarEmoji ?? "");

  const [gradingWindow, setGradingWindow] = useState("7");
  const [autoRelease, setAutoRelease] = useState(true);
  const [parentSummaries, setParentSummaries] = useState(false);
  const [attendanceSync, setAttendanceSync] = useState(true);
  const [notifySubmissions, setNotifySubmissions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [flaggedAlerts, setFlaggedAlerts] = useState(true);
  const [parentMessages, setParentMessages] = useState(false);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setDisplayName, setAvatarEmoji: setShellAvatar } = useTeacherProfile();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMyProfile({
        firstName,
        lastName,
        avatarEmoji: avatar,
        subject,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        // Update the shell header/sidebar instantly via context
        setDisplayName(`${firstName} ${lastName}`.trim());
        setShellAvatar(avatar);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="accept">Accept</TabsTrigger>
          <TabsTrigger value="class-prefs">Class Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                Profile Information
              </CardTitle>
              <CardDescription>Your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvatarPicker value={avatar} initials={initials} onChange={setAvatar} />
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <Input id="email" value={profile.email} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value="Teacher" disabled className="opacity-60" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Primary Subject</Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <div className="px-6 pb-4 flex justify-end">
              <Button onClick={handleSave} disabled={isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                {saved ? (
                  <><Check className="h-4 w-4 mr-2" /> Saved!</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{isPending ? "Saving..." : "Save Changes"}</>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">My Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MyConnections />
              <SearchUsersDialog
                targetRole={UserRole.STUDENT}
                relationshipType={RelationshipType.TEACHER_STUDENT}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="accept">
          <AcceptTab />
        </TabsContent>

        <TabsContent value="class-prefs">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-500" />
                Class Preferences
              </CardTitle>
              <CardDescription>Configure how your classes operate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="grading">Grading Window (days)</Label>
                <Input
                  id="grading"
                  type="number"
                  min="1"
                  max="30"
                  value={gradingWindow}
                  onChange={(e) => setGradingWindow(e.target.value)}
                  className="max-w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Students can submit within this window after assignment release
                </p>
              </div>
              <div className="space-y-4">
                <ToggleRow
                  label="Auto-release Feedback"
                  description="Automatically release feedback once grading is complete"
                  checked={autoRelease}
                  onCheckedChange={setAutoRelease}
                />
                <ToggleRow
                  label="Parent Summaries"
                  description="Send weekly performance summaries to parents"
                  checked={parentSummaries}
                  onCheckedChange={setParentSummaries}
                />
                <ToggleRow
                  label="Attendance Sync"
                  description="Sync attendance data with the school system"
                  checked={attendanceSync}
                  onCheckedChange={setAttendanceSync}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-500" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Student Submissions"
                description="Get notified when students submit assignments"
                checked={notifySubmissions}
                onCheckedChange={setNotifySubmissions}
              />
              <ToggleRow
                label="Weekly Digest"
                description="Receive a weekly summary of class performance"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
              <ToggleRow
                label="Flagged Answer Alerts"
                description="Instant alerts when answers are flagged for review"
                checked={flaggedAlerts}
                onCheckedChange={setFlaggedAlerts}
              />
              <ToggleRow
                label="Parent Messages"
                description="Notifications when parents send you messages"
                checked={parentMessages}
                onCheckedChange={setParentMessages}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Managed via Supabase Auth</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">1 active session on this device</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                  Current
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
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
