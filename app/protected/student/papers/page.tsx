import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
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

export default function PapersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Past Papers</h2>
        <p className="text-muted-foreground mt-1">Practice with previous term papers and exams</p>
      </div>

      {/* Working subjects */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Available Subjects</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workingSubjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card key={subject.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-muted/30 border-b pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-purple-600" />
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {subject.terms.map((term) => (
                      <Link
                        key={term}
                        href={`/protected/student/papers/subject/${subject.name.toLowerCase().replace(/ /g, "-")}/term/${term}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 dark:bg-muted p-2 rounded group-hover:bg-white dark:group-hover:bg-background text-gray-500 group-hover:text-purple-600 transition-colors">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">Term {term}</span>
                        </div>
                        <Badge variant="secondary" className="group-hover:bg-white dark:group-hover:bg-background text-xs">View Papers</Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming soon subjects */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Coming Soon</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {comingSoonSubjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div key={subject.name} className="cursor-not-allowed">
                <Card className="h-full border-border/30 opacity-55">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-full bg-muted mt-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
