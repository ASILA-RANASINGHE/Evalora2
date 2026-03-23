import { prisma } from "../lib/prisma";

// Normalize StudentDetails grades from "6" → "Grade 6" format
async function main() {
  const students = await prisma.studentDetails.findMany({
    select: { id: true, grade: true },
  });

  let updated = 0;
  for (const student of students) {
    if (/^\d+$/.test(student.grade)) {
      const newGrade = `Grade ${student.grade}`;
      await prisma.studentDetails.update({
        where: { id: student.id },
        data: { grade: newGrade },
      });
      console.log(`  ✓ Student ${student.id}: "${student.grade}" → "${newGrade}"`);
      updated++;
    }
  }

  console.log(`\n✅ Backfilled ${updated} student grade(s).`);
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
