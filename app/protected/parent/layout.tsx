import { ParentShell } from "@/components/parent/parent-shell";
import { getMyProfile } from "@/lib/actions/profile";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "Parent";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "P";
  const avatarEmoji = profile?.avatarEmoji ?? null;

  return (
    <ParentShell
      displayName={fullName}
      initials={initials}
      avatarEmoji={avatarEmoji}
    >
      {children}
    </ParentShell>
  );
}
