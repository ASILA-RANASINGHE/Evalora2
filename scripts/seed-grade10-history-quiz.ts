import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 10 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 10 History",
      subjectId: subject.id,
      topic: "History",
      type: "UNIT_REVIEW",
      duration: 30,
      visibility: "PUBLIC",
      status: "APPROVED",
      createdById: admin.id,
      questions: {
        create: [
          {
            text: "What is the oldest known local literary source in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: ["Mahawamsa", "Rajawaliya", "Deepawamsa", "Nikaya Sangraha"],
            correctAnswer: "Deepawamsa",
            order: 0,
          },
          {
            text: "Approximately how long ago did humans first settle in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "50,000 years ago",
              "80,000 years ago",
              "125,000 years ago",
              "200,000 years ago",
            ],
            correctAnswer: "125,000 years ago",
            order: 1,
          },
          {
            text: "What were the small chieftains who ruled areas in the pre-state era called?",
            type: "MCQ",
            points: 1,
            options: ["Gamikas", "Gahapathi", "Mahaparumaka", "Parumaka"],
            correctAnswer: "Parumaka",
            order: 2,
          },
          {
            text: "Which king first selected Anuradhapura as the ruling center and developed it into a city?",
            type: "MCQ",
            points: 1,
            options: [
              "Devanampiyatissa",
              "Dutugemunu",
              "Pandukabhaya",
              "Vasabha",
            ],
            correctAnswer: "Pandukabhaya",
            order: 3,
          },
          {
            text: "What was the academic study of ancient coins called?",
            type: "MCQ",
            points: 1,
            options: ["Epigraphy", "Archaeology", "Numismatics", "Anthropology"],
            correctAnswer: "Numismatics",
            order: 4,
          },
          {
            text: "The Sigiriya water fountains operate using which scientific principle?",
            type: "MCQ",
            points: 1,
            options: [
              "Thermal expansion",
              "Magnetic force",
              "Natural water pressure",
              "Wind power",
            ],
            correctAnswer: "Natural water pressure",
            order: 5,
          },
          {
            text: "Who was the first king to unite the entire country of Sri Lanka according to literary sources?",
            type: "MCQ",
            points: 1,
            options: [
              "Vasabha",
              "Pandukabhaya",
              "Devanampiyatissa",
              "Dutugemunu",
            ],
            correctAnswer: "Dutugemunu",
            order: 6,
          },
          {
            text: "The Renaissance began in which city?",
            type: "MCQ",
            points: 1,
            options: ["Rome", "Venice", "Florence", "Constantinople"],
            correctAnswer: "Florence",
            order: 7,
          },
          {
            text: "When did Lorenzo De Almeida first arrive in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: ["1498", "1521", "1505", "1543"],
            correctAnswer: "1505",
            order: 8,
          },
          {
            text: "Which Kandyan king defeated the Portuguese in the Battle of Danthure in 1594?",
            type: "MCQ",
            points: 1,
            options: [
              "King Senarath",
              "King Rajasinghe II",
              "King Jayaweera Bandara",
              "King Vimaladharmasooriya I",
            ],
            correctAnswer: "King Vimaladharmasooriya I",
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
