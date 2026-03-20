// ─── Types ──────────────────────────────────────────────────────

export interface SubjectScore {
  subject: string;
  score: number;
}

export interface ScoreHistoryPoint {
  month: string;
  score: number;
}

export interface StudentActivityItem {
  id: string;
  type: "paper" | "quiz" | "note";
  title: string;
  score?: number;
  timestamp: string;
  subject: string;
}

export interface TopicPerformance {
  topic: string;
  subject: string;
  accuracy: number;
  status: "Strong" | "Average" | "Weak";
}

export interface RiskSignal {
  label: string;
  severity: "high" | "medium";
  detail: string;
}

export interface Student {
  id: number;
  name: string;
  grade: "Grade 9" | "Grade 10" | "Grade 11";
  subjects: string[];
  avgScore: number;
  trend: "up" | "down" | "stable";
  papersCompleted: number;
  lastActive: string;
  status: "Active" | "At Risk" | "Inactive";
  parentEmail: string;
  enrollmentDate: string;
  subjectScores: SubjectScore[];
  scoreHistory: ScoreHistoryPoint[];
  recentActivity: StudentActivityItem[];
  topicPerformance: TopicPerformance[];
  riskSignals: RiskSignal[];
  strongSubject: string;
  rank: number;
}

export interface ScoreDistributionBucket {
  range: string;
  count: number;
}

export interface SubjectPerformanceSummary {
  subject: string;
  classAvg: number;
  studentsCount: number;
}

export interface TopPerformer {
  rank: number;
  studentId: number;
  name: string;
  avgScore: number;
  papersCompleted: number;
  strongSubject: string;
}

export interface WeeklyActivityPoint {
  week: string;
  studyHours: number;
  papersCompleted: number;
  avgEngagement: number;
}

export interface TopicDifficultyRow {
  topic: string;
  subject: string;
  avgAccuracy: number;
  studentsAttempted: number;
  studentsStruggling: number;
  status: "Easy" | "Medium" | "Hard";
  strugglingStudentIds: number[];
}

export interface StudyTimeStats {
  myClassAvg: number;
  platformAvg: number;
  highEngagement: number;
  mediumEngagement: number;
  lowEngagement: number;
}

export interface TeacherAnalyticsData {
  overviewStats: {
    totalStudents: number;
    activeThisWeek: number;
    classAverage: number;
    papersCompletedThisWeek: number;
    pendingReviews: number;
    studentsAtRisk: number;
  };
  scoreDistribution: ScoreDistributionBucket[];
  subjectPerformance: SubjectPerformanceSummary[];
  topPerformers: TopPerformer[];
  weeklyActivity: WeeklyActivityPoint[];
  topicDifficulty: TopicDifficultyRow[];
  studyTimeStats: StudyTimeStats;
}

// ─── Existing exports (unchanged) ───────────────────────────────

export const teacherProfile = {
  name: "Ms. Sarah Johnson",
  initials: "SJ",
  email: "sarah.johnson@evalora.edu",
  role: "Senior Teacher",
};

export const dashboardStats = {
  totalStudents: 18,
  classCount: 3,
  classAverage: 72,
  averageTrend: "+3%",
  pendingReviews: 8,
  recentUploads: 12,
};

export const todayGlance = {
  newUploads: 3,
  submissions: 8,
  nextClass: "Grade 10 — History at 1:30 PM",
};

export const subjectTopics: Record<string, string[]> = {
  History: [
    "World War I", "World War II", "Cold War", "Colonialism",
    "Industrial Revolution", "Ancient Civilizations", "French Revolution",
    "American Revolution", "Civil Rights Movement", "The Great Depression",
  ],
  Geography: [
    "Physical Geography", "Climate & Weather", "Population Studies",
    "Urban Geography", "Economic Geography", "Map Skills", "Ecosystems",
  ],
  Civics: [
    "Government Systems", "Human Rights", "Democracy", "Elections & Voting",
    "International Relations", "Law & Justice", "Citizenship",
  ],
  Health: [
    "Human Body Systems", "Nutrition & Diet", "Mental Health", "Physical Fitness",
    "Disease Prevention", "First Aid", "Reproductive Health", "Substance Abuse",
    "Personal Hygiene", "Environmental Health",
  ],
};

export const subjects = ["History", "Geography", "Civics", "Health"];

// ─── Students (18) ──────────────────────────────────────────────

