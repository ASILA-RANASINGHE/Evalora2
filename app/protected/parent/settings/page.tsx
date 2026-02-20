"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Save,
  Check,
  Users,
  Send,
  Inbox,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchUsersDialog } from "@/components/relationships/search-users-dialog";
import { RequestsTab } from "@/components/relationships/requests-tab";
import { AcceptTab } from "@/components/relationships/accept-tab";
import { MyConnections } from "@/components/relationships/my-connections";
import { UserRole, RelationshipType } from "@/lib/generated/prisma/enums";
import { parentProfile } from "@/lib/parent-mock-data";

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

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="accept">Accept</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
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
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <MyConnections />
          <SearchUsersDialog
            targetRole={UserRole.STUDENT}
            relationshipType={RelationshipType.PARENT_STUDENT}
          />
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <RequestsTab />
        </TabsContent>

        {/* Accept Tab */}
        <TabsContent value="accept" className="space-y-6">
          <AcceptTab />
        </TabsContent>
      </Tabs>

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
