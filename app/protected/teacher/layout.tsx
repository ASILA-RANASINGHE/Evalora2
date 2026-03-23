import { TeacherShell } from "@/components/teacher/teacher-shell";
import { getMyProfile } from "@/lib/actions/profile";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "Teacher";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "T";
  const avatarEmoji = profile?.avatarEmoji ?? null;

  return (
    <TeacherShell
      displayName={fullName}
      initials={initials}
      avatarEmoji={avatarEmoji}
    >
      {children}
    </TeacherShell>
  );
}
