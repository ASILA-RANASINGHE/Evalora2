import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account preferences and learning settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-20 w-20 rounded-full bg-purple-200 flex items-center justify-center text-2xl font-bold text-purple-700">JD</div>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="student@evalora.com" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade / Class</Label>
                            <Input id="grade" defaultValue="Grade 10 - Section A" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue="Student" disabled />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label>Quiz Reminders</Label>
                            <p className="text-sm text-muted-foreground">Receive alerts for upcoming quiz deadlines.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label>New Content</Label>
                            <p className="text-sm text-muted-foreground">Notify me when new notes or papers are uploaded.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label>Leaderboard Updates</Label>
                            <p className="text-sm text-muted-foreground">Notify me when my rank changes.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button variant="outline">Reset to Defaults</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize the look and feel of the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center gap-2 cursor-pointer border-2 border-purple-500 rounded-lg p-2 bg-gray-50">
                                <div className="h-10 w-full bg-white border rounded"></div>
                                <span className="text-sm font-medium">Light</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer border rounded-lg p-2 hover:bg-gray-50">
                                <div className="h-10 w-full bg-slate-950 border rounded"></div>
                                <span className="text-sm font-medium">Dark</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer border rounded-lg p-2 hover:bg-gray-50">
                                <div className="h-10 w-full bg-gradient-to-r from-gray-200 to-slate-800 border rounded"></div>
                                <span className="text-sm font-medium">System</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
