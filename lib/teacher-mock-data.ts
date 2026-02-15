export const teacherProfile = {
  name: "Ms. Sarah Johnson",
  initials: "SJ",
  email: "sarah.johnson@evalora.edu",
  role: "Senior Teacher",
  primarySubject: "Mathematics",
  department: "Science & Mathematics",
};

export const dashboardStats = {
  totalStudents: 32,
  classCount: 3,
  classAverage: 72,
  averageTrend: "+4%",
  pendingReviews: 5,
  recentUploads: 12,
  uploadPeriod: "Last 30 days",
};

export const students = [
  { id: 1, name: "Aisha Fernando", grade: "Grade 10", subjects: ["Mathematics", "Physics"], avgScore: 91, status: "Excellent" as const, lastActive: "Today, 9:15 AM" },
  { id: 2, name: "Kavindu Perera", grade: "Grade 10", subjects: ["Mathematics", "Chemistry"], avgScore: 78, status: "Active" as const, lastActive: "Today, 8:40 AM" },
  { id: 3, name: "Nethmi Silva", grade: "Grade 11", subjects: ["Mathematics"], avgScore: 85, status: "Excellent" as const, lastActive: "Yesterday" },
  { id: 4, name: "Dineth Rajapaksha", grade: "Grade 10", subjects: ["Mathematics", "Physics", "Biology"], avgScore: 52, status: "At Risk" as const, lastActive: "3 days ago" },
  { id: 5, name: "Sithumi Jayawardena", grade: "Grade 11", subjects: ["Mathematics", "Chemistry"], avgScore: 74, status: "Active" as const, lastActive: "Today, 10:02 AM" },
  { id: 6, name: "Ravindu Mendis", grade: "Grade 10", subjects: ["Mathematics", "Physics"], avgScore: 68, status: "Active" as const, lastActive: "Yesterday" },
  { id: 7, name: "Tharushi Wickrama", grade: "Grade 11", subjects: ["Mathematics"], avgScore: 45, status: "At Risk" as const, lastActive: "5 days ago" },
  { id: 8, name: "Isuru Bandara", grade: "Grade 10", subjects: ["Mathematics", "Biology"], avgScore: 82, status: "Excellent" as const, lastActive: "Today, 7:55 AM" },
];

export const todayGlance = {
  newUploads: 3,
  submissions: 8,
  nextClass: "Grade 10 - Mathematics at 1:30 PM",
};

export const subjectTopics: Record<string, string[]> = {
  History: ["Ancient Civilizations", "Medieval Period", "World Wars", "Industrial Revolution", "Cold War Era", "Sri Lankan History"],
};

export const subjects = ["History"];

export const analyticsData = {
  averageMastery: 74,
  mostImproved: { topic: "Algebra", change: "+9%" },
  atRiskCount: 4,
  peakDay: "Tuesday",
  avgScore: 72,
  completionRate: 84,
  subjectBreakdown: [
    { subject: "Mathematics", score: 82, color: "bg-purple-600" },
    { subject: "Physics", score: 69, color: "bg-blue-500" },
    { subject: "Chemistry", score: 61, color: "bg-amber-500" },
    { subject: "Biology", score: 75, color: "bg-emerald-500" },
  ],
  atRiskSignals: [
    { student: "Dineth Rajapaksha", signal: "Score dropped below 55% in Mathematics", time: "2 hours ago" },
    { student: "Tharushi Wickrama", signal: "Hasn't logged in for 5 days", time: "5 hours ago" },
    { student: "Dineth Rajapaksha", signal: "Failed 3 consecutive quizzes", time: "1 day ago" },
    { student: "Tharushi Wickrama", signal: "Incomplete assignments piling up", time: "2 days ago" },
  ],
};
