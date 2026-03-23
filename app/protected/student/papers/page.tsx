"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
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
  ChevronRight,
  FileText,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WorkingSubject {
  name: string;
  icon: LucideIcon;
  terms: number[];
  working: true;
}
interface ComingSoonSubject {
  name: string;
  icon: LucideIcon;
  working: false;
}

type SubjectEntry = WorkingSubject | ComingSoonSubject;

const subjects: SubjectEntry[] = [
  { name: "History", icon: Landmark, terms: [1, 2, 3], working: true },
  { name: "English", icon: BookOpen, terms: [1, 2, 3], working: true },
  { name: "Geography", icon: Globe, terms: [1, 2, 3], working: true },
  { name: "Civic Education", icon: Users, terms: [1, 2, 3], working: true },
  { name: "Health", icon: Heart, terms: [1, 2, 3], working: true },
  { name: "Sinhala", icon: Languages, working: false },
  { name: "Mathematics", icon: Calculator, working: false },
  { name: "Science", icon: FlaskConical, working: false },
  { name: "Buddhism", icon: Leaf, working: false },
  { name: "ICT", icon: Monitor, working: false },
  { name: "Commerce", icon: ShoppingBag, working: false },
  { name: "PTS", icon: Wrench, working: false },
  { name: "Art", icon: Palette, working: false },
  { name: "Music", icon: Music, working: false },
  { name: "Drama", icon: Mic, working: false },
];

const workingSubjects = subjects.filter((s): s is WorkingSubject => s.working);
const comingSoonSubjects = subjects.filter((s): s is ComingSoonSubject => !s.working);

type PaperType = "past" | "model" | null;

export default function PapersPage() {
  const [selectedType, setSelectedType] = useState<PaperType>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Papers 📄</h2>
        <p className="text-muted-foreground mt-1 text-base">
          Choose a paper type, then select your subject and term.
        </p>
      </div>

      {/* Step 1: Paper type selection */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Step 1 — Select Paper Type
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <button
            type="button"
            onClick={() => setSelectedType("past")}
            className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              selectedType === "past"
                ? "border-[#4D2FB2] bg-[#4D2FB2]/8 dark:bg-[#4D2FB2]/20"
                : "border-border hover:border-[#696FC7] hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/10"
            }`}
          >
            <div className={`p-3 w-fit rounded-xl mb-3 transition-colors ${selectedType === "past" ? "bg-[#4D2FB2] text-white" : "bg-[#B7BDF7]/50 text-[#4D2FB2] group-hover:bg-[#4D2FB2] group-hover:text-white"}`}>
              <FileText className="h-6 w-6" />
            </div>
            <p className="font-bold text-lg">Past Papers</p>
            <p className="text-sm text-muted-foreground mt-1">
              Original exam papers from previous years
            </p>
            {selectedType === "past" && (
              <Badge className="mt-3 bg-[#4D2FB2] text-white border-0 text-xs">Selected ✓</Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("model")}
            className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              selectedType === "model"
                ? "border-[#4D2FB2] bg-[#4D2FB2]/8 dark:bg-[#4D2FB2]/20"
                : "border-border hover:border-[#696FC7] hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/10"
            }`}
          >
            <div className={`p-3 w-fit rounded-xl mb-3 transition-colors ${selectedType === "model" ? "bg-[#4D2FB2] text-white" : "bg-[#B7BDF7]/50 text-[#4D2FB2] group-hover:bg-[#4D2FB2] group-hover:text-white"}`}>
              <Star className="h-6 w-6" />
            </div>
            <p className="font-bold text-lg">Model Papers</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sample papers created as study reference
            </p>
            {selectedType === "model" && (
              <Badge className="mt-3 bg-[#4D2FB2] text-white border-0 text-xs">Selected ✓</Badge>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Subject selection — only shown after type is picked */}
      {selectedType && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Step 2 — Select Subject
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Browsing <span className="font-semibold text-[#4D2FB2]">{selectedType === "past" ? "Past Papers" : "Model Papers"}</span>
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workingSubjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <Card key={subject.name} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-[#696FC7] group">
                    <CardHeader className="bg-gradient-to-r from-[#4D2FB2]/8 to-[#696FC7]/8 dark:from-[#4D2FB2]/20 dark:to-[#696FC7]/20 border-b pb-4">
                      <CardTitle className="flex items-center gap-3 text-base font-bold">
                        <div className="p-2 rounded-xl bg-[#B7BDF7]/50 dark:bg-[#4D2FB2]/30 group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5 text-[#4D2FB2] dark:text-[#B7BDF7]" />
                        </div>
                        {subject.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {subject.terms.map((term) => (
                        <Link
                          key={term}
                          href={`/protected/student/papers/subject/${subject.name.toLowerCase().replace(/ /g, "-")}/term/${term}?type=${selectedType}`}
                          className="flex items-center justify-between p-3.5 rounded-xl border-2 border-border/40 hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/15 hover:border-[#696FC7] dark:hover:border-[#696FC7] transition-all group/term"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#B7BDF7]/40 dark:bg-[#4D2FB2]/20 p-2 rounded-lg group-hover/term:bg-[#4D2FB2] transition-colors">
                              <CalendarDays className="h-4 w-4 text-[#4D2FB2] group-hover/term:text-white transition-colors" />
                            </div>
                            <span className="font-bold text-sm">Term {term}</span>
                          </div>
                          <Badge className="bg-[#B7BDF7]/50 text-[#4D2FB2] hover:bg-[#B7BDF7] dark:bg-[#4D2FB2]/20 dark:text-[#B7BDF7] border-0 text-xs font-bold">
                            View Papers →
                          </Badge>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Coming soon */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">🔜 More subjects coming soon</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {comingSoonSubjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div key={subject.name} className="cursor-not-allowed">
                    <Card className="h-full border-2 border-dashed border-border/40 opacity-50 hover:opacity-60 transition-opacity">
                      <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 rounded-2xl bg-muted mt-2">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-foreground">{subject.name}</p>
                        <Badge variant="secondary" className="text-xs font-semibold">Coming Soon</Badge>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
