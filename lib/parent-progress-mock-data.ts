// ─── Types ──────────────────────────────────────────────────────

export interface ChildInfo {
  name: string;
  grade: string;
  initials: string;
  color: string;
  overallStatus: "Excellent" | "Good" | "Needs Improvement";
  papersCompleted: number;
  quizzesCompleted: number;
  lastActive: string;
  avgScore: number;
}

export interface ParentOverviewStats {
  studyTimeThisWeek: number;
  studyTimeLastWeek: number;
  avgScore: number;
  scoreTrend: number;
  activeDaysThisWeek: number;
  currentStreak: number;
  weakTopicsCount: number;
}

export interface SubjectPerformance {
  subject: string;
  avgScore: number;
  papersAttempted: number;
  quizzesAttempted: number;
  trend: "improving" | "stable" | "declining";
  masteryLevel: "Expert" | "Advanced" | "Proficient" | "Learning" | "Developing";
  topics: { name: string; score: number }[];
}

export interface DayActivity {
  date: string;
  fullDate: string;
  studyMinutes: number;
  papersCompleted: number;
  quizzesCompleted: number;
  activityLevel: "high" | "medium" | "low" | "none";
}

export interface ActivityItem {
  id: string;
  type: "paper" | "quiz" | "note" | "achievement" | "streak";
  title: string;
  detail: string;
  score?: number;
  timestamp: string;
}

export interface ParentWeakArea {
  topic: string;
  subject: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  lastPracticed: string;
  suggestion: string;
}

export interface SubjectComparison {
  subject: string;
  childScore: number;
  classAvg: number;
  percentileRank: number;
}

