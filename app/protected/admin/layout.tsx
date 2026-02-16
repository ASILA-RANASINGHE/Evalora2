import { requireRole } from "@/lib/auth/require-role";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  return <AdminShell>{children}</AdminShell>;
}
