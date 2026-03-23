import { getMyProfile } from "@/lib/actions/profile";
import { ParentSettingsClient } from "./settings-client";
import { redirect } from "next/navigation";

export default async function ParentSettingsPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/login");
  return <ParentSettingsClient profile={profile} />;
}
