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

// ─── Child 1: Aisha Fernando (Grade 11) ─────────────────────────

const aishaData: ChildProgressBundle = {
  childInfo: {
    name: "Aisha Fernando",
    grade: "Grade 11",
    initials: "AF",
    color: "from-purple-500 to-indigo-500",
    overallStatus: "Excellent",
    papersCompleted: 24,
    quizzesCompleted: 41,
    lastActive: "Today, 9:15 AM",
    avgScore: 87,
  },
  overviewStats: {
    studyTimeThisWeek: 11.0,
    studyTimeLastWeek: 9.5,
    avgScore: 87,
    scoreTrend: +5,
    activeDaysThisWeek: 6,
    currentStreak: 8,
    weakTopicsCount: 2,
  },
  subjectPerformance: [
    {
      subject: "Biology",
      avgScore: 92,
      papersAttempted: 8,
      quizzesAttempted: 15,
      trend: "improving",
      masteryLevel: "Expert",
      topics: [
        { name: "Cell Biology", score: 95 },
        { name: "Genetics", score: 91 },
        { name: "Ecology", score: 93 },
        { name: "Human Physiology", score: 89 },
        { name: "Evolution", score: 90 },
      ],
    },
    {
      subject: "Physics",
      avgScore: 84,
      papersAttempted: 6,
      quizzesAttempted: 12,
      trend: "stable",
      masteryLevel: "Advanced",
      topics: [
        { name: "Mechanics", score: 88 },
        { name: "Thermodynamics", score: 83 },
        { name: "Waves", score: 85 },
        { name: "Electromagnetism", score: 80 },
      ],
    },
    {
      subject: "Chemistry",
      avgScore: 68,
      papersAttempted: 5,
      quizzesAttempted: 9,
      trend: "declining",
      masteryLevel: "Proficient",
      topics: [
        { name: "Organic Chemistry", score: 64 },
        { name: "Acids & Bases", score: 72 },
        { name: "Electrochemistry", score: 66 },
        { name: "Reaction Rates", score: 70 },
      ],
    },
    {
      subject: "Mathematics",
      avgScore: 88,
      papersAttempted: 3,
      quizzesAttempted: 3,
      trend: "improving",
      masteryLevel: "Advanced",
      topics: [
        { name: "Calculus", score: 90 },
        { name: "Statistics", score: 86 },
        { name: "Algebra", score: 91 },
        { name: "Geometry", score: 84 },
      ],
    },
    {
      subject: "English",
      avgScore: 81,
      papersAttempted: 2,
      quizzesAttempted: 2,
      trend: "stable",
      masteryLevel: "Advanced",
      topics: [
        { name: "Essay Writing", score: 79 },
        { name: "Literature", score: 84 },
        { name: "Grammar", score: 82 },
        { name: "Comprehension", score: 80 },
      ],
    },
  ],
  weeklyActivity: [
    { date: "Mon", fullDate: "Feb 10", studyMinutes: 110, papersCompleted: 2, quizzesCompleted: 3, activityLevel: "high" },
    { date: "Tue", fullDate: "Feb 11", studyMinutes: 80, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "medium" },
    { date: "Wed", fullDate: "Feb 12", studyMinutes: 140, papersCompleted: 2, quizzesCompleted: 3, activityLevel: "high" },
    { date: "Thu", fullDate: "Feb 13", studyMinutes: 60, papersCompleted: 0, quizzesCompleted: 2, activityLevel: "medium" },
    { date: "Fri", fullDate: "Feb 14", studyMinutes: 90, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Sat", fullDate: "Feb 15", studyMinutes: 40, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Sun", fullDate: "Feb 16", studyMinutes: 75, papersCompleted: 1, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Mon", fullDate: "Feb 17", studyMinutes: 120, papersCompleted: 2, quizzesCompleted: 3, activityLevel: "high" },
    { date: "Tue", fullDate: "Feb 18", studyMinutes: 95, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Wed", fullDate: "Feb 19", studyMinutes: 0, papersCompleted: 0, quizzesCompleted: 0, activityLevel: "none" },
    { date: "Thu", fullDate: "Feb 20", studyMinutes: 110, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Fri", fullDate: "Feb 21", studyMinutes: 65, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Sat", fullDate: "Feb 22", studyMinutes: 30, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Sun", fullDate: "Feb 23", studyMinutes: 80, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "medium" },
  ],
  studyHabits: [
    { id: "1", icon: "clock", text: "Aisha studies most effectively between 3–6 PM, scoring an average of 91% during this window.", type: "info" },
    { id: "2", icon: "trend-up", text: "Study time increased by 16% this week (11h vs 9.5h last week). Excellent consistency!", type: "positive" },
    { id: "3", icon: "star", text: "Outstanding! Aisha practiced 6 out of 7 days this week and is on an 8-day streak.", type: "positive" },
    { id: "4", icon: "book", text: "Exceptional in Biology (92%) and Mathematics (88%). Chemistry needs focused attention (68%).", type: "info" },
    { id: "5", icon: "alert", text: "Chemistry performance has declined recently. Consider reviewing Organic Chemistry fundamentals.", type: "warning" },
  ],
  recentActivity: [
    { id: "1", type: "quiz", title: "Biology Quiz Completed", detail: "Genetics — Unit 3", score: 96, timestamp: "Today, 9:15 AM" },
    { id: "2", type: "paper", title: "Physics Paper Completed", detail: "Mechanics — Mid-Year", score: 88, timestamp: "Today, 8:00 AM" },
    { id: "3", type: "note", title: "Notes Read", detail: "Chemistry: Organic Reactions · 30 min", timestamp: "Yesterday, 5:00 PM" },
    { id: "4", type: "quiz", title: "Mathematics Quiz Completed", detail: "Calculus — Differentiation", score: 90, timestamp: "Yesterday, 3:30 PM" },
    { id: "5", type: "achievement", title: "Achievement Earned", detail: "8-Day Study Streak Badge", timestamp: "Yesterday, 3:30 PM" },
    { id: "6", type: "paper", title: "Biology Paper Completed", detail: "Ecology — Term 2", score: 93, timestamp: "Feb 20, 4:00 PM" },
    { id: "7", type: "note", title: "Notes Read", detail: "Physics: Thermodynamics · 40 min", timestamp: "Feb 19, 6:00 PM" },
    { id: "8", type: "quiz", title: "Chemistry Quiz Completed", detail: "Organic Chemistry", score: 64, timestamp: "Feb 18, 3:00 PM" },
    { id: "9", type: "streak", title: "Streak Milestone", detail: "Reached a 5-day study streak!", timestamp: "Feb 17, 7:00 PM" },
    { id: "10", type: "paper", title: "Mathematics Paper Completed", detail: "Algebra — Term 1", score: 91, timestamp: "Feb 17, 2:30 PM" },
  ],
  weakAreas: [
    { topic: "Organic Chemistry", subject: "Chemistry", currentScore: 64, targetScore: 75, gap: 11, lastPracticed: "3 days ago", suggestion: "Revisit functional groups and reaction mechanisms — daily 20-min practice would help significantly." },
    { topic: "Electrochemistry", subject: "Chemistry", currentScore: 66, targetScore: 75, gap: 9, lastPracticed: "5 days ago", suggestion: "Encourage Aisha to work through past paper questions on electrochemical cells." },
  ],
  peerComparison: [
    { subject: "Biology", childScore: 92, classAvg: 76, percentileRank: 94 },
    { subject: "Physics", childScore: 84, classAvg: 72, percentileRank: 80 },
    { subject: "Chemistry", childScore: 68, classAvg: 71, percentileRank: 44 },
    { subject: "Mathematics", childScore: 88, classAvg: 74, percentileRank: 88 },
    { subject: "English", childScore: 81, classAvg: 73, percentileRank: 74 },
  ],
  studyTimeDistribution: [
    { name: "Papers", value: 42, color: "#8b5cf6" },
    { name: "Quizzes", value: 38, color: "#6366f1" },
    { name: "Notes Reading", value: 20, color: "#a78bfa" },
  ],
  scoreHistory: [
    { month: "Dec", avgScore: 80 },
    { month: "Jan", avgScore: 84 },
    { month: "Feb", avgScore: 87 },
  ],
};

// ─── Child 2: Ravindu Fernando (Grade 9) ────────────────────────

const ravinduData: ChildProgressBundle = {
  childInfo: {
    name: "Ravindu Fernando",
    grade: "Grade 9",
    initials: "RF",
    color: "from-blue-500 to-cyan-500",
    overallStatus: "Good",
    papersCompleted: 18,
    quizzesCompleted: 34,
    lastActive: "Today, 8:40 AM",
    avgScore: 74,
  },
  overviewStats: {
    studyTimeThisWeek: 8.5,
    studyTimeLastWeek: 12.0,
    avgScore: 74,
    scoreTrend: +3,
    activeDaysThisWeek: 5,
    currentStreak: 5,
    weakTopicsCount: 4,
  },
  subjectPerformance: [
    {
      subject: "History",
      avgScore: 85,
      papersAttempted: 7,
      quizzesAttempted: 14,
      trend: "improving",
      masteryLevel: "Advanced",
      topics: [
        { name: "World War II", score: 91 },
        { name: "Cold War", score: 88 },
        { name: "Colonialism", score: 82 },
        { name: "Industrial Revolution", score: 76 },
        { name: "Ancient Civilizations", score: 89 },
      ],
    },
    {
      subject: "Mathematics",
      avgScore: 62,
      papersAttempted: 5,
      quizzesAttempted: 10,
      trend: "stable",
      masteryLevel: "Learning",
      topics: [
        { name: "Algebra", score: 71 },
        { name: "Geometry", score: 65 },
        { name: "Trigonometry", score: 54 },
        { name: "Statistics", score: 68 },
        { name: "Calculus", score: 48 },
      ],
    },
    {
      subject: "Science",
      avgScore: 78,
      papersAttempted: 4,
      quizzesAttempted: 8,
      trend: "improving",
      masteryLevel: "Proficient",
      topics: [
        { name: "Biology - Cells", score: 85 },
        { name: "Chemistry - Bonds", score: 74 },
        { name: "Physics - Motion", score: 79 },
        { name: "Ecology", score: 82 },
      ],
    },
    {
      subject: "English",
      avgScore: 71,
      papersAttempted: 2,
      quizzesAttempted: 2,
      trend: "declining",
      masteryLevel: "Proficient",
      topics: [
        { name: "Grammar", score: 78 },
        { name: "Comprehension", score: 72 },
        { name: "Essay Writing", score: 61 },
        { name: "Literature", score: 74 },
      ],
    },
  ],
  weeklyActivity: [
    { date: "Mon", fullDate: "Feb 10", studyMinutes: 90, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Tue", fullDate: "Feb 11", studyMinutes: 45, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Wed", fullDate: "Feb 12", studyMinutes: 120, papersCompleted: 2, quizzesCompleted: 3, activityLevel: "high" },
    { date: "Thu", fullDate: "Feb 13", studyMinutes: 0, papersCompleted: 0, quizzesCompleted: 0, activityLevel: "none" },
    { date: "Fri", fullDate: "Feb 14", studyMinutes: 60, papersCompleted: 1, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Sat", fullDate: "Feb 15", studyMinutes: 30, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "low" },
    { date: "Sun", fullDate: "Feb 16", studyMinutes: 75, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "medium" },
    { date: "Mon", fullDate: "Feb 17", studyMinutes: 110, papersCompleted: 1, quizzesCompleted: 2, activityLevel: "high" },
    { date: "Tue", fullDate: "Feb 18", studyMinutes: 85, papersCompleted: 0, quizzesCompleted: 2, activityLevel: "medium" },
    { date: "Wed", fullDate: "Feb 19", studyMinutes: 0, papersCompleted: 0, quizzesCompleted: 0, activityLevel: "none" },
    { date: "Thu", fullDate: "Feb 20", studyMinutes: 95, papersCompleted: 1, quizzesCompleted: 1, activityLevel: "high" },
    { date: "Fri", fullDate: "Feb 21", studyMinutes: 55, papersCompleted: 0, quizzesCompleted: 1, activityLevel: "medium" },
    { date: "Sat", fullDate: "Feb 22", studyMinutes: 20, papersCompleted: 0, quizzesCompleted: 0, activityLevel: "low" },
    { date: "Sun", fullDate: "Feb 23", studyMinutes: 70, papersCompleted: 1, quizzesCompleted: 1, activityLevel: "medium" },
  ],
  studyHabits: [
    { id: "1", icon: "clock", text: "Ravindu studies most effectively between 2–5 PM, achieving an average score of 82% during this window.", type: "info" },
    { id: "2", icon: "trend-down", text: "Study time decreased by 29% this week (8.5h vs 12h last week). Consider encouraging a daily study routine.", type: "warning" },
    { id: "3", icon: "star", text: "Good consistency! Ravindu practiced 5 out of 7 days this week and is on a 5-day streak.", type: "positive" },
    { id: "4", icon: "book", text: "Strong performance in History (85%) and Science (78%), but Mathematics needs more attention (62%).", type: "info" },
    { id: "5", icon: "trend-up", text: "Reading notes before practice boosts Ravindu's quiz scores by an estimated 18% — a great habit to encourage!", type: "positive" },
  ],
  recentActivity: [
    { id: "1", type: "paper", title: "History Paper Completed", detail: "World War II — Term 1", score: 88, timestamp: "Today, 8:40 AM" },
    { id: "2", type: "quiz", title: "Science Quiz Completed", detail: "Biology — Cell Structure", score: 92, timestamp: "Today, 7:30 AM" },
    { id: "3", type: "note", title: "Notes Read", detail: "Algebra: Quadratic Equations · 22 min", timestamp: "Yesterday, 4:30 PM" },
    { id: "4", type: "quiz", title: "Mathematics Quiz Completed", detail: "Trigonometry", score: 54, timestamp: "Yesterday, 3:00 PM" },
    { id: "5", type: "achievement", title: "Achievement Earned", detail: "5-Day Study Streak Badge", timestamp: "Yesterday, 3:00 PM" },
    { id: "6", type: "paper", title: "Science Paper Completed", detail: "Physics Motion — Mid-Year", score: 79, timestamp: "Feb 20, 2:45 PM" },
    { id: "7", type: "note", title: "Notes Read", detail: "History: The Cold War · 35 min", timestamp: "Feb 19, 5:00 PM" },
    { id: "8", type: "quiz", title: "English Quiz Completed", detail: "Grammar & Comprehension", score: 71, timestamp: "Feb 18, 4:15 PM" },
    { id: "9", type: "streak", title: "Streak Milestone", detail: "Reached a 3-day study streak!", timestamp: "Feb 17, 6:00 PM" },
    { id: "10", type: "paper", title: "History Paper Completed", detail: "Colonialism — Term 2", score: 82, timestamp: "Feb 17, 3:20 PM" },
  ],
  weakAreas: [
    { topic: "Calculus", subject: "Mathematics", currentScore: 48, targetScore: 70, gap: 22, lastPracticed: "5 days ago", suggestion: "Encourage daily practice — even 20 min on Calculus can help close this gap." },
    { topic: "Trigonometry", subject: "Mathematics", currentScore: 54, targetScore: 70, gap: 16, lastPracticed: "2 days ago", suggestion: "Consider extra tutoring for Trigonometry as foundational skills need strengthening." },
    { topic: "Essay Writing", subject: "English", currentScore: 61, targetScore: 75, gap: 14, lastPracticed: "4 days ago", suggestion: "Encourage Ravindu to practice essay writing — even a short piece daily helps." },
    { topic: "Chemistry — Bonds", subject: "Science", currentScore: 64, targetScore: 75, gap: 11, lastPracticed: "3 days ago", suggestion: "Reviewing the bonding notes before attempting practice papers would help here." },
  ],
  peerComparison: [
    { subject: "History", childScore: 85, classAvg: 73, percentileRank: 82 },
    { subject: "Mathematics", childScore: 62, classAvg: 68, percentileRank: 38 },
    { subject: "Science", childScore: 78, classAvg: 71, percentileRank: 71 },
    { subject: "English", childScore: 71, classAvg: 70, percentileRank: 55 },
  ],
  studyTimeDistribution: [
    { name: "Papers", value: 38, color: "#8b5cf6" },
    { name: "Quizzes", value: 35, color: "#6366f1" },
    { name: "Notes Reading", value: 27, color: "#a78bfa" },
  ],
  scoreHistory: [
    { month: "Dec", avgScore: 66 },
    { month: "Jan", avgScore: 70 },
    { month: "Feb", avgScore: 74 },
  ],
};

// ─── Lookup by child ID ──────────────────────────────────────────

export const childProgressData: Record<number, ChildProgressBundle> = {
  1: aishaData,
  2: ravinduData,
};

export const defaultChildId = 1;
