import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPaperById, getIncompleteAttempt } from "@/lib/actions/paper";
import ExamInterface from "./exam-interface";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const paper = await getPaperById(id);
  if (!paper) notFound();

  // Check for an incomplete attempt to surface a resume prompt client-side
  const incompleteAttempt = await getIncompleteAttempt(id);

  return (
    <ExamInterface
      paperId={id}
      paperTitle={paper.title}
      incompleteAttempt={incompleteAttempt}
    />
  );
}
