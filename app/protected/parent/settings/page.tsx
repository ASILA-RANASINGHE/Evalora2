"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Users,
  Save,
  Check,
} from "lucide-react";
import { parentProfile, childAccounts } from "@/lib/parent-mock-data";

export default function ParentSettingsPage() {
  const [name, setName] = useState(parentProfile.name);
  const [email, setEmail] = useState(parentProfile.email);
  const [role] = useState(parentProfile.role);
  const [preferredContact, setPreferredContact] = useState(parentProfile.preferredContact);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and linked students</p>
      </div>

      {/* Account Information */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            Account Information
          </CardTitle>
          <CardDescription>Your personal details and contact preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              DF
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
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
              <Label>Role</Label>
              <Input value={role} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Contact</Label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Child Accounts */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Child Accounts
              </CardTitle>
              <CardDescription className="mt-1">Students linked to your parent account</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
              {childAccounts.length} linked
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {childAccounts.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${child.color} flex items-center justify-center text-white font-bold text-xs`}>
                  {child.initials}
                </div>
                <div>
                  <p className="font-medium text-sm">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.grade} &middot; {child.subjects} subjects</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                {child.status}
              </Badge>
            </div>
          ))}
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
