import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
    const topUsers = [
        { id: "u2", name: "Sarah Connor", points: 2850, rank: 1, avatar: "SC", trend: "up" },
        { id: "u3", name: "John Doe", points: 2720, rank: 2, avatar: "JD", isCurrentUser: true, trend: "same" },
        { id: "u4", name: "Emily Watson", points: 2680, rank: 3, avatar: "EW", trend: "down" },
        { id: "u5", name: "Michael Chang", points: 2540, rank: 4, avatar: "MC", trend: "up" },
        { id: "u6", name: "Lisa Wong", points: 2310, rank: 5, avatar: "LW", trend: "up" },
        { id: "u7", name: "David Miller", points: 2100, rank: 6, avatar: "DM", trend: "down" },
        { id: "u8", name: "James Smith", points: 1950, rank: 7, avatar: "JS", trend: "same" },
        { id: "u9", name: "Anna Bell", points: 1840, rank: 8, avatar: "AB", trend: "up" },
        { id: "u10", name: "Tom Holland", points: 1720, rank: 9, avatar: "TH", trend: "down" },
        { id: "u11", name: "Chris Evans", points: 1650, rank: 10, avatar: "CE", trend: "same" },
    ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4D2FB2] via-[#696FC7] to-[#B7BDF7] p-6 text-white shadow-lg text-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Leaderboard 🏆</h2>
          <p className="text-[#B7BDF7] text-sm font-medium">See who&apos;s topping the charts this week!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8 transform md:translate-y-4">
        {/* Second Place */}
        <div className="order-2 md:order-1 flex flex-col items-center justify-end">
            <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-gray-300">
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">JD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                    2ND
                </div>
            </div>
            <div className="text-center mt-4">
                <div className="font-bold text-lg">John Doe (You)</div>
                <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold">2720 pts</div>
            </div>
        </div>

        {/* First Place */}
        <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative mb-2">
                <Crown className="h-10 w-10 text-yellow-500 animate-bounce" />
            </div>
            <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-yellow-400 shadow-lg shadow-yellow-200">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">SC</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-white">
                    1ST
                </div>
            </div>
            <div className="text-center mt-4">
                <div className="font-bold text-xl">Sarah Connor</div>
                <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold text-lg">2850 pts</div>
            </div>
        </div>

        {/* Third Place */}
        <div className="order-3 flex flex-col items-center justify-end">
             <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-amber-600">
                    <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">EW</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                    3RD
                </div>
            </div>
            <div className="text-center mt-4">
                <div className="font-bold text-lg">Emily Watson</div>
                <div className="text-[#4D2FB2] dark:text-[#B7BDF7] font-bold">2680 pts</div>
            </div>
        </div>
      </div>

      <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5 shadow-sm">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Rankings</CardTitle>
                <Tabs defaultValue="week">
                    <TabsList>
                        <TabsTrigger value="week">Weekly</TabsTrigger>
                        <TabsTrigger value="month">Monthly</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="divide-y">
                {topUsers.map((user, img) => (
                    <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-4 px-6 hover:bg-[#FFFDF1] dark:hover:bg-[#4D2FB2]/10 transition-colors ${user.isCurrentUser ? 'bg-[#B7BDF7]/20 dark:bg-[#4D2FB2]/20 hover:bg-[#B7BDF7]/30 border-l-4 border-l-[#4D2FB2]' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 font-bold text-gray-500 text-center">
                                {user.rank <= 3 ? (
                                    <Medal className={`h-5 w-5 mx-auto ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                                ) : (
                                    <span>#{user.rank}</span>
                                )}
                            </div>
                            <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="text-xs bg-gray-100">{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-gray-800 flex items-center gap-2">
                                    {user.name} {user.isCurrentUser && <span className="text-xs bg-[#B7BDF7]/50 text-[#4D2FB2] dark:bg-[#4D2FB2]/30 dark:text-[#B7BDF7] px-2 py-0.5 rounded-full">You</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">Level 12 Scholar</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-lg text-[#4D2FB2] dark:text-[#B7BDF7]">{user.points}</span>
                                <span className="text-xs text-muted-foreground">Points</span>
                            </div>
                             {user.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                             {user.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />}
                             {user.trend === 'same' && <div className="w-4" />}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
      
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4D2FB2] to-[#696FC7] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
            <h3 className="font-bold text-lg">Keep it up, John! 🚀</h3>
            <p className="text-[#B7BDF7] text-sm">You are only 130 points away from Rank #1. Take a quiz now to boost your score.</p>
        </div>
        <button className="relative px-6 py-2 bg-white text-[#4D2FB2] font-bold rounded-xl hover:bg-[#FFFDF1] transition-colors shadow-md">
            Attempt Quiz (+50 pts)
        </button>
      </div>
    </div>
  );
}
