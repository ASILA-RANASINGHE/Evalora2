"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminProfile } from "@/lib/admin-mock-data";
import {
  User,
  Mail,
  Shield,
  MapPin,
  Clock,
  Database,
  Bell,
  FileDown,
  Save,
  Check,
  Palette,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    sessionTimeout: true,
    autoBackups: true,
    usageAlerts: false,
    dataExports: true,
    moderationEnabled: true,
    autoFlagContent: false,
    requireApproval: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Account information and system configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription>Your admin profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{adminProfile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{adminProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge className="mt-0.5 border-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {adminProfile.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Region</p>
                <p className="text-sm font-medium">{adminProfile.region}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Configuration</CardTitle>
            <CardDescription>
              Manage platform behavior and automation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              icon={<Clock className="h-4 w-4" />}
              label="Session Timeout"
              description="Auto-logout after 30 minutes of inactivity"
              checked={settings.sessionTimeout}
              onChange={() => toggle("sessionTimeout")}
            />
            <ToggleRow
              icon={<Database className="h-4 w-4" />}
              label="Auto Backups"
              description="Schedule daily automatic database backups"
              checked={settings.autoBackups}
              onChange={() => toggle("autoBackups")}
            />
            <ToggleRow
              icon={<Bell className="h-4 w-4" />}
              label="Usage Alerts"
              description="Get notified when storage exceeds 80%"
              checked={settings.usageAlerts}
              onChange={() => toggle("usageAlerts")}
            />
            <ToggleRow
              icon={<FileDown className="h-4 w-4" />}
              label="Data Exports"
              description="Allow admin data export functionality"
              checked={settings.dataExports}
              onChange={() => toggle("dataExports")}
            />
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-500" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground"><Palette className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Content Moderation Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Content Moderation</CardTitle>
            <CardDescription>
              Configure how uploaded content is reviewed and published.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              icon={<Shield className="h-4 w-4" />}
              label="Enable Moderation"
              description="All uploaded content goes through a review process"
              checked={settings.moderationEnabled}
              onChange={() => toggle("moderationEnabled")}
            />
            <ToggleRow
              icon={<Bell className="h-4 w-4" />}
              label="Auto-Flag Content"
              description="Automatically flag content with potential issues"
              checked={settings.autoFlagContent}
              onChange={() => toggle("autoFlagContent")}
            />
            <ToggleRow
              icon={<Check className="h-4 w-4" />}
              label="Require Approval"
              description="Teacher uploads require admin approval before publishing"
              checked={settings.requireApproval}
              onChange={() => toggle("requireApproval")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
}
