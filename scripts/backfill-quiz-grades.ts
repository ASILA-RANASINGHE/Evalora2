import { prisma } from "../lib/prisma";

// Backfill grade field on seeded quizzes based on their title prefix
async function main() {
  const quizzes = await prisma.quiz.findMany({
    where: { grade: null },
    select: { id: true, title: true },
  });

  const gradeMap: Record<string, string> = {
    "Grade 6":  "Grade 6",
    "Grade 7":  "Grade 7",
    "Grade 8":  "Grade 8",
    "Grade 9":  "Grade 9",
    "Grade 10": "Grade 10",
    "Grade 11": "Grade 11",
  };

  let updated = 0;
  for (const quiz of quizzes) {
    const matchedGrade = Object.keys(gradeMap).find((g) =>
      quiz.title.startsWith(g)
    );
    if (matchedGrade) {
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { grade: gradeMap[matchedGrade] },
      });
      console.log(`  ✓ "${quiz.title}" → ${gradeMap[matchedGrade]}`);
      updated++;
    }
  }

  console.log(`\n✅ Backfilled ${updated} quiz(zes).`);
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
