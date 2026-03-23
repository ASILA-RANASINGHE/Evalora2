import { getAdminUsers } from "@/lib/actions/admin";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const users = await getAdminUsers();
  return <UsersClient initialUsers={users} />;
}
