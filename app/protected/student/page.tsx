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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Welcome back! 👋</h2>
            <p className="text-[#B7BDF7] mt-1 text-sm font-medium">Keep learning — every question makes you smarter.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/protected/student/quizzes" className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold transition-colors border border-white/20">
              Quick Quiz ⚡
            </Link>
            <Link href="/protected/student/papers" className="px-4 py-2 bg-white text-[#4D2FB2] hover:bg-purple-50 rounded-xl text-sm font-bold transition-colors shadow-md">
              Past Papers 📄
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Subjects Active"
          value={String(stats.subjectsCount)}
          icon={BookOpen}
          trend={stats.subjectsCount > 0 ? "Based on your attempts" : "No attempts yet"}
          iconColor="text-white"
          gradient="bg-gradient-to-br from-[#4D2FB2] to-[#696FC7] text-white"
        />
        <StatsCard
          title="Average Score"
          value={stats.averageScore > 0 ? `${stats.averageScore}%` : "—"}
          icon={Target}
          trend={stats.averageScore >= 75 ? "Above target" : stats.averageScore > 0 ? "Below target (75%)" : "No data yet"}
          iconColor="text-white"
          gradient="bg-gradient-to-br from-[#696FC7] to-[#B7BDF7] text-[#4D2FB2]"
        />
        <StatsCard
          title="Attempts Done"
          value={String(stats.totalAttempts)}
          icon={Zap}
          trend={stats.totalAttempts > 0 ? "Quizzes + papers" : "Start your first quiz!"}
          iconColor="text-white"
          gradient="bg-gradient-to-br from-amber-400 to-orange-500 text-white"
        />
        <StatsCard
          title="Study Streak"
          value={stats.studyStreak > 0 ? `${stats.studyStreak} Days` : "—"}
          icon={Trophy}
          trend={stats.studyStreak >= 7 ? "Keep it up!" : stats.studyStreak > 0 ? "Building momentum" : "Start today!"}
          iconColor="text-white"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Column */}
        <div className="col-span-4 space-y-6">
          {/* Recent Performance */}
          <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 backdrop-blur-sm shadow-sm ring-1 ring-[#B7BDF7]/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#696FC7]" />
                Recent Performance
              </CardTitle>
              <CardDescription>See how you did in your latest quizzes and papers 📊</CardDescription>
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
                    className="text-xs font-semibold text-[#4D2FB2] hover:underline mt-1"
                  >
                    Browse quizzes →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links for available content */}
          <Card className="border-[#696FC7]/30 bg-gradient-to-br from-[#B7BDF7]/15 to-[#696FC7]/10 dark:from-[#4D2FB2]/15 dark:to-[#696FC7]/10 backdrop-blur-sm shadow-sm ring-1 ring-[#696FC7]/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#696FC7]" />
                Continue Learning
              </CardTitle>
              <CardDescription>Jump back in and keep making progress 🚀</CardDescription>
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
              className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#4D2FB2]/10 to-[#696FC7]/10 hover:from-[#4D2FB2]/20 hover:to-[#696FC7]/20 border border-[#B7BDF7]/40 rounded-xl shadow-sm transition-all"
            >
              <div className="h-10 w-10 circle-center bg-[#4D2FB2]/15 text-[#4D2FB2] dark:text-[#B7BDF7] rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm text-foreground">Quick Quiz</span>
            </Link>
            <Link
              href="/protected/student/notes"
              className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#696FC7]/10 to-[#B7BDF7]/10 hover:from-[#696FC7]/20 hover:to-[#B7BDF7]/20 border border-[#B7BDF7]/40 rounded-xl shadow-sm transition-all"
            >
              <div className="h-10 w-10 circle-center bg-[#696FC7]/15 text-[#696FC7] dark:text-[#B7BDF7] rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
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
                <CardTitle className="text-base font-bold">🏅 Your Achievements</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-[#B7BDF7]/40 text-[#4D2FB2] dark:text-[#B7BDF7] shadow-none border-0"
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
                  className="text-xs font-semibold text-[#4D2FB2] dark:text-[#B7BDF7] hover:text-[#696FC7] flex items-center justify-center gap-1 transition-colors"
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
  gradient,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  iconColor: string;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${gradient} border border-white/20`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-sm ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs font-semibold bg-white/25 px-2.5 py-1 rounded-full text-inherit opacity-90 max-w-[130px] text-right leading-tight">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-black tracking-tight">{value}</div>
      <p className="text-sm font-semibold mt-1 opacity-80">{title}</p>
    </div>
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
      className="flex items-center justify-between p-4 rounded-xl border-2 border-border/40 hover:border-[#696FC7] dark:hover:border-[#696FC7] bg-card hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/10 transition-all duration-200 group shadow-sm hover:shadow-md"
    >
      <div>
        <h4 className="font-bold text-sm text-foreground group-hover:text-[#4D2FB2] dark:group-hover:text-[#B7BDF7] transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-[#B7BDF7]/30 dark:bg-[#4D2FB2]/20 flex items-center justify-center group-hover:bg-[#4D2FB2] group-hover:text-white transition-all">
        <ChevronRight className="h-4 w-4 text-[#696FC7] group-hover:text-white transition-colors" />
      </div>
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
      title={active ? `${label} — Unlocked! 🎉` : `${label} — Keep going to unlock!`}
      className={`flex flex-col items-center justify-center p-3 gap-1 transition-all hover:bg-muted/50 ${
        active ? "opacity-100" : "opacity-25 grayscale"
      }`}
    >
      <span className={`text-3xl transform transition-transform cursor-default ${active ? "hover:scale-125 drop-shadow-sm" : ""}`}>
        {icon}
      </span>
      <span className={`text-[10px] font-bold ${active ? "text-[#4D2FB2] dark:text-[#B7BDF7]" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}
