import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Zap, 
  Target, 
  Clock, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  FileText
} from "lucide-react";
import Link from "next/link";
import { InsightsPanel } from "./components/insights-panel";
import { DailyRecommendations } from "./components/daily-recommendations";

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Subjects Enrolled" 
          value="5" 
          icon={BookOpen} 
          trend="+1 this term"
          color="from-blue-500 to-cyan-500"
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <StatsCard 
          title="Average Score" 
          value="76%" 
          icon={Target} 
          trend="+2.4% vs last week"
          color="from-purple-500 to-pink-500"
          iconColor="bg-purple-500/10 text-purple-500"
        />
        <StatsCard 
          title="Quizzes Done" 
          value="23" 
          icon={Zap} 
          trend="Top 10% of class"
          color="from-amber-500 to-orange-500"
          iconColor="bg-amber-500/10 text-amber-500"
        />
        <StatsCard 
          title="Current Streak" 
          value="7 Days" 
          icon={Trophy} 
          trend="Personal Best!"
          color="from-emerald-500 to-green-500"
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
              <PerformanceItem subject="Mathematics" score={85} date="Yesterday" />
              <PerformanceItem subject="Physics" score={72} date="2 days ago" />
              <PerformanceItem subject="English Lit" score={92} date="3 days ago" />
              <PerformanceItem subject="History" score={68} date="Last week" />
            </CardContent>
          </Card>

          {/* Upcoming Quizzes */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Due Soon
              </CardTitle>
              <CardDescription>Upcoming assessments you need to take</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <QuizItem 
                title="Calculus Integration" 
                subject="Math" 
                due="Tomorrow, 10:00 AM" 
                difficulty="Hard"
              />
              <QuizItem 
                title="Molecular Biography" 
                subject="Biology" 
                due="Fri, 2:00 PM" 
                difficulty="Medium"
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
            <Link href="/protected/student/quizzes" className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-500/20 rounded-xl shadow-sm transition-all">
              <div className="h-10 w-10 circle-center bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm text-foreground">Quick Quiz</span>
            </Link>
            <Link href="/protected/student/notes" className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 rounded-xl shadow-sm transition-all">
              <div className="h-10 w-10 circle-center bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-full mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm text-foreground">Read Notes</span>
            </Link>
          </div>

          {/* Daily Practice Plan */}
          <DailyRecommendations />

          {/*  Achievements */}
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="bg-muted/50 border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Achievements</CardTitle>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-none border-0">3 New</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-4 divide-x divide-y dark:divide-white/5 border-b dark:border-white/5">
                <AchievementIcon icon="🎯" label="Sharp" active />
                <AchievementIcon icon="🔥" label="On Fire" active />
                <AchievementIcon icon="📚" label="Worm" active />
                <AchievementIcon icon="⚡" label="Flash" />
                <AchievementIcon icon="👑" label="King" />
                <AchievementIcon icon="💡" label="Idea" />
                <AchievementIcon icon="🚀" label="Rocket" active />
                <AchievementIcon icon="🌈" label="Spectrum" />
              </div>
              <div className="p-3 text-center bg-muted/20">
                <Link href="/protected/student/leaderboard" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center justify-center gap-1 transition-colors">
                  View All Badges <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, color, iconColor }: any) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow dark:text-card-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceItem({ subject, score, date }: any) {
  return (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {subject.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="font-medium text-sm text-foreground">{subject}</span>
          <span className="text-sm font-bold text-foreground">{score}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{date}</p>
      </div>
    </div>
  );
}

function QuizItem({ title, subject, due, difficulty }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-purple-500"></div>
        <div>
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{subject} • Due {due}</p>
        </div>
      </div>
      <Badge variant="outline" className={
        difficulty === 'Hard' ? 'text-red-500 border-red-500/20 bg-red-500/10' : 
        difficulty === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
        'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
      }>
        {difficulty}
      </Badge>
    </div>
  );
}

function AchievementIcon({ icon, label, active }: any) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 transition-all hover:bg-muted/50 ${active ? 'opacity-100' : 'opacity-30 grayscale'}`}>
      <span className="text-2xl mb-1 transform hover:scale-110 transition-transform cursor-default">{icon}</span>
    </div>
  );
}
