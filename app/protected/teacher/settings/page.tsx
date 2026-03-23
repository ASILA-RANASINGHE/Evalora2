import { getMyProfile } from "@/lib/actions/profile";
import { TeacherSettingsClient } from "./settings-client";
import { redirect } from "next/navigation";

export default async function TeacherSettingsPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/login");
  return <TeacherSettingsClient profile={profile} />;
}