export const students: Student[] = [
  {
    id: 1, name: "Aisha Fernando", grade: "Grade 10",
    subjects: ["History", "Geography", "Civics"], avgScore: 91,
    trend: "up", papersCompleted: 24, lastActive: "Today, 9:15 AM",
    status: "Active", parentEmail: "david.fernando@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "History", rank: 2,
    subjectScores: [{ subject: "History", score: 95 }, { subject: "Geography", score: 89 }, { subject: "Civics", score: 91 }],
    scoreHistory: [{ month: "Dec", score: 84 }, { month: "Jan", score: 88 }, { month: "Feb", score: 91 }],
    recentActivity: [
      { id: "1", type: "paper", title: "History Paper", score: 95, timestamp: "Today, 9:15 AM", subject: "History" },
      { id: "2", type: "quiz", title: "Geography Quiz", score: 89, timestamp: "Yesterday", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: Cold War", timestamp: "2 days ago", subject: "History" },
      { id: "4", type: "quiz", title: "Civics Quiz", score: 91, timestamp: "3 days ago", subject: "Civics" },
      { id: "5", type: "paper", title: "Geography Paper", score: 88, timestamp: "4 days ago", subject: "Geography" },
    ],
    topicPerformance: [
      { topic: "World War II", subject: "History", accuracy: 97, status: "Strong" },
      { topic: "Cold War", subject: "History", accuracy: 93, status: "Strong" },
      { topic: "Climate & Weather", subject: "Geography", accuracy: 88, status: "Strong" },
      { topic: "Democracy", subject: "Civics", accuracy: 91, status: "Strong" },
    ],
    riskSignals: [],
  },
  {
    id: 2, name: "Kavindu Perera", grade: "Grade 10",
    subjects: ["History", "Geography"], avgScore: 78,
    trend: "stable", papersCompleted: 18, lastActive: "Today, 8:30 AM",
    status: "Active", parentEmail: "perera.family@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "History", rank: 7,
    subjectScores: [{ subject: "History", score: 82 }, { subject: "Geography", score: 74 }],
    scoreHistory: [{ month: "Dec", score: 76 }, { month: "Jan", score: 77 }, { month: "Feb", score: 78 }],
    recentActivity: [
      { id: "1", type: "paper", title: "History Paper", score: 82, timestamp: "Today, 8:30 AM", subject: "History" },
      { id: "2", type: "quiz", title: "Geography Quiz", score: 74, timestamp: "2 days ago", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: Colonialism", timestamp: "3 days ago", subject: "History" },
      { id: "4", type: "paper", title: "Geography Paper", score: 76, timestamp: "5 days ago", subject: "Geography" },
      { id: "5", type: "quiz", title: "History Quiz", score: 83, timestamp: "6 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "World War II", subject: "History", accuracy: 84, status: "Strong" },
      { topic: "Physical Geography", subject: "Geography", accuracy: 72, status: "Average" },
      { topic: "Map Skills", subject: "Geography", accuracy: 68, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 3, name: "Nethmi Silva", grade: "Grade 11",
    subjects: ["History", "Civics"], avgScore: 85,
    trend: "up", papersCompleted: 21, lastActive: "Yesterday, 4:00 PM",
    status: "Active", parentEmail: "silva.parent@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "Civics", rank: 4,
    subjectScores: [{ subject: "History", score: 82 }, { subject: "Civics", score: 88 }],
    scoreHistory: [{ month: "Dec", score: 79 }, { month: "Jan", score: 82 }, { month: "Feb", score: 85 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "Civics Quiz", score: 90, timestamp: "Yesterday, 4:00 PM", subject: "Civics" },
      { id: "2", type: "paper", title: "History Paper", score: 83, timestamp: "2 days ago", subject: "History" },
      { id: "3", type: "note", title: "Notes: Human Rights", timestamp: "3 days ago", subject: "Civics" },
      { id: "4", type: "quiz", title: "History Quiz", score: 81, timestamp: "4 days ago", subject: "History" },
      { id: "5", type: "paper", title: "Civics Paper", score: 87, timestamp: "6 days ago", subject: "Civics" },
    ],
    topicPerformance: [
      { topic: "Human Rights", subject: "Civics", accuracy: 91, status: "Strong" },
      { topic: "Democracy", subject: "Civics", accuracy: 88, status: "Strong" },
      { topic: "Cold War", subject: "History", accuracy: 78, status: "Average" },
      { topic: "Industrial Revolution", subject: "History", accuracy: 74, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 4, name: "Dineth Rajapaksha", grade: "Grade 10",
    subjects: ["History", "Geography", "Civics"], avgScore: 48,
    trend: "down", papersCompleted: 8, lastActive: "3 days ago",
    status: "At Risk", parentEmail: "rajapaksha@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "History", rank: 17,
    subjectScores: [{ subject: "History", score: 52 }, { subject: "Geography", score: 44 }, { subject: "Civics", score: 48 }],
    scoreHistory: [{ month: "Dec", score: 61 }, { month: "Jan", score: 55 }, { month: "Feb", score: 48 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 52, timestamp: "3 days ago", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 44, timestamp: "1 week ago", subject: "Geography" },
      { id: "3", type: "quiz", title: "Civics Quiz", score: 48, timestamp: "10 days ago", subject: "Civics" },
      { id: "4", type: "note", title: "Notes: WWI", timestamp: "2 weeks ago", subject: "History" },
      { id: "5", type: "paper", title: "History Paper", score: 50, timestamp: "2 weeks ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Map Skills", subject: "Geography", accuracy: 40, status: "Weak" },
      { topic: "Ecosystems", subject: "Geography", accuracy: 45, status: "Weak" },
      { topic: "Government Systems", subject: "Civics", accuracy: 46, status: "Weak" },
      { topic: "Industrial Revolution", subject: "History", accuracy: 50, status: "Weak" },
      { topic: "World War I", subject: "History", accuracy: 54, status: "Weak" },
    ],
    riskSignals: [
      { label: "Score Declining", severity: "high", detail: "Dropped 13% over last 3 months" },
      { label: "Low Completion", severity: "high", detail: "Only 8 papers completed this term" },
      { label: "Reduced Activity", severity: "medium", detail: "Last active 3 days ago" },
    ],
  },
  {
    id: 5, name: "Sithumi Jayawardena", grade: "Grade 11",
    subjects: ["History", "Geography"], avgScore: 74,
    trend: "stable", papersCompleted: 17, lastActive: "Today, 7:50 AM",
    status: "Active", parentEmail: "jayawardena@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "History", rank: 9,
    subjectScores: [{ subject: "History", score: 77 }, { subject: "Geography", score: 71 }],
    scoreHistory: [{ month: "Dec", score: 73 }, { month: "Jan", score: 74 }, { month: "Feb", score: 74 }],
    recentActivity: [
      { id: "1", type: "paper", title: "History Paper", score: 78, timestamp: "Today, 7:50 AM", subject: "History" },
      { id: "2", type: "quiz", title: "Geography Quiz", score: 70, timestamp: "Yesterday", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: French Revolution", timestamp: "2 days ago", subject: "History" },
      { id: "4", type: "paper", title: "Geography Paper", score: 72, timestamp: "4 days ago", subject: "Geography" },
      { id: "5", type: "quiz", title: "History Quiz", score: 76, timestamp: "5 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "French Revolution", subject: "History", accuracy: 78, status: "Average" },
      { topic: "Population Studies", subject: "Geography", accuracy: 70, status: "Average" },
      { topic: "Urban Geography", subject: "Geography", accuracy: 66, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 6, name: "Ravindu Mendis", grade: "Grade 10",
    subjects: ["History", "Civics"], avgScore: 68,
    trend: "stable", papersCompleted: 15, lastActive: "Yesterday, 3:30 PM",
    status: "Active", parentEmail: "mendis.home@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "History", rank: 12,
    subjectScores: [{ subject: "History", score: 72 }, { subject: "Civics", score: 64 }],
    scoreHistory: [{ month: "Dec", score: 67 }, { month: "Jan", score: 68 }, { month: "Feb", score: 68 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "Civics Quiz", score: 64, timestamp: "Yesterday, 3:30 PM", subject: "Civics" },
      { id: "2", type: "paper", title: "History Paper", score: 73, timestamp: "2 days ago", subject: "History" },
      { id: "3", type: "note", title: "Notes: Elections", timestamp: "3 days ago", subject: "Civics" },
      { id: "4", type: "quiz", title: "History Quiz", score: 71, timestamp: "5 days ago", subject: "History" },
      { id: "5", type: "paper", title: "Civics Paper", score: 65, timestamp: "6 days ago", subject: "Civics" },
    ],
    topicPerformance: [
      { topic: "Elections & Voting", subject: "Civics", accuracy: 62, status: "Average" },
      { topic: "Law & Justice", subject: "Civics", accuracy: 58, status: "Weak" },
      { topic: "Cold War", subject: "History", accuracy: 74, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 7, name: "Tharushi Wickrama", grade: "Grade 11",
    subjects: ["History", "Geography", "Civics"], avgScore: 43,
    trend: "down", papersCompleted: 5, lastActive: "10 days ago",
    status: "Inactive", parentEmail: "wickrama.parent@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "History", rank: 18,
    subjectScores: [{ subject: "History", score: 48 }, { subject: "Geography", score: 40 }, { subject: "Civics", score: 42 }],
    scoreHistory: [{ month: "Dec", score: 58 }, { month: "Jan", score: 51 }, { month: "Feb", score: 43 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 48, timestamp: "10 days ago", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 40, timestamp: "2 weeks ago", subject: "Geography" },
      { id: "3", type: "quiz", title: "Civics Quiz", score: 42, timestamp: "3 weeks ago", subject: "Civics" },
      { id: "4", type: "note", title: "Notes: WWI", timestamp: "3 weeks ago", subject: "History" },
      { id: "5", type: "paper", title: "History Paper", score: 46, timestamp: "4 weeks ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Ecosystems", subject: "Geography", accuracy: 38, status: "Weak" },
      { topic: "Citizenship", subject: "Civics", accuracy: 41, status: "Weak" },
      { topic: "Physical Geography", subject: "Geography", accuracy: 43, status: "Weak" },
      { topic: "World War I", subject: "History", accuracy: 46, status: "Weak" },
    ],
    riskSignals: [
      { label: "Inactive 10+ Days", severity: "high", detail: "No activity recorded in the last 10 days" },
      { label: "Score Declining", severity: "high", detail: "Score dropped 15% over 3 months" },
      { label: "Very Low Completion", severity: "high", detail: "Only 5 papers — significantly below class average" },
    ],
  },
  {
    id: 8, name: "Isuru Bandara", grade: "Grade 10",
    subjects: ["History", "Geography"], avgScore: 82,
    trend: "up", papersCompleted: 20, lastActive: "Today, 10:00 AM",
    status: "Active", parentEmail: "bandara.isuru@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "Geography", rank: 5,
    subjectScores: [{ subject: "History", score: 80 }, { subject: "Geography", score: 84 }],
    scoreHistory: [{ month: "Dec", score: 76 }, { month: "Jan", score: 79 }, { month: "Feb", score: 82 }],
    recentActivity: [
      { id: "1", type: "paper", title: "Geography Paper", score: 86, timestamp: "Today, 10:00 AM", subject: "Geography" },
      { id: "2", type: "quiz", title: "History Quiz", score: 80, timestamp: "Yesterday", subject: "History" },
      { id: "3", type: "note", title: "Notes: Climate", timestamp: "2 days ago", subject: "Geography" },
      { id: "4", type: "paper", title: "History Paper", score: 79, timestamp: "3 days ago", subject: "History" },
      { id: "5", type: "quiz", title: "Geography Quiz", score: 85, timestamp: "4 days ago", subject: "Geography" },
    ],
    topicPerformance: [
      { topic: "Climate & Weather", subject: "Geography", accuracy: 87, status: "Strong" },
      { topic: "Physical Geography", subject: "Geography", accuracy: 83, status: "Strong" },
      { topic: "Cold War", subject: "History", accuracy: 79, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 9, name: "Amara Liyanage", grade: "Grade 9",
    subjects: ["History", "Geography", "Civics"], avgScore: 93,
    trend: "up", papersCompleted: 26, lastActive: "Today, 8:00 AM",
    status: "Active", parentEmail: "liyanage.amara@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "Civics", rank: 1,
    subjectScores: [{ subject: "History", score: 92 }, { subject: "Geography", score: 91 }, { subject: "Civics", score: 96 }],
    scoreHistory: [{ month: "Dec", score: 88 }, { month: "Jan", score: 91 }, { month: "Feb", score: 93 }],
    recentActivity: [
      { id: "1", type: "paper", title: "Civics Paper", score: 96, timestamp: "Today, 8:00 AM", subject: "Civics" },
      { id: "2", type: "quiz", title: "History Quiz", score: 93, timestamp: "Yesterday", subject: "History" },
      { id: "3", type: "note", title: "Notes: Democracy", timestamp: "2 days ago", subject: "Civics" },
      { id: "4", type: "quiz", title: "Geography Quiz", score: 90, timestamp: "3 days ago", subject: "Geography" },
      { id: "5", type: "paper", title: "History Paper", score: 92, timestamp: "4 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Democracy", subject: "Civics", accuracy: 97, status: "Strong" },
      { topic: "Human Rights", subject: "Civics", accuracy: 95, status: "Strong" },
      { topic: "World War II", subject: "History", accuracy: 93, status: "Strong" },
      { topic: "Map Skills", subject: "Geography", accuracy: 90, status: "Strong" },
    ],
    riskSignals: [],
  },
  {
    id: 10, name: "Lakshan Gunawardena", grade: "Grade 9",
    subjects: ["History", "Geography"], avgScore: 65,
    trend: "stable", papersCompleted: 13, lastActive: "Yesterday, 2:00 PM",
    status: "Active", parentEmail: "gunawardena@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "History", rank: 13,
    subjectScores: [{ subject: "History", score: 68 }, { subject: "Geography", score: 62 }],
    scoreHistory: [{ month: "Dec", score: 64 }, { month: "Jan", score: 65 }, { month: "Feb", score: 65 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 68, timestamp: "Yesterday, 2:00 PM", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 62, timestamp: "3 days ago", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: Ancient Civs", timestamp: "4 days ago", subject: "History" },
      { id: "4", type: "quiz", title: "Geography Quiz", score: 63, timestamp: "5 days ago", subject: "Geography" },
      { id: "5", type: "paper", title: "History Paper", score: 69, timestamp: "6 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Ancient Civilizations", subject: "History", accuracy: 70, status: "Average" },
      { topic: "Ecosystems", subject: "Geography", accuracy: 58, status: "Weak" },
      { topic: "Urban Geography", subject: "Geography", accuracy: 61, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 11, name: "Nisali Dissanayake", grade: "Grade 9",
    subjects: ["History", "Geography", "Civics"], avgScore: 55,
    trend: "down", papersCompleted: 10, lastActive: "4 days ago",
    status: "At Risk", parentEmail: "dissanayake.n@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "History", rank: 16,
    subjectScores: [{ subject: "History", score: 60 }, { subject: "Geography", score: 50 }, { subject: "Civics", score: 55 }],
    scoreHistory: [{ month: "Dec", score: 62 }, { month: "Jan", score: 58 }, { month: "Feb", score: 55 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 60, timestamp: "4 days ago", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 50, timestamp: "1 week ago", subject: "Geography" },
      { id: "3", type: "quiz", title: "Civics Quiz", score: 55, timestamp: "10 days ago", subject: "Civics" },
      { id: "4", type: "note", title: "Notes: WWI", timestamp: "11 days ago", subject: "History" },
      { id: "5", type: "paper", title: "History Paper", score: 58, timestamp: "2 weeks ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Map Skills", subject: "Geography", accuracy: 48, status: "Weak" },
      { topic: "Government Systems", subject: "Civics", accuracy: 52, status: "Weak" },
      { topic: "Ecosystems", subject: "Geography", accuracy: 53, status: "Weak" },
      { topic: "World War I", subject: "History", accuracy: 58, status: "Weak" },
    ],
    riskSignals: [
      { label: "Score Declining", severity: "high", detail: "Dropped 7% over last 3 months" },
      { label: "Reduced Activity", severity: "medium", detail: "Last active 4 days ago" },
    ],
  },
  {
    id: 12, name: "Pavan Rathnayake", grade: "Grade 9",
    subjects: ["History", "Civics"], avgScore: 71,
    trend: "up", papersCompleted: 16, lastActive: "Today, 11:00 AM",
    status: "Active", parentEmail: "rathnayake.p@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "Civics", rank: 10,
    subjectScores: [{ subject: "History", score: 69 }, { subject: "Civics", score: 73 }],
    scoreHistory: [{ month: "Dec", score: 66 }, { month: "Jan", score: 68 }, { month: "Feb", score: 71 }],
    recentActivity: [
      { id: "1", type: "paper", title: "Civics Paper", score: 74, timestamp: "Today, 11:00 AM", subject: "Civics" },
      { id: "2", type: "quiz", title: "History Quiz", score: 68, timestamp: "Yesterday", subject: "History" },
      { id: "3", type: "note", title: "Notes: Democracy", timestamp: "2 days ago", subject: "Civics" },
      { id: "4", type: "paper", title: "History Paper", score: 70, timestamp: "4 days ago", subject: "History" },
      { id: "5", type: "quiz", title: "Civics Quiz", score: 72, timestamp: "5 days ago", subject: "Civics" },
    ],
    topicPerformance: [
      { topic: "Democracy", subject: "Civics", accuracy: 74, status: "Average" },
      { topic: "Elections & Voting", subject: "Civics", accuracy: 72, status: "Average" },
      { topic: "French Revolution", subject: "History", accuracy: 67, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 13, name: "Ruwani Perera", grade: "Grade 9",
    subjects: ["History", "Geography", "Civics"], avgScore: 88,
    trend: "up", papersCompleted: 22, lastActive: "Today, 9:45 AM",
    status: "Active", parentEmail: "perera.ruwani@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "Geography", rank: 3,
    subjectScores: [{ subject: "History", score: 86 }, { subject: "Geography", score: 91 }, { subject: "Civics", score: 87 }],
    scoreHistory: [{ month: "Dec", score: 82 }, { month: "Jan", score: 85 }, { month: "Feb", score: 88 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "Geography Quiz", score: 92, timestamp: "Today, 9:45 AM", subject: "Geography" },
      { id: "2", type: "paper", title: "History Paper", score: 86, timestamp: "Yesterday", subject: "History" },
      { id: "3", type: "note", title: "Notes: Climate", timestamp: "2 days ago", subject: "Geography" },
      { id: "4", type: "quiz", title: "Civics Quiz", score: 88, timestamp: "3 days ago", subject: "Civics" },
      { id: "5", type: "paper", title: "Geography Paper", score: 91, timestamp: "4 days ago", subject: "Geography" },
    ],
    topicPerformance: [
      { topic: "Climate & Weather", subject: "Geography", accuracy: 93, status: "Strong" },
      { topic: "Physical Geography", subject: "Geography", accuracy: 89, status: "Strong" },
      { topic: "World War II", subject: "History", accuracy: 87, status: "Strong" },
    ],
    riskSignals: [],
  },
  {
    id: 14, name: "Thilina Jayasuriya", grade: "Grade 9",
    subjects: ["History", "Geography"], avgScore: 76,
    trend: "stable", papersCompleted: 17, lastActive: "Yesterday, 5:00 PM",
    status: "Active", parentEmail: "jayasuriya.t@email.com",
    enrollmentDate: "Jan 2025", strongSubject: "History", rank: 8,
    subjectScores: [{ subject: "History", score: 79 }, { subject: "Geography", score: 73 }],
    scoreHistory: [{ month: "Dec", score: 75 }, { month: "Jan", score: 76 }, { month: "Feb", score: 76 }],
    recentActivity: [
      { id: "1", type: "paper", title: "History Paper", score: 80, timestamp: "Yesterday, 5:00 PM", subject: "History" },
      { id: "2", type: "quiz", title: "Geography Quiz", score: 72, timestamp: "2 days ago", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: Cold War", timestamp: "3 days ago", subject: "History" },
      { id: "4", type: "paper", title: "Geography Paper", score: 74, timestamp: "5 days ago", subject: "Geography" },
      { id: "5", type: "quiz", title: "History Quiz", score: 78, timestamp: "6 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Cold War", subject: "History", accuracy: 80, status: "Strong" },
      { topic: "Population Studies", subject: "Geography", accuracy: 71, status: "Average" },
      { topic: "American Revolution", subject: "History", accuracy: 76, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 15, name: "Dulani Weerasinghe", grade: "Grade 11",
    subjects: ["History", "Civics"], avgScore: 62,
    trend: "up", papersCompleted: 14, lastActive: "Today, 7:30 AM",
    status: "Active", parentEmail: "weerasinghe.d@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "Civics", rank: 14,
    subjectScores: [{ subject: "History", score: 60 }, { subject: "Civics", score: 64 }],
    scoreHistory: [{ month: "Dec", score: 57 }, { month: "Jan", score: 59 }, { month: "Feb", score: 62 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "Civics Quiz", score: 65, timestamp: "Today, 7:30 AM", subject: "Civics" },
      { id: "2", type: "paper", title: "History Paper", score: 60, timestamp: "2 days ago", subject: "History" },
      { id: "3", type: "note", title: "Notes: Law & Justice", timestamp: "3 days ago", subject: "Civics" },
      { id: "4", type: "quiz", title: "History Quiz", score: 59, timestamp: "4 days ago", subject: "History" },
      { id: "5", type: "paper", title: "Civics Paper", score: 63, timestamp: "5 days ago", subject: "Civics" },
    ],
    topicPerformance: [
      { topic: "Law & Justice", subject: "Civics", accuracy: 64, status: "Average" },
      { topic: "Colonialism", subject: "History", accuracy: 58, status: "Weak" },
      { topic: "The Great Depression", subject: "History", accuracy: 55, status: "Weak" },
    ],
    riskSignals: [],
  },
  {
    id: 16, name: "Chamara Fernando", grade: "Grade 11",
    subjects: ["History", "Geography", "Civics"], avgScore: 57,
    trend: "down", papersCompleted: 9, lastActive: "5 days ago",
    status: "At Risk", parentEmail: "chamara.f@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "History", rank: 15,
    subjectScores: [{ subject: "History", score: 62 }, { subject: "Geography", score: 53 }, { subject: "Civics", score: 56 }],
    scoreHistory: [{ month: "Dec", score: 65 }, { month: "Jan", score: 61 }, { month: "Feb", score: 57 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 62, timestamp: "5 days ago", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 53, timestamp: "1 week ago", subject: "Geography" },
      { id: "3", type: "quiz", title: "Civics Quiz", score: 56, timestamp: "10 days ago", subject: "Civics" },
      { id: "4", type: "note", title: "Notes: Colonialism", timestamp: "12 days ago", subject: "History" },
      { id: "5", type: "paper", title: "History Paper", score: 60, timestamp: "2 weeks ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "Ecosystems", subject: "Geography", accuracy: 49, status: "Weak" },
      { topic: "Citizenship", subject: "Civics", accuracy: 53, status: "Weak" },
      { topic: "Map Skills", subject: "Geography", accuracy: 56, status: "Weak" },
      { topic: "The Great Depression", subject: "History", accuracy: 59, status: "Weak" },
    ],
    riskSignals: [
      { label: "Score Declining", severity: "high", detail: "Dropped 8% over last 3 months" },
      { label: "Reduced Activity", severity: "medium", detail: "Last active 5 days ago" },
    ],
  },
  {
    id: 17, name: "Hasini Kumari", grade: "Grade 11",
    subjects: ["History", "Civics"], avgScore: 80,
    trend: "stable", papersCompleted: 19, lastActive: "Today, 8:15 AM",
    status: "Active", parentEmail: "kumari.hasini@email.com",
    enrollmentDate: "Jan 2023", strongSubject: "Civics", rank: 6,
    subjectScores: [{ subject: "History", score: 78 }, { subject: "Civics", score: 82 }],
    scoreHistory: [{ month: "Dec", score: 79 }, { month: "Jan", score: 80 }, { month: "Feb", score: 80 }],
    recentActivity: [
      { id: "1", type: "paper", title: "Civics Paper", score: 83, timestamp: "Today, 8:15 AM", subject: "Civics" },
      { id: "2", type: "quiz", title: "History Quiz", score: 78, timestamp: "Yesterday", subject: "History" },
      { id: "3", type: "note", title: "Notes: Int. Relations", timestamp: "2 days ago", subject: "Civics" },
      { id: "4", type: "paper", title: "History Paper", score: 77, timestamp: "3 days ago", subject: "History" },
      { id: "5", type: "quiz", title: "Civics Quiz", score: 81, timestamp: "4 days ago", subject: "Civics" },
    ],
    topicPerformance: [
      { topic: "International Relations", subject: "Civics", accuracy: 84, status: "Strong" },
      { topic: "Human Rights", subject: "Civics", accuracy: 82, status: "Strong" },
      { topic: "Civil Rights Movement", subject: "History", accuracy: 77, status: "Average" },
    ],
    riskSignals: [],
  },
  {
    id: 18, name: "Sachith Bandara", grade: "Grade 10",
    subjects: ["History", "Geography"], avgScore: 69,
    trend: "stable", papersCompleted: 14, lastActive: "Yesterday, 6:00 PM",
    status: "Active", parentEmail: "bandara.s@email.com",
    enrollmentDate: "Jan 2024", strongSubject: "History", rank: 11,
    subjectScores: [{ subject: "History", score: 72 }, { subject: "Geography", score: 66 }],
    scoreHistory: [{ month: "Dec", score: 68 }, { month: "Jan", score: 69 }, { month: "Feb", score: 69 }],
    recentActivity: [
      { id: "1", type: "quiz", title: "History Quiz", score: 73, timestamp: "Yesterday, 6:00 PM", subject: "History" },
      { id: "2", type: "paper", title: "Geography Paper", score: 66, timestamp: "3 days ago", subject: "Geography" },
      { id: "3", type: "note", title: "Notes: WWI", timestamp: "4 days ago", subject: "History" },
      { id: "4", type: "quiz", title: "Geography Quiz", score: 65, timestamp: "5 days ago", subject: "Geography" },
      { id: "5", type: "paper", title: "History Paper", score: 71, timestamp: "6 days ago", subject: "History" },
    ],
    topicPerformance: [
      { topic: "World War I", subject: "History", accuracy: 74, status: "Average" },
      { topic: "Physical Geography", subject: "Geography", accuracy: 64, status: "Average" },
      { topic: "Urban Geography", subject: "Geography", accuracy: 62, status: "Average" },
    ],
    riskSignals: [],
  },
];

// ─── Class Analytics ─────────────────────────────────────────────

export const analyticsData = {
  averageMastery: 72,
  mostImproved: { topic: "Democracy", change: "+11%" },
  atRiskCount: 4,
  peakDay: "Tuesday",
  avgScore: 72,
  completionRate: 84,
  subjectBreakdown: [
    { subject: "History", score: 74, color: "bg-purple-500" },
    { subject: "Geography", score: 68, color: "bg-blue-500" },
    { subject: "Civics", score: 71, color: "bg-indigo-500" },
  ],
  atRiskSignals: [
    { student: "Tharushi Wickrama", signal: "Inactive 10+ days", time: "10 days ago" },
    { student: "Dineth Rajapaksha", signal: "Score declining fast", time: "Today" },
    { student: "Nisali Dissanayake", signal: "Missing assignments", time: "4 days ago" },
    { student: "Chamara Fernando", signal: "Consistent low scores", time: "5 days ago" },
  ],
};

export const teacherAnalytics: TeacherAnalyticsData = {
  overviewStats: {
    totalStudents: 18,
    activeThisWeek: 14,
    classAverage: 72,
    papersCompletedThisWeek: 47,
    pendingReviews: 8,
    studentsAtRisk: 4,
  },
  scoreDistribution: [
    { range: "0–50%",   count: 2 },
    { range: "50–60%",  count: 2 },
    { range: "60–70%",  count: 3 },
    { range: "70–80%",  count: 5 },
    { range: "80–90%",  count: 4 },
    { range: "90–100%", count: 2 },
  ],
  subjectPerformance: [
    { subject: "History",   classAvg: 74, studentsCount: 18 },
    { subject: "Civics",    classAvg: 71, studentsCount: 14 },
    { subject: "Geography", classAvg: 68, studentsCount: 16 },
  ],
  topPerformers: [
    { rank: 1,  studentId: 9,  name: "Amara Liyanage",      avgScore: 93, papersCompleted: 26, strongSubject: "Civics" },
    { rank: 2,  studentId: 1,  name: "Aisha Fernando",      avgScore: 91, papersCompleted: 24, strongSubject: "History" },
    { rank: 3,  studentId: 13, name: "Ruwani Perera",       avgScore: 88, papersCompleted: 22, strongSubject: "Geography" },
    { rank: 4,  studentId: 3,  name: "Nethmi Silva",        avgScore: 85, papersCompleted: 21, strongSubject: "Civics" },
    { rank: 5,  studentId: 8,  name: "Isuru Bandara",       avgScore: 82, papersCompleted: 20, strongSubject: "Geography" },
    { rank: 6,  studentId: 17, name: "Hasini Kumari",       avgScore: 80, papersCompleted: 19, strongSubject: "Civics" },
    { rank: 7,  studentId: 2,  name: "Kavindu Perera",      avgScore: 78, papersCompleted: 18, strongSubject: "History" },
    { rank: 8,  studentId: 14, name: "Thilina Jayasuriya",  avgScore: 76, papersCompleted: 17, strongSubject: "History" },
    { rank: 9,  studentId: 5,  name: "Sithumi Jayawardena", avgScore: 74, papersCompleted: 17, strongSubject: "History" },
    { rank: 10, studentId: 12, name: "Pavan Rathnayake",    avgScore: 71, papersCompleted: 16, strongSubject: "Civics" },
  ],
  weeklyActivity: [
    { week: "Week 1", studyHours: 52, papersCompleted: 38, avgEngagement: 72 },
    { week: "Week 2", studyHours: 61, papersCompleted: 44, avgEngagement: 78 },
    { week: "Week 3", studyHours: 48, papersCompleted: 35, avgEngagement: 68 },
    { week: "Week 4", studyHours: 67, papersCompleted: 47, avgEngagement: 81 },
  ],
  topicDifficulty: [
    { topic: "Map Skills",          subject: "Geography", avgAccuracy: 58, studentsAttempted: 16, studentsStruggling: 7, status: "Hard",   strugglingStudentIds: [4, 7, 11, 16, 10, 6, 18] },
    { topic: "Ecosystems",          subject: "Geography", avgAccuracy: 61, studentsAttempted: 14, studentsStruggling: 5, status: "Hard",   strugglingStudentIds: [4, 7, 11, 16, 10] },
    { topic: "Government Systems",  subject: "Civics",    avgAccuracy: 64, studentsAttempted: 14, studentsStruggling: 4, status: "Hard",   strugglingStudentIds: [4, 11, 16, 7] },
    { topic: "Industrial Rev.",     subject: "History",   avgAccuracy: 68, studentsAttempted: 18, studentsStruggling: 3, status: "Medium", strugglingStudentIds: [4, 7, 15] },
    { topic: "World War I",         subject: "History",   avgAccuracy: 72, studentsAttempted: 18, studentsStruggling: 3, status: "Medium", strugglingStudentIds: [4, 11, 7] },
    { topic: "Urban Geography",     subject: "Geography", avgAccuracy: 70, studentsAttempted: 16, studentsStruggling: 3, status: "Medium", strugglingStudentIds: [5, 10, 18] },
    { topic: "Law & Justice",       subject: "Civics",    avgAccuracy: 74, studentsAttempted: 14, studentsStruggling: 2, status: "Medium", strugglingStudentIds: [6, 15] },
    { topic: "Cold War",            subject: "History",   avgAccuracy: 81, studentsAttempted: 18, studentsStruggling: 1, status: "Easy",   strugglingStudentIds: [4] },
    { topic: "World War II",        subject: "History",   avgAccuracy: 84, studentsAttempted: 18, studentsStruggling: 0, status: "Easy",   strugglingStudentIds: [] },
    { topic: "Democracy",           subject: "Civics",    avgAccuracy: 85, studentsAttempted: 14, studentsStruggling: 0, status: "Easy",   strugglingStudentIds: [] },
  ],
  studyTimeStats: {
    myClassAvg: 4.2,
    platformAvg: 3.8,
    highEngagement: 6,
    mediumEngagement: 8,
    lowEngagement: 4,
  },
};
