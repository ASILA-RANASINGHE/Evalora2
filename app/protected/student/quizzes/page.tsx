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

const subjects = [
  { name: "Mathematics", icon: Calculator, topics: 6, completed: 8, total: 12, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", hoverBorder: "hover:border-blue-400" },
  { name: "Science", icon: FlaskConical, topics: 5, completed: 5, total: 10, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", hoverBorder: "hover:border-green-400" },
  { name: "English", icon: BookOpen, topics: 4, completed: 6, total: 8, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", hoverBorder: "hover:border-red-400" },
  { name: "History", icon: Landmark, topics: 5, completed: 3, total: 10, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", hoverBorder: "hover:border-orange-400" },
  { name: "Geography", icon: Globe, topics: 4, completed: 2, total: 8, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", hoverBorder: "hover:border-teal-400" },
  { name: "ICT", icon: Monitor, topics: 5, completed: 4, total: 10, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", hoverBorder: "hover:border-purple-400" },
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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Practice Quizzes</h2>
        <p className="text-muted-foreground mt-1">Test your knowledge across different subjects and topics</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
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

      {/* Subject Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Browse by Subject
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Link href={`/protected/student/quizzes/subject/${subject.name.toLowerCase()}`} key={subject.name}>
                <Card className={`h-full border ${subject.border} ${subject.hoverBorder} hover:shadow-lg transition-all cursor-pointer group`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground">{subject.completed}/{subject.total} done</span>
                        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(subject.completed / subject.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-1">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Subject quiz &middot; {subject.topics} topic quizzes
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View quizzes <ChevronRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recommended Quizzes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Recommended For You
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((quiz) => (
            <Card key={quiz.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
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
