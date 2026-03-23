/**
 * Demo data seed for parent005@gmail.com
 * Ensures parent-student link exists and parent has notifications
 * Run with: npx tsx scripts/seed-parent-demo.ts
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL / DIRECT_URL not set");

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0]);

async function main() {
  // ── Find parent ───────────────────────────────────────────────────
  const parent = await prisma.profile.findFirst({
    where: { email: "parent005@gmail.com" },
    include: { parentDetails: true },
  });

  if (!parent) {
    console.error("❌ parent005@gmail.com not found in database");
    process.exit(1);
  }

  const parentId = parent.id;
  console.log(`✅ Found parent: ${parent.firstName} ${parent.lastName} (${parentId})`);

  // ── Find student (Lia Fernando) ───────────────────────────────────
  const student = await prisma.profile.findFirst({
    where: { email: "student005@gmail.com" },
    include: { studentDetails: true },
  });

  if (!student) {
    console.error("❌ student005@gmail.com not found");
    process.exit(1);
  }

  const studentId = student.id;
  console.log(`✅ Found student: ${student.firstName} ${student.lastName} (${studentId})`);

  // ── Ensure parent-student link exists ─────────────────────────────
  const existingLink = await prisma.parentStudentLink.findFirst({
    where: { parentId, studentId },
  });

  if (!existingLink) {
    await prisma.parentStudentLink.create({
      data: { parentId, studentId },
    });
    console.log(`✅ Created parent-student link`);
  } else {
    console.log(`  Parent-student link already exists`);
  }

  // ── Seed parent notifications ─────────────────────────────────────
  const existingNotifs = await prisma.notification.count({ where: { userId: parentId } });

  if (existingNotifs === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: parentId,
          title: "Lia completed a quiz!",
          message: "Your child Lia Fernando scored 91% on 'Climate & Ecosystems Quiz'.",
          type: "success",
          isRead: false,
        },
        {
          userId: parentId,
          title: "Paper result available",
          message: "Lia's Grade 10 History Term 1 Exam result is now available to view.",
          type: "info",
          isRead: false,
        },
        {
          userId: parentId,
          title: "7-Day Study Streak!",
          message: "Lia has been studying consistently for 7 days in a row.",
          type: "achievement",
          isRead: true,
        },
        {
          userId: parentId,
          title: "Weekly Progress Report",
          message: "Lia's weekly average score is 78.4%. She has completed 13 quizzes this month.",
          type: "info",
          isRead: true,
        },
      ],
    });
    console.log(`✅ Parent notifications seeded`);
  } else {
    console.log(`  Parent already has ${existingNotifs} notifications`);
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log("\n🎉 Parent demo data ready!");
  console.log(`   Parent: ${parent.firstName} ${parent.lastName} (${parent.email})`);
  console.log(`   Linked student: ${student.firstName} ${student.lastName} (${student.email})`);
  console.log(`   Student grade: ${student.studentDetails?.grade}`);
  console.log(`   The parent dashboard will show Lia's progress, quiz attempts, and paper results`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
