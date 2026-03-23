import { requireRole } from "@/lib/auth/require-role";
import { AdminShell } from "@/components/admin/admin-shell";
import { getMyProfile } from "@/lib/actions/profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  const profile = await getMyProfile();
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "Admin";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "A";
  const avatarEmoji = profile?.avatarEmoji ?? null;

  return (
    <AdminShell
      adminName={fullName}
      adminInitials={initials}
      avatarEmoji={avatarEmoji}
    >
      {children}
    </AdminShell>
  );
}
