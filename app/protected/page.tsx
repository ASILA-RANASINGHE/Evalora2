import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function ProtectedPage() {
  await connection();
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

  if (!profile) {
    redirect("/auth/login");
  }

  switch (profile.role) {
    case "STUDENT":
      redirect("/protected/student");
    case "TEACHER":
      redirect("/protected/teacher");
    case "PARENT":
      redirect("/protected/parent");
    case "ADMIN":
      redirect("/protected/admin");
    default:
      redirect("/auth/login");
  }
}
