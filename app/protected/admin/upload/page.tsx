"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ClipboardList, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const uploadTypes = [
  {
    title: "Notes",
    description: "Upload study notes with rich text content, attachments, and subject tagging.",
    icon: FileText,
    href: "/protected/admin/upload/notes",
    color: "from-blue-500 to-blue-700",
    count: 342,
  },
  {
    title: "Papers",
    description: "Upload exam papers and past papers for student practice and revision.",
    icon: ClipboardList,
    href: "/protected/admin/upload/papers",
    color: "from-emerald-500 to-emerald-700",
    count: 128,
    comingSoon: true,
  },
  {
    title: "Quizzes",
    description: "Create and upload interactive quizzes with multiple question types.",
    icon: HelpCircle,
    href: "/protected/admin/upload/quizzes",
    color: "from-amber-500 to-amber-700",
    count: 215,
  },
];

export default function UploadHubPage() {
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
          const Wrapper = type.comingSoon ? "div" : Link;
          const wrapperProps = type.comingSoon ? {} : { href: type.href };

          return (
            <Wrapper key={type.title} {...(wrapperProps as any)}>
              <Card className={`group relative overflow-hidden transition-shadow ${type.comingSoon ? "opacity-70" : "cursor-pointer hover:shadow-lg"}`}>
                {type.comingSoon && (
                  <div className="absolute right-3 top-3 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </div>
                )}
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
                    {!type.comingSoon && (
                      <span className="flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:underline dark:text-purple-400">
                        Upload <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
