import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
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
  AlertCircle,
  Star,
  Minus,
} from "lucide-react";
import { getQuizDashboardData } from "@/lib/actions/quiz";
import type { QuizSubjectCard } from "@/lib/actions/quiz";

// ── Subject icon & colour map ─────────────────────────────────────────────────
const SUBJECT_STYLES: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; hoverBorder: string }
> = {
  history:       { icon: Landmark,  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800",   hoverBorder: "hover:border-orange-400" },
  english:       { icon: BookOpen,  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800",         hoverBorder: "hover:border-red-400" },
  geography:     { icon: Globe,     color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-950/30",       border: "border-teal-200 dark:border-teal-800",       hoverBorder: "hover:border-teal-400" },
  "civic education": { icon: Users, color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800",       hoverBorder: "hover:border-blue-400" },
  civics:        { icon: Users,     color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800",       hoverBorder: "hover:border-blue-400" },
  health:        { icon: Heart,     color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-950/30",       border: "border-pink-200 dark:border-pink-800",       hoverBorder: "hover:border-pink-400" },
  mathematics:   { icon: Calculator,color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800",       hoverBorder: "hover:border-blue-400" },
  science:       { icon: FlaskConical,color:"text-green-600", bg: "bg-green-50 dark:bg-green-950/30",     border: "border-green-200 dark:border-green-800",     hoverBorder: "hover:border-green-400" },
  sinhala:       { icon: Languages, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30",   border: "border-yellow-200 dark:border-yellow-800",   hoverBorder: "hover:border-yellow-400" },
  ict:           { icon: Monitor,   color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30",   border: "border-purple-200 dark:border-purple-800",   hoverBorder: "hover:border-purple-400" },
  commerce:      { icon: ShoppingBag,color:"text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", hoverBorder: "hover:border-emerald-400" },
  pts:           { icon: Wrench,    color: "text-gray-600",   bg: "bg-gray-50 dark:bg-gray-800/30",       border: "border-gray-200 dark:border-gray-700",       hoverBorder: "hover:border-gray-400" },
  art:           { icon: Palette,   color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-800",       hoverBorder: "hover:border-rose-400" },
  music:         { icon: Music,     color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30",   border: "border-indigo-200 dark:border-indigo-800",   hoverBorder: "hover:border-indigo-400" },
  drama:         { icon: Mic,       color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200 dark:border-violet-800",   hoverBorder: "hover:border-violet-400" },
  buddhism:      { icon: Leaf,      color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     hoverBorder: "hover:border-amber-400" },
};

const DEFAULT_STYLE = {
  icon: BrainCircuit,
  color: "text-purple-600",
  bg: "bg-purple-50 dark:bg-purple-950/30",
  border: "border-purple-200 dark:border-purple-800",
  hoverBorder: "hover:border-purple-400",
};

function getSubjectStyle(name: string) {
  return SUBJECT_STYLES[name.toLowerCase()] ?? DEFAULT_STYLE;
}

// ── Reason colour map ─────────────────────────────────────────────────────────
const REASON_STYLES: Record<string, string> = {
  weak:             "text-red-600 bg-red-50 dark:bg-red-950/30",
  stale:            "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  new:              "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  practice_assigned:"text-purple-600 bg-purple-50 dark:bg-purple-950/30",
};

// ── Subject Card ──────────────────────────────────────────────────────────────
function SubjectCard({ subject }: { subject: QuizSubjectCard }) {
  const style = getSubjectStyle(subject.subjectName);
  const Icon = style.icon;
  const pct = subject.totalQuizzes > 0 ? (subject.completedQuizzes / subject.totalQuizzes) * 100 : 0;

  return (
    <Link href={`/protected/student/quizzes/subject/${subject.slug}`}>
      <Card className={`h-full border-2 ${style.border} ${style.hoverBorder} hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl`}>
        <CardContent className="p-6 space-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${style.bg} ${style.color} group-hover:scale-110 transition-transform`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-muted-foreground">
                {subject.completedQuizzes}/{subject.totalQuizzes} done
              </span>
              <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#4D2FB2] rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
          <h4 className="text-xl font-black text-foreground">{subject.subjectName}</h4>
          <p className="text-sm text-muted-foreground">
            {subject.topicCount} topic{subject.topicCount !== 1 ? "s" : ""} &middot; {subject.totalQuizzes} quiz{subject.totalQuizzes !== 1 ? "zes" : ""}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#4D2FB2] dark:text-[#B7BDF7] opacity-0 group-hover:opacity-100 transition-opacity">
            Start Quizzes <ChevronRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function QuizzesPage() {
  const data = await getQuizDashboardData();

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const { stats, availableSubjects, comingSoonSubjects, recommended } = data;

  const timeLabel =
    stats.timeSpentHours > 0
      ? `${stats.timeSpentHours}h ${stats.timeSpentMins}m`
      : `${stats.timeSpentMins}m`;

  const weekTimeLabel =
    stats.timeThisWeekMin >= 60
      ? `${Math.floor(stats.timeThisWeekMin / 60)}h ${stats.timeThisWeekMin % 60}m this week`
      : `${stats.timeThisWeekMin}m this week`;

  const improvementPositive = stats.improvement >= 0;

  const statCards = [
    {
      title: "Quizzes Taken",
      value: stats.quizzesTaken.toString(),
      icon: BrainCircuit,
      trend: stats.percentileLabel,
      iconColor: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Average Score",
      value: stats.quizzesTaken > 0 ? `${stats.avgScore}%` : "—",
      icon: Target,
      trend: stats.quizzesTaken > 0 ? `${stats.avgScore >= 75 ? "Above" : "Below"} class target` : "No attempts yet",
      iconColor: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Time Spent",
      value: stats.quizzesTaken > 0 ? timeLabel : "—",
      icon: Clock,
      trend: stats.timeThisWeekMin > 0 ? weekTimeLabel : "No activity this week",
      iconColor: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Improvement",
      value:
        stats.improvement === 0
          ? "—"
          : `${improvementPositive ? "+" : ""}${stats.improvement}%`,
      icon: improvementPositive ? TrendingUp : TrendingDown,
      trend:
        stats.improvement === 0
          ? "Keep attempting to track trends"
          : improvementPositive
          ? "Steady growth"
          : "Room to improve",
      iconColor: improvementPositive
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-red-500/10 text-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight">Practice Quizzes ⚡</h2>
          <p className="text-[#B7BDF7] mt-1 text-sm font-medium">
            Test your knowledge and improve your scores. The more you practice, the better you get!
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/15 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#4D2FB2] dark:text-[#B7BDF7] bg-[#B7BDF7]/30 dark:bg-[#4D2FB2]/20 px-2 py-0.5 rounded-full text-right max-w-[120px] leading-tight">
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
      {availableSubjects.length > 0 && (
        <div>
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#4D2FB2]" />
            Available Subjects
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableSubjects.map((subject) => (
              <SubjectCard key={subject.subjectName} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {/* No quizzes at all */}
      {availableSubjects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#B7BDF7]/60 p-12 text-center">
          <BrainCircuit className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No quizzes available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later — your teachers and Evalora will add quizzes soon!
          </p>
        </div>
      )}

      {/* Recommended Quizzes */}
      {recommended.length > 0 && (
        <div>
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Recommended For You
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {recommended.map((quiz) => {
              const style = getSubjectStyle(quiz.subject);
              const Icon = style.icon;
              return (
                <Card key={quiz.id} className="border-2 border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm hover:shadow-lg hover:border-[#696FC7] transition-all duration-300 overflow-hidden rounded-2xl">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${style.bg} ${style.color} shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground leading-tight">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{quiz.subject} &middot; {quiz.topic}</p>
                      </div>
                    </div>

                    <div className={`text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${REASON_STYLES[quiz.reasonType]}`}>
                      {quiz.reasonType === "weak" && <AlertCircle className="h-3 w-3 shrink-0" />}
                      {quiz.reasonType === "stale" && <Clock className="h-3 w-3 shrink-0" />}
                      {quiz.reasonType === "new" && <Star className="h-3 w-3 shrink-0" />}
                      {quiz.reasonType === "practice_assigned" && <Sparkles className="h-3 w-3 shrink-0" />}
                      {quiz.reason}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {quiz.duration} min
                      </span>
                      <Link href={`/protected/student/quizzes/${quiz.id}`}>
                        <Button size="sm" className="bg-[#4D2FB2] hover:bg-[#696FC7] text-white">
                          <Play className="h-3 w-3 mr-1" /> Start Quiz
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      {comingSoonSubjects.length > 0 && (
        <div>
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Coming Soon
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoonSubjects.map((name) => {
              const style = getSubjectStyle(name);
              const Icon = style.icon;
              return (
                <div key={name} className="cursor-not-allowed">
                  <Card className={`h-full border ${style.border} opacity-55`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-1">{name}</h4>
                      <p className="text-sm text-muted-foreground">Not available yet</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
