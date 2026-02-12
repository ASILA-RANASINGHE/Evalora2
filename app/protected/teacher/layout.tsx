import { TeacherShell } from "@/components/teacher/teacher-shell";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication check skipped for UI demo
  // await requireRole("TEACHER");

  return <TeacherShell>{children}</TeacherShell>;
}
