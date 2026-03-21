import { getAdminContent } from "@/lib/actions/admin";
import { ContentClient } from "./content-client";

export default async function ContentReviewPage() {
  const items = await getAdminContent();
  return <ContentClient initialItems={items} />;
}
