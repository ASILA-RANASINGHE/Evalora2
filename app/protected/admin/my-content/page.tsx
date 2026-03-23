import { connection } from "next/server";
import { getMyContent } from "@/lib/actions/my-content";
import { ContentTabs } from "../../teacher/my-content/content-tabs";

export default async function AdminMyContentPage() {
  await connection();
  const content = await getMyContent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">My Content</h2>
        <p className="text-muted-foreground mt-1">
          View and manage content you&apos;ve uploaded
        </p>
      </div>
      <ContentTabs
        notes={content.notes}
        shortNotes={content.shortNotes}
        quizzes={content.quizzes}
        papers={content.papers}
      />
    </div>
  );
}
