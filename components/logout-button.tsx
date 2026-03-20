"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
  className?: string;
  iconOnly?: boolean;
}

export function LogoutButton({ variant = "ghost", size = "sm", className, iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} variant={variant} size={iconOnly ? "icon" : size} className={className}>
      <LogOut className="h-4 w-4" />
      {!iconOnly && <span className="ml-2">Logout</span>}
    </Button>
  );
}
