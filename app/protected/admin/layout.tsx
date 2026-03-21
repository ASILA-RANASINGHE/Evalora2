import { requireRole } from "@/lib/auth/require-role";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminProfile } from "@/lib/actions/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  const profile = await getAdminProfile();

  return (
    <AdminShell
      adminName={profile?.name ?? "Admin"}
      adminInitials={profile?.initials ?? "A"}
    >
      {children}
    </AdminShell>
  );
}
