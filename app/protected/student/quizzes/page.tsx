import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Target,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Play,
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  Landmark,
  Monitor,
  Languages,
  Leaf,
  ShoppingBag,
  Wrench,
  Palette,
  Music,
  Mic,
  Users,
  Heart,
} from "lucide-react";

const stats = [
  {
    title: "Quizzes Taken",
    value: "23",
    icon: BrainCircuit,
    trend: "Top 10% of class",
    iconColor: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Average Score",
    value: "76%",
    icon: Target,
    trend: "+2.4% vs last week",
    iconColor: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Time Spent",
    value: "12h 30m",
    icon: Clock,
    trend: "3h this week",
    iconColor: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Improvement",
    value: "+5.2%",
    icon: TrendingUp,
    trend: "Steady growth",
    iconColor: "bg-emerald-500/10 text-emerald-500",
  },
];

const workingSubjects = [
  { name: "History", icon: Landmark, topics: 5, completed: 3, total: 10, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", hoverBorder: "hover:border-orange-400" },
  { name: "English", icon: BookOpen, topics: 4, completed: 6, total: 8, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", hoverBorder: "hover:border-red-400" },
  { name: "Geography", icon: Globe, topics: 4, completed: 2, total: 8, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", hoverBorder: "hover:border-teal-400" },
  { name: "Civic Education", icon: Users, topics: 3, completed: 0, total: 6, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", hoverBorder: "hover:border-blue-400" },
  { name: "Health", icon: Heart, topics: 3, completed: 1, total: 6, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", hoverBorder: "hover:border-pink-400" },
];

const comingSoonSubjects = [
  { name: "Sinhala", icon: Languages, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  { name: "Mathematics", icon: Calculator, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  { name: "Science", icon: FlaskConical, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800" },
  { name: "Buddhism", icon: Leaf, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  { name: "ICT", icon: Monitor, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
  { name: "Commerce", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  { name: "PTS", icon: Wrench, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-800/30", border: "border-gray-200 dark:border-gray-700" },
  { name: "Art", icon: Palette, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800" },
  { name: "Music", icon: Music, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800" },
  { name: "Drama", icon: Mic, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
];

const recommended = [
  {
    id: 1,
    title: "Quadratic Equations Practice",
    subject: "Mathematics",
    topic: "Algebra",
    reason: "Weak area — scored 45% last attempt",
    duration: "15 min",
    reasonColor: "text-red-600 bg-red-50 dark:bg-red-950/30",
  },
  {
    id: 2,
    title: "Periodic Table Elements",
    subject: "Science",
    topic: "Chemistry",
    reason: "Not practiced in 2 weeks",
    duration: "10 min",
    reasonColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: 3,
    title: "World War II Key Events",
    subject: "History",
    topic: "Modern History",
    reason: "Upcoming paper requirement",
    duration: "20 min",
    reasonColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  },
];

export default function QuizzesPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight">Practice Quizzes ⚡</h2>
          <p className="text-[#B7BDF7] mt-1 text-sm font-medium">Test your knowledge and improve your scores. The more you practice, the better you get!</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/15 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#4D2FB2] dark:text-[#B7BDF7] bg-[#B7BDF7]/30 dark:bg-[#4D2FB2]/20 px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available Subjects */}
      <div>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#4D2FB2]" />
          Available Subjects
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workingSubjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Link href={`/protected/student/quizzes/subject/${subject.name.toLowerCase().replace(/ /g, "-")}`} key={subject.name}>
                <Card className={`h-full border-2 ${subject.border} ${subject.hoverBorder} hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl`}>
                  <CardContent className="p-6 space-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground">{subject.completed}/{subject.total} done</span>
                        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#4D2FB2] rounded-full"
                            style={{ width: `${(subject.completed / subject.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-foreground">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Subject quiz &middot; {subject.topics} topic quizzes
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#4D2FB2] dark:text-[#B7BDF7] opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Quizzes → <ChevronRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Subjects */}
      <div>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          Coming Soon
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonSubjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div key={subject.name} className="cursor-not-allowed">
                <Card className={`h-full border ${subject.border} opacity-55`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${subject.bg} ${subject.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-1">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">Not available yet</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Quizzes */}
      <div>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Recommended For You
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((quiz) => (
            <Card key={quiz.id} className="border-2 border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm hover:shadow-lg hover:border-[#696FC7] transition-all duration-300 overflow-hidden rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{quiz.subject} &middot; {quiz.topic}</p>
                </div>

                <div className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${quiz.reasonColor}`}>
                  {quiz.reason}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {quiz.duration}
                  </span>
                  <Link href={`/protected/student/quizzes/${quiz.id}`}>
                    <Button size="sm" className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
                      <Play className="h-3 w-3 mr-1" /> Start Quiz
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
