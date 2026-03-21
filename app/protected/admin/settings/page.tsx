import { getAdminProfile } from "@/lib/actions/admin";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const profile = await getAdminProfile();

  return (
    <SettingsClient
      name={profile?.name ?? "Admin"}
      email={profile?.email ?? ""}
      role={profile?.role ?? "ADMIN"}
      department={profile?.department ?? null}
    />
  );
}
