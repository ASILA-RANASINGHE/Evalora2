import { requireRole } from "@/lib/auth/require-role";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("TEACHER");
  return <>{children}</>;
}
