export const parentProfile = {
  name: "Mr. David Fernando",
  initials: "DF",
  email: "david.fernando@email.com",
  role: "Parent / Guardian",
  preferredContact: "Email",
};

export const childAccounts = [
  {
    id: 1,
    name: "Aisha Fernando",
    initials: "AF",
    grade: "Grade 11",
    status: "Active" as const,
    avgScore: 87,
    subjects: 5,
    lastActive: "Today, 9:15 AM",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 2,
    name: "Ravindu Fernando",
    initials: "RF",
    grade: "Grade 9",
    status: "Active" as const,
    avgScore: 74,
    subjects: 4,
    lastActive: "Today, 8:40 AM",
    color: "from-blue-500 to-cyan-500",
  },
];

export const upcomingMilestones = [
  { id: 1, title: "Mathematics Quiz — Algebra", child: "Aisha Fernando", date: "Tomorrow, 10:00 AM", type: "quiz" as const },
  { id: 2, title: "Term 1 Progress Reports", child: "Both", date: "Friday, Feb 14", type: "report" as const },
  { id: 3, title: "Science Fair Project Submission", child: "Ravindu Fernando", date: "Mon, Feb 17", type: "assignment" as const },
  { id: 4, title: "Physics Unit Test", child: "Aisha Fernando", date: "Wed, Feb 19", type: "quiz" as const },
  { id: 5, title: "Parent-Teacher Conference", child: "Both", date: "Fri, Feb 21", type: "event" as const },
];
