import { getLeaderboardData } from "@/lib/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();

  if (!data || data.entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative space-y-1">
            <h2 className="text-2xl font-black tracking-tight">Leaderboard 🏆</h2>
            <p className="text-[#B7BDF7] text-sm font-medium">See who&apos;s topping the charts!</p>
          </div>
        </div>
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No rankings yet.</p>
          <p className="text-sm mt-1">Complete quizzes and papers to earn points and appear here.</p>
          <Link href="/protected/student/quizzes" className="inline-block mt-4 px-5 py-2 bg-[#4D2FB2] text-white text-sm font-bold rounded-xl hover:bg-[#3d249a] transition-colors">
            Attempt a Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { entries, currentUserRank, currentUserPoints, firstPlacePoints, currentUserName } = data;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const pointsToFirst = Math.max(0, firstPlacePoints - currentUserPoints);

  // Podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg text-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Leaderboard 🏆</h2>
          <p className="text-[#B7BDF7] text-sm font-medium">See who&apos;s topping the charts!</p>
        </div>
      </div>

      {/* Podium */}
      {top3.length >= 1 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8 transform md:translate-y-4">
          {/* Second Place */}
          <div className="order-2 md:order-1 flex flex-col items-center justify-end">
            {top3[1] ? (
              <>
                <div className="relative">
                  <Avatar className={`h-20 w-20 border-4 ${top3[1].isCurrentUser ? "border-[#4D2FB2]" : "border-gray-300"}`}>
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">{initials(top3[1].name)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                    2ND
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="font-bold text-lg">{top3[1].name}{top3[1].isCurrentUser && " (You)"}</div>
                  <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold">{top3[1].totalPoints.toLocaleString()} pts</div>
                </div>
              </>
            ) : <div />}
          </div>

          {/* First Place */}
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative mb-2">
              <Crown className="h-10 w-10 text-yellow-500 animate-bounce" />
            </div>
            <div className="relative">
              <Avatar className={`h-28 w-28 border-4 ${top3[0].isCurrentUser ? "border-[#4D2FB2]" : "border-yellow-400"} shadow-lg shadow-yellow-200`}>
                <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">{initials(top3[0].name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-white">
                1ST
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="font-bold text-xl">{top3[0].name}{top3[0].isCurrentUser && " (You)"}</div>
              <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold text-lg">{top3[0].totalPoints.toLocaleString()} pts</div>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 flex flex-col items-center justify-end">
            {top3[2] ? (
              <>
                <div className="relative">
                  <Avatar className={`h-20 w-20 border-4 ${top3[2].isCurrentUser ? "border-[#4D2FB2]" : "border-amber-600"}`}>
                    <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">{initials(top3[2].name)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                    3RD
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="font-bold text-lg">{top3[2].name}{top3[2].isCurrentUser && " (You)"}</div>
                  <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold">{top3[2].totalPoints.toLocaleString()} pts</div>
                </div>
              </>
            ) : <div />}
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rankings</CardTitle>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {entries.map((entry) => (
              <div
                key={entry.studentId}
                className={`flex items-center justify-between p-4 px-6 hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/10 transition-colors ${
                  entry.isCurrentUser
                    ? "bg-[#B7BDF7]/20 dark:bg-[#4D2FB2]/20 hover:bg-[#B7BDF7]/30 border-l-4 border-l-[#4D2FB2]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 font-bold text-gray-500 text-center">
                    {entry.rank <= 3 ? (
                      <Medal
                        className={`h-5 w-5 mx-auto ${
                          entry.rank === 1
                            ? "text-yellow-500"
                            : entry.rank === 2
                            ? "text-gray-400"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <span>#{entry.rank}</span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="text-xs bg-gray-100">{initials(entry.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="text-xs bg-[#B7BDF7]/50 text-[#4D2FB2] dark:bg-[#4D2FB2]/30 dark:text-[#B7BDF7] px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-orange-400" />
                      {entry.studyStreak} day streak · {entry.averageScore}% avg
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-lg text-[#4D2FB2] dark:text-[#B7BDF7]">
                      {entry.totalPoints.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivational Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4D2FB2] to-[#696FC7] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          {currentUserRank === 1 ? (
            <>
              <h3 className="font-bold text-lg">You&apos;re #1! 🎉</h3>
              <p className="text-[#B7BDF7] text-sm">Keep it up and defend your top spot. Attempt more quizzes to stay ahead!</p>
            </>
          ) : currentUserName ? (
            <>
              <h3 className="font-bold text-lg">Keep it up, {currentUserName.split(" ")[0]}! 🚀</h3>
              <p className="text-[#B7BDF7] text-sm">
                You&apos;re ranked #{currentUserRank}.{" "}
                {pointsToFirst > 0
                  ? `You are only ${pointsToFirst.toLocaleString()} points away from Rank #1. Attempt a quiz to boost your score!`
                  : "Attempt a quiz to earn more points!"}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-bold text-lg">Join the rankings! 🚀</h3>
              <p className="text-[#B7BDF7] text-sm">Attempt quizzes and papers to earn points and appear on the leaderboard.</p>
            </>
          )}
        </div>
        <Link
          href="/protected/student/quizzes"
          className="relative px-6 py-2 bg-white text-[#4D2FB2] font-bold rounded-xl hover:bg-[#FFFDF1] transition-colors shadow-md whitespace-nowrap"
        >
          Attempt Quiz (+pts)
        </Link>
      </div>
    </div>
  );
}
