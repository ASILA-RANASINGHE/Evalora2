import { redirect } from "next/navigation";

export default function ChatRedirectPage() {
  redirect("/protected/chat/conversation");
}
