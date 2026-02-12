import { ParentShell } from "@/components/parent/parent-shell";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication check skipped for UI demo
  // await requireRole("PARENT");

  return <ParentShell>{children}</ParentShell>;
}
