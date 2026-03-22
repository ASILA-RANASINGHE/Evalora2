import { getMyProfile } from "@/lib/actions/profile";
import { SettingsClient } from "./settings-client";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/login");
  return <SettingsClient profile={profile} />;
}
