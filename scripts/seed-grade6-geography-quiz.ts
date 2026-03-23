import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "Geography" } });
  if (!subject) throw new Error('Subject "Geography" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 6 Geography", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 6 Geography",
      subjectId: subject.id,
      topic: "Geography",
      type: "UNIT_REVIEW",
      duration: 30,
      visibility: "PUBLIC",
      status: "APPROVED",
      createdById: admin.id,
      questions: {
        create: [
          {
            text: "What is the smallest administrative unit in Sri Lanka's hierarchy?",
            type: "MCQ",
            points: 1,
            options: [
              "District",
              "Province",
              "Grama Niladhari Division",
              "Divisional Secretariat Division",
            ],
            correctAnswer: "Grama Niladhari Division",
            order: 0,
          },
          {
            text: "Which instrument is used to find direction accurately?",
            type: "MCQ",
            points: 1,
            options: ["Thermometer", "Anemometer", "Rain gauge", "Compass"],
            correctAnswer: "Compass",
            order: 1,
          },
          {
            text: "What is the condition of the atmosphere at a particular place over a short period of time called?",
            type: "MCQ",
            points: 1,
            options: ["Climate", "Weather", "Temperature", "Rainfall"],
            correctAnswer: "Weather",
            order: 2,
          },
          {
            text: "Which instrument measures rainfall, and what unit is used?",
            type: "MCQ",
            points: 1,
            options: [
              "Thermometer / Celsius",
              "Anemometer / km per hour",
              "Rain gauge / millimetres",
              "Wind indicator / degrees",
            ],
            correctAnswer: "Rain gauge / millimetres",
            order: 3,
          },
          {
            text: "Which of the following is a man-made feature of the landscape?",
            type: "MCQ",
            points: 1,
            options: ["River", "Forest", "Highland", "Road"],
            correctAnswer: "Road",
            order: 4,
          },
          {
            text: "What is the narrow strip of sea separating Sri Lanka from India called, and how wide is it?",
            type: "MCQ",
            points: 1,
            options: [
              "Bay of Bengal / 50 km",
              "Arabian Sea / 20 km",
              "Palk Strait / 32 km",
              "Bay of Mannar / 45 km",
            ],
            correctAnswer: "Palk Strait / 32 km",
            order: 5,
          },
          {
            text: "Which city is the main commercial centre of Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: ["Kandy", "Colombo", "Galle", "Jaffna"],
            correctAnswer: "Colombo",
            order: 6,
          },
          {
            text: "What are the three methods of responsible waste management mentioned in the lesson?",
            type: "MCQ",
            points: 1,
            options: [
              "Burn, bury, ignore",
              "Reuse, recycle, reduce",
              "Collect, sort, sell",
              "Compost, dump, recycle",
            ],
            correctAnswer: "Reuse, recycle, reduce",
            order: 7,
          },
          {
            text: "Which of the following animals helps paddy farmers by eating insects harmful to rice crops?",
            type: "MCQ",
            points: 1,
            options: ["Crow", "Bat", "Dragonfly", "Parrot"],
            correctAnswer: "Dragonfly",
            order: 8,
          },
          {
            text: "Which is the largest island in the world by land area?",
            type: "MCQ",
            points: 1,
            options: ["Madagascar", "Cuba", "Sri Lanka", "Greenland"],
            correctAnswer: "Greenland",
            order: 9,
          },
        ],
      },
    },
    include: { questions: true },
  });

  console.log(`✅ Quiz created successfully!`);
  console.log(`   ID: ${quiz.id}`);
  console.log(`   Title: ${quiz.title}`);
  console.log(`   Questions: ${quiz.questions.length}`);
  console.log(`   Duration: ${quiz.duration} minutes`);
  console.log(`   Status: ${quiz.status}`);
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
