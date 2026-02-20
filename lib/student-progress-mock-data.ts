// ─── Types ──────────────────────────────────────────────────────

export interface OverviewStats {
  papersDone: number;
  papersWeekly: number;
  averageScore: number;
  scoreTrend: number;
  studyStreak: number;
  bestStreak: number;
  rank: number;
  totalStudents: number;
  percentile: number;
}

export interface ScoreDataPoint {
  date: string;
  overall: number;
  history: number;
  mathematics: number;
  science: number;
  english: number;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
}

export interface SubjectScore {
  subject: string;
  yourScore: number;
  classAvg: number;
  papersAttempted: number;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  accuracy: number;
  questionsAttempted: number;
  status: "Mastered" | "Learning" | "Needs Work" | "Weak";
}

export interface QuestionTypeStats {
  type: string;
  attempted: number;
  accuracy: number;
  color: string;
}

export interface WeakArea {
  topic: string;
  subject: string;
  accuracy: number;
  target: number;
  gap: number;
  daysSincePracticed: number;
}

export interface ComparativeRow {
  subject: string;
  yourScore: number;
  classAvg: number;
  percentileRank: number;
}

export interface TimeSlotPerformance {
  hour: string;
  avgScore: number;
}

export interface NoteEngagement {
  topic: string;
  subject: string;
  notesRead: number;
  totalNotes: number;
  timeSpentMin: number;
  completionPct: number;
  status: "complete" | "in-progress" | "not-started";
}

export interface RiskAlert {
  level: "critical" | "warning" | "on-track";
  title: string;
  reason: string;
  action: string;
}

export interface InsightMessage {
  category: "performance" | "topic" | "time" | "comparative" | "notes";
  message: string;
}

export interface PracticeRecommendation {
  subject: string;
  topic: string;
  steps: string[];
  estimatedMinutes: number;
  expectedImprovement: string;
  priority: "high" | "medium" | "low";
}

// ─── Mock Data ──────────────────────────────────────────────────

export const overviewStats: OverviewStats = {
  papersDone: 28,
  papersWeekly: 5,
  averageScore: 74,
  scoreTrend: 3.2,
  studyStreak: 7,
  bestStreak: 14,
  rank: 8,
  totalStudents: 45,
  percentile: 82,
};

export const scoreHistory: ScoreDataPoint[] = [
  { date: "Jan 6", overall: 68, history: 65, mathematics: 72, science: 64, english: 71 },
  { date: "Jan 13", overall: 71, history: 68, mathematics: 74, science: 67, english: 75 },
  { date: "Jan 20", overall: 66, history: 62, mathematics: 70, science: 63, english: 69 },
  { date: "Jan 27", overall: 73, history: 70, mathematics: 76, science: 71, english: 75 },
  { date: "Feb 3", overall: 70, history: 67, mathematics: 73, science: 68, english: 72 },
  { date: "Feb 10", overall: 75, history: 72, mathematics: 78, science: 73, english: 77 },
  { date: "Feb 17", overall: 72, history: 69, mathematics: 75, science: 70, english: 74 },
  { date: "Feb 24", overall: 77, history: 74, mathematics: 80, science: 75, english: 79 },
  { date: "Mar 3", overall: 74, history: 71, mathematics: 77, science: 72, english: 76 },
  { date: "Mar 10", overall: 79, history: 76, mathematics: 82, science: 77, english: 81 },
  { date: "Mar 17", overall: 76, history: 73, mathematics: 79, science: 74, english: 78 },
  { date: "Mar 24", overall: 80, history: 78, mathematics: 83, science: 78, english: 81 },
];

function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const start = new Date("2026-01-05");
  for (let i = 0; i < 84; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayOfWeek = d.getDay();
    let minutes = 0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      minutes = Math.floor(Math.random() * 40);
    } else {
      minutes = Math.floor(Math.random() * 100) + 10;
    }
    if (Math.random() < 0.15) minutes = 0;
    days.push({
      date: d.toISOString().slice(0, 10),
      minutes,
    });
  }
  return days;
}
export const heatmapData: HeatmapDay[] = generateHeatmap();

export const subjectScores: SubjectScore[] = [
  { subject: "History", yourScore: 78, classAvg: 71, papersAttempted: 8 },
  { subject: "Mathematics", yourScore: 82, classAvg: 68, papersAttempted: 10 },
  { subject: "Science", yourScore: 71, classAvg: 73, papersAttempted: 6 },
  { subject: "English", yourScore: 79, classAvg: 72, papersAttempted: 7 },
  { subject: "Geography", yourScore: 65, classAvg: 70, papersAttempted: 4 },
];

