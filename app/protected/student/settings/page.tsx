import { getMyProfile } from "@/lib/actions/profile";
import { StudentSettingsClient } from "./settings-client";
import { redirect } from "next/navigation";

export default async function StudentSettingsPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/login");
  return <StudentSettingsClient profile={profile} />;
}
