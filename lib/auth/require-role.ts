import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/generated/prisma/enums";

export async function requireRole(allowedRole: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile || profile.role !== allowedRole) {
    redirect("/protected");
  }

  return { user, role: profile.role };
}
