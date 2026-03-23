export const parentProfile = {
  name: "Mr. Ranjith Wijesinghe",
  initials: "RW",
  email: "parent005@gmail.com",
  role: "Parent / Guardian",
  preferredContact: "Email",
};

export const childAccounts = [
  {
    id: 1,
    name: "Lia Fernando",
    initials: "LF",
    grade: "Grade 10",
    status: "Active" as const,
    avgScore: 78,
    subjects: 5,
    lastActive: "Today, 8:30 AM",
    color: "from-purple-500 to-indigo-500",
    progressSummary: {
      scoreTrend: +6,
      studyTimeThisWeek: 7.5,
      studyTimeLastWeek: 5.0,
      currentStreak: 7,
      weakTopicsCount: 2,
      topSubject: { name: "Geography", score: 91 },
      weakSubject: { name: "Civic Education", score: 65 },
      scoreHistory: [{ month: "Jan", avgScore: 70 }, { month: "Feb", avgScore: 74 }, { month: "Mar", avgScore: 78 }],
    },
  },
];

export const upcomingMilestones = [
  { id: 1, title: "History — WWII Quiz", child: "Lia Fernando", date: "Tomorrow, 10:00 AM", type: "quiz" as const },
  { id: 2, title: "Term 1 Progress Reports", child: "Lia Fernando", date: "Friday, Mar 28", type: "report" as const },
  { id: 3, title: "Grade 10 History Term 1 Exam Review", child: "Lia Fernando", date: "Mon, Mar 31", type: "assignment" as const },
  { id: 4, title: "English Grammar Quiz", child: "Lia Fernando", date: "Wed, Apr 2", type: "quiz" as const },
  { id: 5, title: "Parent-Teacher Conference", child: "Lia Fernando", date: "Fri, Apr 4", type: "event" as const },
];
