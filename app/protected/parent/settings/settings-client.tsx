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
import { User, Save, Check, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchUsersDialog } from "@/components/relationships/search-users-dialog";
import { RequestsTab } from "@/components/relationships/requests-tab";
import { AcceptTab } from "@/components/relationships/accept-tab";
import { MyConnections } from "@/components/relationships/my-connections";
import { UserRole, RelationshipType } from "@/lib/generated/prisma/enums";
import { AvatarPicker } from "@/components/avatar-picker";
import { updateMyProfile } from "@/lib/actions/profile";
import { useParentProfile } from "@/components/parent/parent-shell";

const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Other"];

interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarEmoji: string | null;
  parentDetails: { phoneNumber: string; relationship: string } | null;
}

export function ParentSettingsClient({ profile }: { profile: Profile }) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(
    profile.parentDetails?.phoneNumber ?? ""
  );
  const [relationship, setRelationship] = useState(
    profile.parentDetails?.relationship ?? RELATIONSHIPS[0]
  );
  const [avatar, setAvatar] = useState(profile.avatarEmoji ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setDisplayName, setAvatarEmoji: setShellAvatar } = useParentProfile();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateMyProfile({
        firstName,
        lastName,
        avatarEmoji: avatar,
        phoneNumber,
        relationship,
      });
      if (result?.error) {
        setError(result.error);
      } else {
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
        <p className="text-muted-foreground mt-1">Manage your account and linked students</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="accept">Accept</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal details and contact preferences</CardDescription>
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
                  <Input value="Parent" disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+94 7X XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship to Student</Label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <div className="px-6 pb-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saved ? (
                  <><Check className="h-4 w-4 mr-2" /> Saved!</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{isPending ? "Saving..." : "Save Changes"}</>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">My Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MyConnections />
              <SearchUsersDialog
                targetRole={UserRole.STUDENT}
                relationshipType={RelationshipType.PARENT_STUDENT}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="accept" className="space-y-6">
          <AcceptTab />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
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
