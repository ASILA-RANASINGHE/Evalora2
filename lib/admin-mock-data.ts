// Mock data for Admin Dashboard

export type UserRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: "active" | "inactive";
}

export interface TeacherStudentRelationship {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "note" | "paper" | "quiz";
  subject: string;
  author: string;
  createdAt: string;
  visibility: "public" | "private" | "admin";
  status: "approved" | "pending" | "flagged";
}

export const SUBJECTS = [
  "History",
  "Geography",
  "Health",
] as const;

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  History: [
    "Ancient Civilizations",
    "Medieval Period",
    "World Wars",
    "Industrial Revolution",
    "Cold War Era",
    "Sri Lankan History",
  ],
  Geography: [
    "Physical Geography",
    "Climate & Weather",
    "Population Studies",
    "Urban Geography",
    "Economic Geography",
    "Map Skills",
    "Ecosystems",
  ],
  Health: [
    "Human Body Systems",
    "Nutrition & Diet",
    "Mental Health",
    "Physical Fitness",
    "Disease Prevention",
    "First Aid",
    "Reproductive Health",
    "Substance Abuse",
    "Personal Hygiene",
    "Environmental Health",
  ],
};

export const mockUsers: MockUser[] = [
  { id: "u1", firstName: "Aanya", lastName: "Perera", email: "aanya.perera@evalora.lk", role: "STUDENT", createdAt: "2025-09-01", status: "active" },
  { id: "u2", firstName: "Kavindu", lastName: "Silva", email: "kavindu.silva@evalora.lk", role: "STUDENT", createdAt: "2025-09-02", status: "active" },
  { id: "u3", firstName: "Nethmi", lastName: "Fernando", email: "nethmi.fernando@evalora.lk", role: "STUDENT", createdAt: "2025-09-03", status: "active" },
  { id: "u4", firstName: "Dinesh", lastName: "Rajapaksa", email: "dinesh.rajapaksa@evalora.lk", role: "STUDENT", createdAt: "2025-09-05", status: "active" },
  { id: "u5", firstName: "Sachini", lastName: "Jayawardena", email: "sachini.j@evalora.lk", role: "STUDENT", createdAt: "2025-09-10", status: "inactive" },
  { id: "u6", firstName: "Ruwan", lastName: "Wickramasinghe", email: "ruwan.w@evalora.lk", role: "TEACHER", createdAt: "2025-08-15", status: "active" },
  { id: "u7", firstName: "Chamari", lastName: "Bandara", email: "chamari.b@evalora.lk", role: "TEACHER", createdAt: "2025-08-16", status: "active" },
  { id: "u8", firstName: "Prasad", lastName: "Kumara", email: "prasad.k@evalora.lk", role: "TEACHER", createdAt: "2025-08-17", status: "active" },
  { id: "u9", firstName: "Dilini", lastName: "Herath", email: "dilini.h@evalora.lk", role: "PARENT", createdAt: "2025-09-05", status: "active" },
  { id: "u10", firstName: "Sunil", lastName: "Perera", email: "sunil.p@evalora.lk", role: "PARENT", createdAt: "2025-09-06", status: "active" },
  { id: "u11", firstName: "Malini", lastName: "De Silva", email: "malini.ds@evalora.lk", role: "PARENT", createdAt: "2025-09-07", status: "active" },
  { id: "u12", firstName: "Senuka", lastName: "Admin", email: "senuka@evalora.lk", role: "ADMIN", createdAt: "2025-01-01", status: "active" },
  { id: "u13", firstName: "Tharushi", lastName: "Gamage", email: "tharushi.g@evalora.lk", role: "STUDENT", createdAt: "2025-09-12", status: "active" },
  { id: "u14", firstName: "Isuru", lastName: "Dissanayake", email: "isuru.d@evalora.lk", role: "TEACHER", createdAt: "2025-08-20", status: "active" },
  { id: "u15", firstName: "Nimal", lastName: "Sirisena", email: "nimal.s@evalora.lk", role: "PARENT", createdAt: "2025-09-15", status: "inactive" },
];