export interface StudyTimeSlice {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyScore {
  month: string;
  avgScore: number;
}

export interface StudyHabitInsight {
  id: string;
  icon: "clock" | "trend-up" | "trend-down" | "star" | "alert" | "book";
  text: string;
  type: "positive" | "warning" | "info";
}

export interface ChildProgressBundle {
  childInfo: ChildInfo;
  overviewStats: ParentOverviewStats;
  subjectPerformance: SubjectPerformance[];
  weeklyActivity: DayActivity[];
  studyHabits: StudyHabitInsight[];
  recentActivity: ActivityItem[];
  weakAreas: ParentWeakArea[];
  peerComparison: SubjectComparison[];
  studyTimeDistribution: StudyTimeSlice[];
  scoreHistory: MonthlyScore[];
}

// ─── Child 1: Lia Fernando (Grade 10) ───────────────────────────

const liaData: ChildProgressBundle = {
  childInfo: {
    name: "Lia Fernando",
    grade: "Grade 10",
    initials: "LF",
    color: "from-purple-500 to-indigo-500",
    overallStatus: "Good",
    papersCompleted: 1,
    quizzesCompleted: 13,
    lastActive: "Today, 8:30 AM",
    avgScore: 78,
  },
  overviewStats: {
    studyTimeThisWeek: 7.5,
    studyTimeLastWeek: 5.0,
    avgScore: 78,
    scoreTrend: +6,
    activeDaysThisWeek: 7,
    currentStreak: 7,
    weakTopicsCount: 2,
  },
  subjectPerformance: [
    {
      subject: "History",
      avgScore: 82,
      papersAttempted: 1,
      quizzesAttempted: 3,
      trend: "improving",
      masteryLevel: "Advanced",
      topics: [
        { name: "World War II", score: 88 },
        { name: "Cold War", score: 85 },
        { name: "Fascism in Europe", score: 79 },
        { name: "Post-war Reconstruction", score: 76 },
      ],
    },
    {
      subject: "Geography",
      avgScore: 89,
      papersAttempted: 0,
      quizzesAttempted: 3,
      trend: "improving",
      masteryLevel: "Advanced",
      topics: [
        { name: "Climate & Ecosystems", score: 91 },
        { name: "World Rivers & Mountains", score: 88 },
        { name: "Climate Change", score: 87 },
      ],
    },
    {
      subject: "English",
      avgScore: 74,
      papersAttempted: 0,
      quizzesAttempted: 2,
      trend: "stable",
      masteryLevel: "Proficient",
      topics: [
        { name: "Grammar", score: 77 },
        { name: "Comprehension", score: 74 },
        { name: "Essay Writing", score: 70 },
      ],
    },
    {
      subject: "Civic Education",
      avgScore: 65,
      papersAttempted: 0,
      quizzesAttempted: 3,
      trend: "stable",
      masteryLevel: "Learning",
      topics: [
        { name: "Human Rights", score: 65 },
        { name: "Democratic Rights & Duties", score: 67 },
        { name: "Citizenship", score: 63 },
      ],
    },
    {
      subject: "Health",
      avgScore: 82,
      papersAttempted: 0,
      quizzesAttempted: 2,
      trend: "stable",
      masteryLevel: "Proficient",
      topics: [
        { name: "Nutrition", score: 82 },
        { name: "Body Systems", score: 81 },
      ],
    },
  ],
  weeklyActivity: [
    { date: "Mon", fullDate: "Mar 17", studyMinutes: 95, papersCompleted: 0, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Tue", fullDate: "Mar 18", studyMinutes: 60, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Wed", fullDate: "Mar 19", studyMinutes: 120, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Thu", fullDate: "Mar 20", studyMinutes: 45, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Fri", fullDate: "Mar 21", studyMinutes: 80, papersCompleted: 0, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Sat", fullDate: "Mar 22", studyMinutes: 30, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Sun", fullDate: "Mar 23", studyMinutes: 70, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Mon", fullDate: "Mar 10", studyMinutes: 55, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Tue", fullDate: "Mar 11", studyMinutes: 40, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Wed", fullDate: "Mar 12", studyMinutes: 90, papersCompleted: 0, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Thu", fullDate: "Mar 13", studyMinutes: 0, papersCompleted: 0, quizzesCompleted: 0, activityLevel: "none" },
    { date: "Fri", fullDate: "Mar 14", studyMinutes: 75, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Sat", fullDate: "Mar 15", studyMinutes: 25, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Sun", fullDate: "Mar 16", studyMinutes: 60, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
  ],
  studyHabits: [
    { id: "1", icon: "clock", text: "Lia studies most effectively between 4–7 PM, scoring an average of 84% during this window.", type: "info" },
    { id: "2", icon: "trend-up", text: "Study time increased by 50% this week (7.5h vs 5h last week). Great improvement!", type: "positive" },
    { id: "3", icon: "star", text: "Excellent! Lia has studied every day this week and is on a 7-day streak.", type: "positive" },
    { id: "4", icon: "book", text: "Top performance in Geography (89%) and History (82%). Civic Education needs more attention (65%).", type: "info" },
    { id: "5", icon: "alert", text: "Civic Education scores are below target. Reviewing Human Rights and Citizenship topics would help.", type: "warning" },
  ],
  recentActivity: [
    { id: "1", type: "quiz", title: "Geography Quiz Completed", detail: "Climate & Ecosystems", score: 91, timestamp: "Today, 8:30 AM" },
    { id: "2", type: "paper", title: "History Paper Completed", detail: "Grade 10 History — Term 1 Exam", score: 45, timestamp: "Mar 13, 10:30 AM" },
    { id: "3", type: "quiz", title: "History Quiz Completed", detail: "World War II — Causes & Events", score: 88, timestamp: "Mar 12, 4:00 PM" },
    { id: "4", type: "note", title: "Notes Read", detail: "History: The Cold War Overview · 25 min", timestamp: "Mar 11, 5:30 PM" },
    { id: "5", type: "achievement", title: "Achievement Earned", detail: "7-Day Study Streak Badge", timestamp: "Mar 10, 8:00 PM" },
    { id: "6", type: "quiz", title: "English Quiz Completed", detail: "Grammar & Comprehension", score: 74, timestamp: "Mar 10, 3:00 PM" },
    { id: "7", type: "quiz", title: "Civic Education Quiz Completed", detail: "Human Rights & Citizenship", score: 65, timestamp: "Mar 8, 4:30 PM" },
    { id: "8", type: "note", title: "Notes Read", detail: "Geography: Climate Change · 20 min", timestamp: "Mar 7, 6:00 PM" },
    { id: "9", type: "streak", title: "Streak Milestone", detail: "Reached a 5-day study streak!", timestamp: "Mar 6, 7:00 PM" },
    { id: "10", type: "quiz", title: "Health Quiz Completed", detail: "Nutrition & Body Systems", score: 82, timestamp: "Mar 5, 3:30 PM" },
  ],
  weakAreas: [
    { topic: "Human Rights", subject: "Civic Education", currentScore: 65, targetScore: 75, gap: 10, lastPracticed: "5 days ago", suggestion: "Encourage Lia to review the Democratic Rights & Duties note and try practice quizzes." },
    { topic: "Essay Writing", subject: "English", currentScore: 70, targetScore: 80, gap: 10, lastPracticed: "10 days ago", suggestion: "Practicing short essay responses daily will help build confidence and structure." },
  ],
  peerComparison: [
    { subject: "History", childScore: 82, classAvg: 73, percentileRank: 78 },
    { subject: "Geography", childScore: 89, classAvg: 74, percentileRank: 90 },
    { subject: "English", childScore: 74, classAvg: 71, percentileRank: 58 },
    { subject: "Civic Education", childScore: 65, classAvg: 68, percentileRank: 42 },
    { subject: "Health", childScore: 82, classAvg: 75, percentileRank: 72 },
  ],
  studyTimeDistribution: [
    { name: "Papers", value: 25, color: "#8b5cf6" },
    { name: "Quizzes", value: 50, color: "#6366f1" },
    { name: "Notes Reading", value: 25, color: "#a78bfa" },
  ],
  scoreHistory: [
    { month: "Jan", avgScore: 70 },
    { month: "Feb", avgScore: 74 },
    { month: "Mar", avgScore: 78 },
  ],
};

// ─── Lookup by child ID ──────────────────────────────────────────

export const childProgressData: Record<number, ChildProgressBundle> = {
  1: liaData,
};

export const defaultChildId = 1;
