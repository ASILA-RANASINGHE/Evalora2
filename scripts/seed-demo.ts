/**
 * Demo data seed for student005@gmail.com
 * Run with: npx tsx scripts/seed-demo.ts
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load env files from project root
dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL / DIRECT_URL not set");

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0]);

async function main() {
  // ── 1. Find student ──────────────────────────────────────────────
  const student = await prisma.profile.findFirst({
    where: { email: "student005@gmail.com" },
    include: { studentDetails: true },
  });

  if (!student) {
    console.error("❌ student005@gmail.com not found in database");
    process.exit(1);
  }

  const studentId = student.id;
  console.log(`✅ Found student: ${student.firstName} ${student.lastName} (${studentId})`);
  console.log(`   Grade: ${student.studentDetails?.grade}`);

  // ── 2. Find an admin user to be the content creator ──────────────
  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  const teacher = await prisma.profile.findFirst({ where: { role: "TEACHER" } });

  if (!admin) {
    console.error("❌ No admin user found — need an admin to create content");
    process.exit(1);
  }
  console.log(`✅ Using admin: ${admin.firstName} ${admin.lastName} (${admin.id})`);

  // ── 3. Find or create subjects ────────────────────────────────────
  const subjectNames = ["History", "English", "Geography", "Civic Education", "Health"];
  const subjects: Record<string, string> = {};

  for (const name of subjectNames) {
    let subject = await prisma.subject.findFirst({ where: { name } });
    if (!subject) {
      const code = name.replace(/\s+/g, "_").toUpperCase().slice(0, 8);
      subject = await prisma.subject.create({ data: { name, code } });
      console.log(`  Created subject: ${name}`);
    }
    subjects[name] = subject.id;
  }
  console.log(`✅ Subjects ready`);

  // ── 4. Create approved quizzes (Grade 10 / PUBLIC) ────────────────
  const quizDefs = [
    { title: "World War II — Causes & Events", subject: "History", topic: "WWII", duration: 20, qCount: 10 },
    { title: "Grammar & Comprehension Test", subject: "English", topic: "Grammar", duration: 15, qCount: 10 },
    { title: "Climate & Ecosystems Quiz", subject: "Geography", topic: "Climate", duration: 15, qCount: 10 },
    { title: "Human Rights & Citizenship", subject: "Civic Education", topic: "Human Rights", duration: 20, qCount: 10 },
    { title: "Nutrition & Body Systems", subject: "Health", topic: "Nutrition", duration: 15, qCount: 8 },
  ];

  const quizzes: { id: string; qCount: number }[] = [];

  for (const def of quizDefs) {
    const existing = await prisma.quiz.findFirst({
      where: { title: def.title, createdById: admin.id },
    });
    if (existing) {
      quizzes.push({ id: existing.id, qCount: def.qCount });
      console.log(`  Quiz already exists: ${def.title}`);
      continue;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: def.title,
        grade: "Grade 10",
        subjectId: subjects[def.subject],
        topic: def.topic,
        type: "TOPIC_BASED",
        duration: def.duration,
        visibility: "PUBLIC",
        status: "APPROVED",
        createdById: admin.id,
      },
    });

    // Create questions
    const options = ["Option A", "Option B", "Option C", "Option D"];
    const questions = Array.from({ length: def.qCount }, (_, i) => ({
      quizId: quiz.id,
      text: `Sample question ${i + 1} for ${def.topic}?`,
      type: "MCQ" as const,
      options,
      correctAnswer: "Option A",
      order: i,
    }));

    await prisma.quizQuestion.createMany({ data: questions });
    quizzes.push({ id: quiz.id, qCount: def.qCount });
    console.log(`  Created quiz: ${def.title} (${def.qCount} questions)`);
  }
  console.log(`✅ Quizzes ready`);

  // ── 5. Create quiz attempts for student ───────────────────────────
  const quizScores = [88, 74, 91, 65, 82, 77, 95, 60, 85, 70, 55, 93];
  const now = new Date();

  for (let i = 0; i < quizzes.length; i++) {
    const quiz = quizzes[i];
    // 2–3 attempts per quiz
    const attemptCount = i % 2 === 0 ? 3 : 2;

    for (let a = 0; a < attemptCount; a++) {
      const score = quizScores[(i * 3 + a) % quizScores.length];
      const daysAgo = (i * 7) + (a * 2) + 1;
      const startedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const submittedAt = new Date(startedAt.getTime() + 18 * 60 * 1000);

      // Skip if already exists
      const exists = await prisma.quizAttempt.findFirst({
        where: { quizId: quiz.id, studentId, submittedAt: { not: null } },
      });
      if (exists) continue;

      await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          studentId,
          score,
          answers: {},
          startedAt,
          submittedAt,
        },
      });
    }
  }
  console.log(`✅ Quiz attempts seeded`);

  // ── 6. Create an approved paper (Grade 10) ────────────────────────
  let paper = await prisma.paper.findFirst({
    where: { title: "Grade 10 History — Term 1 Exam", createdById: admin.id },
  });

  if (!paper) {
    paper = await prisma.paper.create({
      data: {
        title: "Grade 10 History — Term 1 Exam",
        subjectId: subjects["History"],
        term: "TERM_1",
        grade: "Grade 10",
        year: 2026,
        duration: 120,
        isModel: true,
        mcqCount: 10,
        mcqMarks: 1,
        essayCount: 5,
        essayMarks: 10,
        tfCount: 0,
        fbCount: 0,
        totalMarks: 60,
        passPercentage: 35,
        visibility: "PUBLIC",
        status: "APPROVED",
        createdById: admin.id,
      },
    });

    // MCQ questions
    for (let i = 0; i < 10; i++) {
      await prisma.paperQuestion.create({
        data: {
          paperId: paper.id,
          text: `MCQ ${i + 1}: History question about WWII?`,
          type: "MCQ",
          points: 1,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          order: i,
          questionNumber: 1,
          subLabel: String.fromCharCode(97 + i),
        },
      });
    }

    // Essay questions
    const essayTopics = [
      "Explain the causes of World War II.",
      "Describe the major consequences of World War II.",
      "What role did nationalism play in 20th century conflicts?",
      "Discuss the formation of the United Nations.",
      "Compare the political systems of the Allied powers.",
    ];
    for (let i = 0; i < 5; i++) {
      await prisma.paperQuestion.create({
        data: {
          paperId: paper.id,
          text: essayTopics[i],
          type: "SHORT",
          points: 10,
          options: [],
          correctAnswer: "Model answer: " + essayTopics[i],
          order: 10 + i,
          questionNumber: 2 + i,
        },
      });
    }
    console.log(`  Created paper: ${paper.title}`);
  } else {
    console.log(`  Paper already exists: ${paper.title}`);
  }
  console.log(`✅ Paper ready`);

  // ── 7. Create paper attempt ───────────────────────────────────────
  const existingAttempt = await prisma.paperAttempt.findFirst({
    where: { paperId: paper.id, studentId, submittedAt: { not: null } },
  });

  if (!existingAttempt) {
    const paperQuestions = await prisma.paperQuestion.findMany({
      where: { paperId: paper.id },
    });

    const answers: Record<string, string> = {};
    const results: Record<string, unknown>[] = [];
    let totalScore = 0;

    for (const q of paperQuestions) {
      if (q.type === "MCQ") {
        answers[q.id] = "Option A";
        const correct = q.correctAnswer === "Option A";
        results.push({ questionId: q.id, type: "MCQ", awarded: correct ? q.points : 0, max: q.points, correct });
        if (correct) totalScore += q.points;
      } else {
        answers[q.id] = "The consequences of World War II were transformative. Politically, economically, and socially the world changed dramatically after 1945.";
        results.push({ questionId: q.id, type: "SHORT", awarded: 7, max: q.points, aiScore: 7, aiComment: "Good answer with key points covered." });
        totalScore += 7;
      }
    }

    const startedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const submittedAt = new Date(startedAt.getTime() + 90 * 60 * 1000);

    await prisma.paperAttempt.create({
      data: {
        paperId: paper.id,
        studentId,
        score: totalScore,
        timeTaken: 90 * 60,
        answers,
        flagged: [],
        results,
        startedAt,
        submittedAt,
      },
    });
    console.log(`  Created paper attempt (score: ${totalScore}/60)`);
  } else {
    console.log(`  Paper attempt already exists`);
  }
  console.log(`✅ Paper attempt seeded`);

  // ── 8. Create approved notes ──────────────────────────────────────
  const noteDefs = [
    { title: "The Rise of Fascism in Europe", subject: "History", topic: "Fascism", grade: "Grade 10" },
    { title: "The Cold War Overview", subject: "History", topic: "Cold War", grade: "Grade 10" },
    { title: "Essay Writing Skills", subject: "English", topic: "Writing", grade: "Grade 10" },
    { title: "Climate Change & Geography", subject: "Geography", topic: "Climate", grade: "Grade 10" },
    { title: "Democratic Rights & Duties", subject: "Civic Education", topic: "Democracy", grade: "Grade 10" },
  ];

  for (const nd of noteDefs) {
    const exists = await prisma.note.findFirst({ where: { title: nd.title, createdById: admin.id } });
    if (exists) continue;

    await prisma.note.create({
      data: {
        title: nd.title,
        subjectId: subjects[nd.subject],
        grade: nd.grade,
        topic: nd.topic,
        content: `<h2>${nd.title}</h2><p>This is a comprehensive study note on <strong>${nd.topic}</strong> for Grade 10 students. It covers the key concepts, historical context, and important facts you need to know for your examinations.</p><h3>Key Points</h3><ul><li>First important concept related to ${nd.topic}</li><li>Second critical point students should understand</li><li>Third key takeaway from this topic</li></ul><p>Study this material carefully and ensure you understand all the underlying principles.</p>`,
        visibility: "PUBLIC",
        status: "APPROVED",
        createdById: admin.id,
      },
    });
    console.log(`  Created note: ${nd.title}`);
  }
  console.log(`✅ Notes seeded`);

  // ── 9. Create short notes ─────────────────────────────────────────
  const shortNoteDefs = [
    { title: "WWII Key Dates Cheat Sheet", subject: "History", topic: "WWII", grade: "Grade 10" },
    { title: "Grammar Rules Quick Reference", subject: "English", topic: "Grammar", grade: "Grade 10" },
    { title: "World Rivers & Mountains", subject: "Geography", topic: "Physical Geography", grade: "Grade 10" },
  ];

  for (const sn of shortNoteDefs) {
    const exists = await prisma.shortNote.findFirst({ where: { title: sn.title, createdById: admin.id } });
    if (exists) continue;

    await prisma.shortNote.create({
      data: {
        title: sn.title,
        subjectId: subjects[sn.subject],
        grade: sn.grade,
        topic: sn.topic,
        content: `<h3>${sn.title}</h3><p><strong>Quick reference card for ${sn.topic}.</strong></p><ul><li>Key fact 1</li><li>Key fact 2</li><li>Key fact 3</li><li>Key fact 4</li></ul>`,
        visibility: "PUBLIC",
        status: "APPROVED",
        createdById: admin.id,
      },
    });
    console.log(`  Created short note: ${sn.title}`);
  }
  console.log(`✅ Short notes seeded`);

  // ── 10. Update StudentProgress ────────────────────────────────────
  await prisma.studentProgress.upsert({
    where: { studentId },
    create: {
      studentId,
      quizzesCompleted: 13,
      papersAttempted: 1,
      averageScore: 78.4,
      studyStreak: 7,
      totalPoints: 2340,
      totalLearningMin: 460,
      topicsMastered: 5,
    },
    update: {
      quizzesCompleted: 13,
      papersAttempted: 1,
      averageScore: 78.4,
      studyStreak: 7,
      totalPoints: 2340,
      totalLearningMin: 460,
      topicsMastered: 5,
    },
  });
  console.log(`✅ StudentProgress updated`);

  // ── 11. Create notifications ──────────────────────────────────────
  const existingNotifs = await prisma.notification.count({ where: { userId: studentId } });
  if (existingNotifs === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: studentId, title: "New Quiz Available!", message: "A new History quiz has been published for Grade 10.", type: "info", isRead: false },
        { userId: studentId, title: "Paper Results Ready", message: "Your Grade 10 History Term 1 Exam has been graded.", type: "success", isRead: false },
        { userId: studentId, title: "Study Streak: 7 Days!", message: "You've maintained a 7-day study streak. Keep it up!", type: "achievement", isRead: true },
        { userId: studentId, title: "New Note Published", message: "A new note on 'The Cold War Overview' is now available.", type: "info", isRead: true },
      ],
    });
    console.log(`✅ Notifications seeded`);
  } else {
    console.log(`  Notifications already exist (${existingNotifs})`);
  }

  // ── 12. Link student to teacher (if teacher exists) ───────────────
  if (teacher) {
    const linkExists = await prisma.teacherStudentLink.findFirst({
      where: { teacherId: teacher.id, studentId },
    });
    if (!linkExists) {
      await prisma.teacherStudentLink.create({
        data: { teacherId: teacher.id, studentId },
      });
      console.log(`✅ Linked to teacher: ${teacher.firstName} ${teacher.lastName}`);
    } else {
      console.log(`  Teacher link already exists`);
    }
  }

  console.log("\n🎉 Demo data seeding complete!");
  console.log(`   Student: ${student.firstName} ${student.lastName} (${student.email})`);
  console.log(`   Quizzes: ${quizzes.length} quizzes with multiple attempts`);
  console.log(`   Papers: 1 paper with 1 attempt`);
  console.log(`   Notes: ${noteDefs.length} notes`);
  console.log(`   Short Notes: ${shortNoteDefs.length} short notes`);
  console.log(`   Progress: streak=7, points=2340, avg=78.4%`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