export const topicMastery: TopicMastery[] = [
  { topic: "Ancient Civilizations of Sri Lanka", subject: "History", accuracy: 92, questionsAttempted: 45, status: "Mastered" },
  { topic: "Medieval Kingdoms of Sri Lanka", subject: "History", accuracy: 86, questionsAttempted: 38, status: "Mastered" },
  { topic: "Colonial Era in Sri Lanka", subject: "History", accuracy: 78, questionsAttempted: 30, status: "Learning" },
  { topic: "Independence Movement", subject: "History", accuracy: 72, questionsAttempted: 25, status: "Learning" },
  { topic: "Ancient Egypt and Mesopotamia", subject: "History", accuracy: 64, questionsAttempted: 20, status: "Needs Work" },
  { topic: "World War I", subject: "History", accuracy: 58, questionsAttempted: 22, status: "Needs Work" },
  { topic: "World War II", subject: "History", accuracy: 48, questionsAttempted: 15, status: "Weak" },
  { topic: "Cold War Era", subject: "History", accuracy: 42, questionsAttempted: 10, status: "Weak" },
  { topic: "Algebra", subject: "Mathematics", accuracy: 88, questionsAttempted: 50, status: "Mastered" },
  { topic: "Geometry", subject: "Mathematics", accuracy: 81, questionsAttempted: 35, status: "Learning" },
  { topic: "Trigonometry", subject: "Mathematics", accuracy: 65, questionsAttempted: 28, status: "Needs Work" },
  { topic: "Calculus", subject: "Mathematics", accuracy: 52, questionsAttempted: 18, status: "Weak" },
  { topic: "Forces & Motion", subject: "Science", accuracy: 76, questionsAttempted: 32, status: "Learning" },
  { topic: "Electricity", subject: "Science", accuracy: 60, questionsAttempted: 20, status: "Needs Work" },
  { topic: "Ecosystem", subject: "Science", accuracy: 84, questionsAttempted: 28, status: "Learning" },
];

export const questionTypeStats: QuestionTypeStats[] = [
  { type: "MCQ", attempted: 280, accuracy: 78, color: "#7c3aed" },
  { type: "Structured", attempted: 120, accuracy: 65, color: "#6366f1" },
  { type: "True/False", attempted: 90, accuracy: 82, color: "#a78bfa" },
];

export const weakAreas: WeakArea[] = [
  { topic: "Cold War Era", subject: "History", accuracy: 42, target: 75, gap: 33, daysSincePracticed: 18 },
  { topic: "World War II", subject: "History", accuracy: 48, target: 75, gap: 27, daysSincePracticed: 12 },
  { topic: "Calculus", subject: "Mathematics", accuracy: 52, target: 75, gap: 23, daysSincePracticed: 9 },
  { topic: "World War I", subject: "History", accuracy: 58, target: 75, gap: 17, daysSincePracticed: 7 },
  { topic: "Electricity", subject: "Science", accuracy: 60, target: 75, gap: 15, daysSincePracticed: 5 },
];

export const comparativeData: ComparativeRow[] = [
  { subject: "History", yourScore: 78, classAvg: 71, percentileRank: 78 },
  { subject: "Mathematics", yourScore: 82, classAvg: 68, percentileRank: 88 },
  { subject: "Science", yourScore: 71, classAvg: 73, percentileRank: 45 },
  { subject: "English", yourScore: 79, classAvg: 72, percentileRank: 76 },
  { subject: "Geography", yourScore: 65, classAvg: 70, percentileRank: 38 },
];

export const timePerformance: TimeSlotPerformance[] = [
  { hour: "6AM", avgScore: 58 },
  { hour: "7AM", avgScore: 62 },
  { hour: "8AM", avgScore: 68 },
  { hour: "9AM", avgScore: 72 },
  { hour: "10AM", avgScore: 76 },
  { hour: "11AM", avgScore: 74 },
  { hour: "12PM", avgScore: 70 },
  { hour: "1PM", avgScore: 66 },
  { hour: "2PM", avgScore: 71 },
  { hour: "3PM", avgScore: 78 },
  { hour: "4PM", avgScore: 82 },
  { hour: "5PM", avgScore: 84 },
  { hour: "6PM", avgScore: 80 },
  { hour: "7PM", avgScore: 75 },
  { hour: "8PM", avgScore: 68 },
  { hour: "9PM", avgScore: 60 },
];

