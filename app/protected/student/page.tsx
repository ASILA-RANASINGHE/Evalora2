import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Trophy,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  FileText,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { InsightsPanel } from "./components/insights-panel";
import { DailyRecommendations } from "./components/daily-recommendations";
import { getStudentDashboardData } from "@/lib/actions/analytics";

export default async function StudentDashboard() {
  const data = await getStudentDashboardData();

  const stats = data?.stats ?? {
    subjectsCount: 0,
    averageScore: 0,
    totalAttempts: 0,
    studyStreak: 0,
  };
  const recentAttempts = data?.recentAttempts ?? [];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Subjects Active"
          value={String(stats.subjectsCount)}
          icon={BookOpen}
          trend={stats.subjectsCount > 0 ? "Based on your attempts" : "No attempts yet"}
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="Average Score"
          value={stats.averageScore > 0 ? `${stats.averageScore}%` : "—"}
          icon={Target}
          trend={stats.averageScore >= 75 ? "Above target" : stats.averageScore > 0 ? "Below target (75%)" : "No data yet"}
          iconColor="bg-purple-500/10 text-purple-500"
        />
        <StatsCard
          title="Attempts Done"
          value={String(stats.totalAttempts)}
          icon={Zap}
          trend={stats.totalAttempts > 0 ? "Quizzes + papers" : "Start your first quiz!"}
          iconColor="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="Study Streak"
          value={stats.studyStreak > 0 ? `${stats.studyStreak} Days` : "—"}
          icon={Trophy}
          trend={stats.studyStreak >= 7 ? "Keep it up!" : stats.studyStreak > 0 ? "Building momentum" : "Start today!"}
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Column */}
        <div className="col-span-4 space-y-6">
          {/* Recent Performance */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Recent Performance
              </CardTitle>
              <CardDescription>Your latest quiz and paper results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt, i) => (
                  <PerformanceItem
                    key={i}
                    subject={attempt.subject}
                    title={attempt.title}
                    score={attempt.score}
                    date={attempt.date}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No attempts yet. Take a quiz or paper to see your performance here.
                  </p>
                  <Link
                    href="/protected/student/quizzes"
                    className="text-xs font-semibold text-purple-600 hover:underline mt-1"
                  >
                    Browse quizzes →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links for available content */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ContinueItem
                title="Practice Quizzes"
                description="Take topic-based quizzes to sharpen your skills"
                href="/protected/student/quizzes"
              />
              <ContinueItem
                title="Exam Papers"
                description="Attempt past papers and model papers"
                href="/protected/student/papers"
              />
              <ContinueItem
                title="Study Notes"
                description="Review notes and short summaries"
                href="/protected/student/notes"
              />
            </CardContent>
          </Card>

          {/* Insights */}
          <InsightsPanel />
        </div>

        {/* Side Column */}
        <div className="col-span-3 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/protected/student/quizzes"
              className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-500/20 rounded-xl shadow-sm transition-all"
            >
              <div className="h-10 w-10 circle-center bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm text-foreground">Quick Quiz</span>
            </Link>
            <Link
              href="/protected/student/notes"
              className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 rounded-xl shadow-sm transition-all"
            >
              <div className="h-10 w-10 circle-center bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm text-foreground">Read Notes</span>
            </Link>
          </div>

          {/* Daily Practice Plan */}
          <DailyRecommendations />

          {/* Achievements */}
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="bg-muted/50 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Achievements</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-none border-0"
                >
                  {stats.studyStreak >= 7 ? "Active" : "Earn More"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-4 divide-x divide-y dark:divide-white/5 border-b dark:border-white/5">
                <AchievementIcon icon="🎯" label="Sharp" active={stats.averageScore >= 80} />
                <AchievementIcon icon="🔥" label="On Fire" active={stats.studyStreak >= 7} />
                <AchievementIcon icon="📚" label="Scholar" active={stats.totalAttempts >= 10} />
                <AchievementIcon icon="⚡" label="Flash" active={stats.totalAttempts >= 25} />
                <AchievementIcon icon="👑" label="King" active={stats.averageScore >= 90} />
                <AchievementIcon icon="💡" label="Idea" active={stats.totalAttempts >= 5} />
                <AchievementIcon icon="🚀" label="Rocket" active={stats.studyStreak >= 14} />
                <AchievementIcon icon="🌈" label="Spectrum" active={stats.subjectsCount >= 3} />
              </div>
              <div className="p-3 text-center bg-muted/20">
                <Link
                  href="/protected/student/leaderboard"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center justify-center gap-1 transition-colors"
                >
                  View Leaderboard <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  iconColor: string;
}) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow dark:text-card-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceItem({
  subject,
  title,
  score,
  date,
}: {
  subject: string;
  title: string;
  score: number;
  date: string;
}) {
  return (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
        {subject.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <div className="min-w-0">
            <span className="font-medium text-sm text-foreground block truncate">{title}</span>
            <span className="text-xs text-muted-foreground">{subject}</span>
          </div>
          <span className="text-sm font-bold text-foreground ml-2 shrink-0">{score}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
          {date}
        </p>
      </div>
    </div>
  );
}

function ContinueItem({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors group"
    >
      <div>
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}

function AchievementIcon({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <div
      title={active ? `${label} — Unlocked!` : `${label} — Locked`}
      className={`flex flex-col items-center justify-center p-4 transition-all hover:bg-muted/50 ${
        active ? "opacity-100" : "opacity-30 grayscale"
      }`}
    >
      <span className="text-2xl mb-1 transform hover:scale-110 transition-transform cursor-default">
        {icon}
      </span>
    </div>
  );
}
