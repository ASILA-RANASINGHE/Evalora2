import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, BrainCircuit, ChevronRight } from "lucide-react";
import Link from "next/link";

const uploadCards = [
  {
    title: "Upload Notes",
    description: "Share study materials, lecture notes, and reference documents with your students.",
    icon: FileText,
    href: "/protected/teacher/upload/notes",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10 text-blue-600",
    count: "8 notes uploaded",
  },
  {
    title: "Upload Papers",
    description: "Create exam papers with structured sections, MCQs, and essay questions.",
    icon: ClipboardList,
    href: "/protected/teacher/upload/papers",
    color: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10 text-purple-600",
    count: "3 papers uploaded",
  },
  {
    title: "Upload Quizzes",
    description: "Build interactive quizzes with multiple choice and short answer questions.",
    icon: BrainCircuit,
    href: "/protected/teacher/upload/quizzes",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10 text-amber-600",
    count: "5 quizzes uploaded",
  },
];

export default function UploadHub() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Upload Hub</h2>
        <p className="text-muted-foreground mt-1">Create and share educational content with your students</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {uploadCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all ring-1 ring-black/5 dark:ring-white/10 group-hover:ring-purple-500/20">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`p-3 rounded-xl ${card.iconBg} w-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold font-space-grotesk">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground flex-1">{card.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{card.count}</span>
                    <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                      Start <ChevronRight className="h-4 w-4" />
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
