"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, FileText, TrendingUp, TrendingDown, Minus,
  BookOpen, PenLine, ClipboardList, AlertTriangle, CheckCircle2,
} from "lucide-react";
import type { Student } from "@/lib/teacher-mock-data";

interface Props {
  student: Student;
  onBack: () => void;
}

function statusColors(status: Student["status"]) {
  if (status === "Active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (status === "At Risk") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
}

function scoreColor(s: number) {
  if (s >= 80) return "#10b981";
  if (s >= 65) return "#f59e0b";
  return "#ef4444";
}

function TrendIcon({ trend }: { trend: Student["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

function activityIcon(type: "paper" | "quiz" | "note") {
  if (type === "paper") return <FileText className="h-4 w-4 text-purple-500" />;
  if (type === "quiz") return <ClipboardList className="h-4 w-4 text-blue-500" />;
  return <PenLine className="h-4 w-4 text-amber-500" />;
}

export function StudentDeepDive({ student, onBack }: Props) {
  const weakTopics = student.topicPerformance.filter((t) => t.status === "Weak");
  const initials = student.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-1 shrink-0">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-purple-600">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-space-grotesk text-2xl font-bold">{student.name}</h2>
                <Badge className={`border-0 text-xs ${statusColors(student.status)}`}>
                  {student.status}
                </Badge>
                <Badge variant="outline" className="text-xs">{student.grade}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Enrolled {student.enrollmentDate} &middot; Rank #{student.rank} in class
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            Message Parent
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <BookOpen className="h-4 w-4 mr-1" />
            Assign Practice
          </Button>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: `${student.avgScore}%`, sub: <TrendIcon trend={student.trend} /> },
          { label: "Papers Done", value: student.papersCompleted, sub: "this term" },
          { label: "Last Active", value: student.lastActive, sub: "activity" },
          { label: "Strong Subject", value: student.strongSubject, sub: "best area" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold leading-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Trend */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Score Trend (3 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={student.scoreHistory} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, "Score"]}
                />
                <ReferenceLine y={75} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "75%", fontSize: 10, fill: "#6366f1", position: "insideTopRight" }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8b5cf6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={student.subjectScores}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="subject" width={72} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}%`, "Score"]}
                />
                <ReferenceLine x={75} stroke="#6366f1" strokeDasharray="4 4" />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {student.subjectScores.map((s) => (
                    <Cell key={s.subject} fill={scoreColor(s.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="border-border/50 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.recentActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {activityIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                    {item.score !== undefined && (
                      <span className="text-xs font-semibold" style={{ color: scoreColor(item.score) }}>
                        {item.score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card className="border-border/50 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Weak Areas</span>
              {weakTopics.length === 0 && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No weak topics identified — great performance!</p>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((t) => (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[140px]">{t.topic}</span>
                      <span className="text-xs text-red-600 font-semibold shrink-0 ml-2">{t.accuracy}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${t.accuracy}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{t.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Signals + Enrollment */}
        <Card className="border-border/50 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Risk Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.riskSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No risk signals — student is on track.</p>
            ) : (
              student.riskSignals.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border-l-4 bg-muted/30 ${
                    r.severity === "high"
                      ? "border-red-500"
                      : "border-amber-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${r.severity === "high" ? "text-red-600" : "text-amber-600"}`}>
                      {r.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 border-0 ${
                        r.severity === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {r.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                </div>
              ))
            )}

            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Enrollment</p>
              <p className="text-sm">Since {student.enrollmentDate}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {student.subjects.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{student.parentEmail}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
