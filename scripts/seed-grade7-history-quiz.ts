import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 7 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 7 History",
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
            text: "What was the most important economic activity in ancient Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: ["Trade", "Craft industries", "Agriculture", "Fishing"],
            correctAnswer: "Agriculture",
            order: 0,
          },
          {
            text: 'What is a "chena" in the context of ancient Sri Lankan farming?',
            type: "MCQ",
            points: 1,
            options: [
              "A type of irrigation canal",
              "A forest area cleared and prepared for cultivation",
              "A paddy field near a river",
              "A storage barn for harvested grain",
            ],
            correctAnswer: "A forest area cleared and prepared for cultivation",
            order: 1,
          },
          {
            text: "Which cooperative system involved villagers helping each other voluntarily without payment?",
            type: "MCQ",
            points: 1,
            options: [
              "Gamika system",
              "Aththam system",
              "Chaturangani system",
              "Rataladdan system",
            ],
            correctAnswer: "Aththam system",
            order: 2,
          },
          {
            text: "Which ports were important trading centres in ancient Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "Galle and Colombo",
              "Trincomalee and Jaffna",
              "Mahatittha and Gokanna",
              "Mantai and Hambantota",
            ],
            correctAnswer: "Mahatittha and Gokanna",
            order: 3,
          },
          {
            text: "King Manawamma restored which important practice during his reign?",
            type: "MCQ",
            points: 1,
            options: [
              "Chena cultivation",
              "Buddhist ordination",
              "Hereditary succession to the throne",
              "External trade with China",
            ],
            correctAnswer: "Hereditary succession to the throne",
            order: 4,
          },
          {
            text: "How long did Chola rule over Lanka last before Vijayabahu I defeated them?",
            type: "MCQ",
            points: 1,
            options: [
              "About 40 years",
              "About 70 years",
              "About 100 years",
              "About 50 years",
            ],
            correctAnswer: "About 70 years",
            order: 5,
          },
          {
            text: "How many Sri Lankan sites has UNESCO recognised as World Heritage Sites?",
            type: "MCQ",
            points: 1,
            options: ["Four", "Five", "Seven", "Six"],
            correctAnswer: "Six",
            order: 6,
          },
          {
            text: "What type of heritage refers to things that CANNOT be physically touched, such as folk songs and customs?",
            type: "MCQ",
            points: 1,
            options: [
              "National heritage",
              "Tangible heritage",
              "Intangible heritage",
              "Archaeological heritage",
            ],
            correctAnswer: "Intangible heritage",
            order: 7,
          },
          {
            text: "Which ancient Greek city state is credited with developing the concept of direct democracy?",
            type: "MCQ",
            points: 1,
            options: ["Sparta", "Macedonia", "Crete", "Athens"],
            correctAnswer: "Athens",
            order: 8,
          },
          {
            text: "What remarkable engineering structure did the Romans build to carry fresh water into the city across roughly 100 kilometres?",
            type: "MCQ",
            points: 1,
            options: ["A canal", "An aqueduct", "A viaduct", "A reservoir"],
            correctAnswer: "An aqueduct",
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