export const mockRelationships: TeacherStudentRelationship[] = [
  { id: "r1", teacherId: "u6", teacherName: "Ruwan Wickramasinghe", studentId: "u1", studentName: "Aanya Perera", status: "approved", requestedAt: "2025-09-05" },
  { id: "r2", teacherId: "u6", teacherName: "Ruwan Wickramasinghe", studentId: "u2", studentName: "Kavindu Silva", status: "approved", requestedAt: "2025-09-06" },
  { id: "r3", teacherId: "u7", teacherName: "Chamari Bandara", studentId: "u3", studentName: "Nethmi Fernando", status: "pending", requestedAt: "2025-10-01" },
  { id: "r4", teacherId: "u7", teacherName: "Chamari Bandara", studentId: "u4", studentName: "Dinesh Rajapaksa", status: "pending", requestedAt: "2025-10-02" },
  { id: "r5", teacherId: "u8", teacherName: "Prasad Kumara", studentId: "u5", studentName: "Sachini Jayawardena", status: "rejected", requestedAt: "2025-09-20" },
  { id: "r6", teacherId: "u14", teacherName: "Isuru Dissanayake", studentId: "u13", studentName: "Tharushi Gamage", status: "pending", requestedAt: "2025-10-05" },
];

export const mockContent: ContentItem[] = [
  { id: "c1", title: "Introduction to Algebra", type: "note", subject: "Mathematics", author: "Ruwan Wickramasinghe", createdAt: "2025-09-10", visibility: "public", status: "approved" },
  { id: "c2", title: "Newton's Laws of Motion", type: "note", subject: "Physics", author: "Chamari Bandara", createdAt: "2025-09-12", visibility: "public", status: "approved" },
  { id: "c3", title: "Periodic Table Overview", type: "note", subject: "Chemistry", author: "Prasad Kumara", createdAt: "2025-09-15", visibility: "admin", status: "pending" },
  { id: "c4", title: "Cell Division Explained", type: "note", subject: "Biology", author: "Isuru Dissanayake", createdAt: "2025-09-18", visibility: "public", status: "flagged" },
  { id: "c5", title: "Grade 10 Mathematics Paper", type: "paper", subject: "Mathematics", author: "Ruwan Wickramasinghe", createdAt: "2025-09-20", visibility: "public", status: "approved" },
  { id: "c6", title: "Physics Mid-Term Paper", type: "paper", subject: "Physics", author: "Chamari Bandara", createdAt: "2025-09-22", visibility: "public", status: "approved" },
  { id: "c7", title: "Chemistry Final Exam", type: "paper", subject: "Chemistry", author: "Prasad Kumara", createdAt: "2025-10-01", visibility: "admin", status: "pending" },
  { id: "c8", title: "Algebra Basics Quiz", type: "quiz", subject: "Mathematics", author: "Ruwan Wickramasinghe", createdAt: "2025-09-25", visibility: "public", status: "approved" },
  { id: "c9", title: "Forces and Motion Quiz", type: "quiz", subject: "Physics", author: "Chamari Bandara", createdAt: "2025-09-28", visibility: "public", status: "flagged" },
  { id: "c10", title: "Organic Chemistry Quiz", type: "quiz", subject: "Chemistry", author: "Prasad Kumara", createdAt: "2025-10-02", visibility: "admin", status: "pending" },
];

export const dashboardStats = {
  users: {
    students: 156,
    teachers: 12,
    parents: 89,
    admins: 3,
  },
  content: {
    notes: 342,
    papers: 128,
    quizzes: 215,
    pendingReviews: 5,
  },
  system: {
    serverStatus: "operational" as const,
    databaseHealth: "healthy" as const,
    storageUsed: 67,
    storageTotal: 100,
    uptime: "99.9%",
    lastBackup: "2025-10-10 03:00 AM",
  },
};

export const adminProfile = {
  name: "Senuka Admin",
  email: "senuka@evalora.lk",
  role: "ADMIN" as const,
  region: "Sri Lanka",
  department: "Platform Management",
  joinedAt: "2025-01-01",
};
