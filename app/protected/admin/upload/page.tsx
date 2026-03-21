import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ClipboardList, HelpCircle, StickyNote, ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function UploadHubPage() {
  await connection();
  const [noteCount, paperCount, quizCount] = await Promise.all([
    prisma.note.count(),
    prisma.paper.count(),
    prisma.quiz.count(),
  ]);

  const uploadTypes = [
    {
      title: "Notes",
      description: "Upload study notes with rich text content, attachments, and subject tagging.",
      icon: FileText,
      href: "/protected/admin/upload/notes",
      color: "from-blue-500 to-blue-700",
      count: noteCount,
    },
    {
      title: "Papers",
      description: "Upload exam papers and past papers for student practice and revision.",
      icon: ClipboardList,
      href: "/protected/admin/upload/papers",
      color: "from-emerald-500 to-emerald-700",
      count: paperCount,
    },
    {
      title: "Quizzes",
      description: "Create and upload interactive quizzes with multiple question types.",
      icon: HelpCircle,
      href: "/protected/admin/upload/quizzes",
      color: "from-amber-500 to-amber-700",
      count: quizCount,
    },
    {
      title: "Short Notes",
      description: "Create quick reference and summary cards for student revision.",
      icon: StickyNote,
      href: "/protected/admin/upload/short-notes",
      color: "from-teal-500 to-teal-700",
      count: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Upload Hub</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage educational content for the platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {uploadTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Link key={type.title} href={type.href}>
              <Card className="group relative overflow-hidden transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${type.color} text-white`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-space-grotesk text-lg">
                    {type.title}
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {type.count} uploaded
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:underline dark:text-purple-400">
                      Upload <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
