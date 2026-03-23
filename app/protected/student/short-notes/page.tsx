"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  BookOpen,
  Landmark,
  Heart,
  Languages,
  Calculator,
  FlaskConical,
  Leaf,
  Monitor,
  ShoppingBag,
  Wrench,
  Palette,
  Music,
  Mic,
  Users,
} from "lucide-react";

const workingSubjects = [
  { name: "History", icon: Landmark, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950/30" },
  { name: "English", icon: BookOpen, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/30" },
  { name: "Geography", icon: Globe, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-950/30" },
  { name: "Civic Education", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30" },
  { name: "Health", icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-950/30" },
];

const comingSoonSubjects = [
  { name: "Sinhala", icon: Languages, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950/30" },
  { name: "Mathematics", icon: Calculator, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30" },
  { name: "Science", icon: FlaskConical, color: "text-green-600", bg: "bg-green-100 dark:bg-green-950/30" },
  { name: "Buddhism", icon: Leaf, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/30" },
  { name: "ICT", icon: Monitor, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950/30" },
  { name: "Commerce", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950/30" },
  { name: "PTS", icon: Wrench, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800/50" },
  { name: "Art", icon: Palette, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-950/30" },
  { name: "Music", icon: Music, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-950/30" },
  { name: "Drama", icon: Mic, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-950/30" },
];

export default function ShortNotesPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight">Short Notes 🗒️</h2>
          <p className="text-[#B7BDF7] mt-1 text-sm font-medium">Select a subject to browse short notes</p>
        </div>
      </div>

      {/* Working subjects */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Available Subjects</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workingSubjects.map((subject) => (
            <Link href={`/protected/student/short-notes/subject/${subject.name.toLowerCase().replace(/ /g, "-")}`} key={subject.name}>
              <Card className="hover:shadow-lg transition-all hover:border-[#696FC7] cursor-pointer h-full group bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 border-[#B7BDF7]/40">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform`}>
                    <subject.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Browse Topics</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming soon subjects */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Coming Soon</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonSubjects.map((subject) => (
            <div key={subject.name} className="cursor-not-allowed">
              <Card className="h-full bg-card border-border/30 opacity-60">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full ${subject.bg} ${subject.color}`}>
                    <subject.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{subject.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
