import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { TrendingUp, Clock, Calendar, Target, Award } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Progress</h2>
        <p className="text-muted-foreground mt-1">Track your learning journey and improvements</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Quizzes Completed" value="23" icon={Target} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Papers Attempted" value="5" icon={Calendar} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Average Score" value="76%" icon={TrendingUp} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Study Streak" value="7 Days" icon={Award} color="text-amber-600" bg="bg-amber-100" />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
            {/* Subject Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Proficiency</CardTitle>
                    <CardDescription>Based on quiz and paper performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SubjectProgress name="Mathematics" score={85} color="bg-blue-500" />
                    <SubjectProgress name="Physics" score={72} color="bg-yellow-500" />
                    <SubjectProgress name="Chemistry" score={65} color="bg-purple-500" />
                    <SubjectProgress name="Biology" score={90} color="bg-green-500" />
                    <SubjectProgress name="English" score={78} color="bg-red-500" />
                </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-end justify-between gap-2 px-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                            const heights = [40, 70, 30, 85, 50, 20, 10];
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 w-full">
                                    <div 
                                        className="w-full bg-purple-100 rounded-t-lg relative group transition-all hover:bg-purple-200"
                                        style={{ height: `${heights[i]}%` }}
                                    >
                                        <div 
                                            className="w-full absolute bottom-0 bg-purple-600 rounded-t-lg opacity-80"
                                            style={{ height: `${heights[i] * 0.7}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{day}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Learning Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <GoalItem title="Complete 5 Quizzes" current={3} total={5} />
                    <GoalItem title="Score >80% in Math" current={85} total={100} isPercentage />
                    <GoalItem title="Study 10 Hours" current={6.5} total={10} />
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
                <CardContent className="p-6 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Clock className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">12h 45m</div>
                        <div className="text-indigo-200">Total Learning Time</div>
                    </div>
                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xl font-bold">142</div>
                            <div className="text-xs text-indigo-300">Topics Mastered</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">Top 5%</div>
                            <div className="text-xs text-indigo-300">Class Rank</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
            </CardContent>
        </Card>
    )
}

function SubjectProgress({ name, score, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">{score}%</span>
            </div>
            <ProgressBar value={score} className="h-2" indicatorClassName={color} />
        </div>
    )
}

function GoalItem({ title, current, total, isPercentage }: any) {
    const progress = Math.min((current / total) * 100, 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span>{title}</span>
                <span className="text-muted-foreground">{current}/{total}{isPercentage ? '%' : ''}</span>
            </div>
            <ProgressBar value={progress} className="h-2" />
        </div>
    )
}
