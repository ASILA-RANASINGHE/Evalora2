import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 8 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 8 History",
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
            text: "What is the term for the water management methods used by ancient Sri Lankans to build tanks, canals, and ponds?",
            type: "MCQ",
            points: 1,
            options: [
              "Clay Technology",
              "Water Technology",
              "Metal Technology",
              "Agricultural Technology",
            ],
            correctAnswer: "Water Technology",
            order: 0,
          },
          {
            text: "Which king is credited as the pioneer of major reservoir (large tank) construction in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "King Mahasen",
              "King Parakramabahu I",
              "King Vasabha",
              "King Dathusena",
            ],
            correctAnswer: "King Vasabha",
            order: 1,
          },
          {
            text: "What is the bisokotuwa?",
            type: "MCQ",
            points: 1,
            options: [
              "A type of canal used to link tanks",
              "A stone chamber inside a tank that regulates water flow",
              "A breakwater that protects the dam from waves",
              "A type of ancient pond",
            ],
            correctAnswer: "A stone chamber inside a tank that regulates water flow",
            order: 2,
          },
          {
            text: "Who established the Kandyan Kingdom as its first king?",
            type: "MCQ",
            points: 1,
            options: [
              "Jayaweera Bandara",
              "King Wimaladharmasooriya I",
              "Sena Sammatha Wickramabahu",
              "Karalliyadde Bandara",
            ],
            correctAnswer: "Sena Sammatha Wickramabahu",
            order: 3,
          },
          {
            text: "Which battle did King Wimaladharmasooriya I win against the Portuguese in 1594?",
            type: "MCQ",
            points: 1,
            options: [
              "Battle of Mulleriya",
              "Battle of Gannoruwa",
              "Battle of Randeniwela",
              "Battle of Danture",
            ],
            correctAnswer: "Battle of Danture",
            order: 4,
          },
          {
            text: "The Renaissance began in which country?",
            type: "MCQ",
            points: 1,
            options: ["England", "France", "Italy", "Germany"],
            correctAnswer: "Italy",
            order: 5,
          },
          {
            text: "Who invented the printing press during the Renaissance era?",
            type: "MCQ",
            points: 1,
            options: [
              "Galileo Galilei",
              "Johannes Gutenberg",
              "Nicolaus Copernicus",
              "Martin Luther",
            ],
            correctAnswer: "Johannes Gutenberg",
            order: 6,
          },
          {
            text: "Which Portuguese explorer first arrived in Sri Lanka in 1505?",
            type: "MCQ",
            points: 1,
            options: [
              "Vasco da Gama",
              "Bartolomeu Dias",
              "Lorenzo de Almeida",
              "Francisco Almeida",
            ],
            correctAnswer: "Lorenzo de Almeida",
            order: 7,
          },
          {
            text: 'What was the "Vijayaba Kollaya"?',
            type: "MCQ",
            points: 1,
            options: [
              "A peace treaty between Kotte and Portugal",
              "A battle between Seethawaka and the Portuguese",
              "The killing of King Vijayabahu VI and the splitting of the Kotte Kingdom",
              "The signing over of Kotte to the Portuguese",
            ],
            correctAnswer:
              "The killing of King Vijayabahu VI and the splitting of the Kotte Kingdom",
            order: 8,
          },
          {
            text: 'Which art form from the Kandyan period is known as "Udarata Natum"?',
            type: "MCQ",
            points: 1,
            options: [
              "Ivory Carving",
              "Kandyan Painting",
              "Woodcarving",
              "Kandyan Dancing",
            ],
            correctAnswer: "Kandyan Dancing",
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