export const notesEngagement: NoteEngagement[] = [
  { topic: "Ancient Civilizations of Sri Lanka", subject: "History", notesRead: 4, totalNotes: 4, timeSpentMin: 48, completionPct: 100, status: "complete" },
  { topic: "Medieval Kingdoms of Sri Lanka", subject: "History", notesRead: 3, totalNotes: 4, timeSpentMin: 35, completionPct: 75, status: "in-progress" },
  { topic: "Colonial Era in Sri Lanka", subject: "History", notesRead: 2, totalNotes: 3, timeSpentMin: 22, completionPct: 67, status: "in-progress" },
  { topic: "Independence Movement", subject: "History", notesRead: 1, totalNotes: 3, timeSpentMin: 12, completionPct: 33, status: "in-progress" },
  { topic: "World War II", subject: "History", notesRead: 0, totalNotes: 2, timeSpentMin: 0, completionPct: 0, status: "not-started" },
  { topic: "Cold War Era", subject: "History", notesRead: 0, totalNotes: 2, timeSpentMin: 0, completionPct: 0, status: "not-started" },
  { topic: "Algebra", subject: "Mathematics", notesRead: 5, totalNotes: 5, timeSpentMin: 60, completionPct: 100, status: "complete" },
  { topic: "Geometry", subject: "Mathematics", notesRead: 3, totalNotes: 4, timeSpentMin: 40, completionPct: 75, status: "in-progress" },
  { topic: "Trigonometry", subject: "Mathematics", notesRead: 1, totalNotes: 3, timeSpentMin: 15, completionPct: 33, status: "in-progress" },
  { topic: "Forces & Motion", subject: "Science", notesRead: 2, totalNotes: 3, timeSpentMin: 25, completionPct: 67, status: "in-progress" },
  { topic: "Electricity", subject: "Science", notesRead: 0, totalNotes: 2, timeSpentMin: 0, completionPct: 0, status: "not-started" },
];

export const riskAlerts: RiskAlert[] = [
  { level: "critical", title: "Cold War Era - History", reason: "Score dropped 15% over last 3 attempts. No practice in 18 days. Currently 33% below target.", action: "Practice Now" },
  { level: "critical", title: "World War II - History", reason: "3 consecutive declining scores. No notes read. 27% below target.", action: "Start Review" },
  { level: "warning", title: "Calculus - Mathematics", reason: "Below class average by 12%. Declining trend over past 2 weeks.", action: "Review Topics" },
  { level: "warning", title: "Electricity - Science", reason: "No practice in 5 days. Notes not started. Below target by 15%.", action: "Read Notes" },
  { level: "on-track", title: "Ancient Civilizations - History", reason: "Consistently above 90%. Improving steadily over 4 weeks.", action: "Keep Going" },
  { level: "on-track", title: "Algebra - Mathematics", reason: "88% accuracy. Above class average by 20%. All notes completed.", action: "Maintain" },
  { level: "on-track", title: "Medieval Kingdoms - History", reason: "Score improved by 12% this month. Above target at 86%.", action: "Well Done" },
];

export const insights: InsightMessage[] = [
  { category: "performance", message: "Your average score improved by 3.2% this week. You're on a strong upward trend!" },
  { category: "topic", message: "You haven't practiced Cold War Era in 18 days. A quick quiz could prevent forgetting." },
  { category: "time", message: "You perform best between 4PM-6PM with an average of 83%. Try scheduling study sessions then." },
  { category: "comparative", message: "You're in the top 12% for Mathematics among your class. Outstanding work!" },
  { category: "notes", message: "Students who complete all notes before quizzing score 15% higher. You have 8 unread notes." },
];

export const practiceRecommendations: PracticeRecommendation[] = [
  {
    subject: "History",
    topic: "Cold War Era",
    steps: ["Read the 2 available notes on Cold War Era", "Take the topic quiz (15 questions)", "Review incorrect answers and retry"],
    estimatedMinutes: 25,
    expectedImprovement: "+12% accuracy",
    priority: "high",
  },
  {
    subject: "History",
    topic: "World War II",
    steps: ["Read the summary notes first", "Practice 10 MCQ questions", "Focus on dates and key events"],
    estimatedMinutes: 20,
    expectedImprovement: "+10% accuracy",
    priority: "high",
  },
  {
    subject: "Mathematics",
    topic: "Calculus",
    steps: ["Review differentiation rules notes", "Attempt 5 structured problems", "Check solutions and note mistakes"],
    estimatedMinutes: 30,
    expectedImprovement: "+8% accuracy",
    priority: "medium",
  },
];
