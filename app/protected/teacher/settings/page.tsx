"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  User,
  BookOpen,
  Bell,
  Shield,
  Save,
  Check,
} from "lucide-react";
import { teacherProfile, subjects } from "@/lib/teacher-mock-data";

export default function SettingsPage() {
  const [name, setName] = useState(teacherProfile.name);
  const [email, setEmail] = useState(teacherProfile.email);
  const [role, setRole] = useState(teacherProfile.role);
  const [primarySubject, setPrimarySubject] = useState(teacherProfile.primarySubject);

  const [gradingWindow, setGradingWindow] = useState("7");
  const [autoRelease, setAutoRelease] = useState(true);
  const [parentSummaries, setParentSummaries] = useState(false);
  const [attendanceSync, setAttendanceSync] = useState(true);

  const [notifySubmissions, setNotifySubmissions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [flaggedAlerts, setFlaggedAlerts] = useState(true);
  const [parentMessages, setParentMessages] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            Profile Information
          </CardTitle>
          <CardDescription>Your personal and professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              SJ
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Primary Subject</Label>
              <select
                value={primarySubject}
                onChange={(e) => setPrimarySubject(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Preferences */}
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
            <p className="text-xs text-muted-foreground">Students can submit within this window after assignment release</p>
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

      {/* Notifications */}
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

      {/* Security */}
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
              <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
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

      {/* Save Button */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white min-w-32">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
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
  onCheckedChange: (checked: boolean) => void;
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
