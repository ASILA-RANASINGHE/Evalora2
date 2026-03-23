import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 9 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 9 History",
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
            text: "Why did the Dutch originally sail to Asia?",
            type: "MCQ",
            points: 1,
            options: [
              "To spread Christianity",
              "They were banned from Lisbon harbour and cut off from Asian goods",
              "To help the Kandyan king",
              "To fight the French",
            ],
            correctAnswer: "They were banned from Lisbon harbour and cut off from Asian goods",
            order: 0,
          },
          {
            text: "What was the VOC?",
            type: "MCQ",
            points: 1,
            options: [
              "A Portuguese trading fort",
              "A Kandyan military unit",
              "The Dutch East India Trade Company",
              "A British colonial commission",
            ],
            correctAnswer: "The Dutch East India Trade Company",
            order: 1,
          },
          {
            text: "What did King Rajasinghe II offer the Dutch in exchange for military help?",
            type: "MCQ",
            points: 1,
            options: [
              "Gold and elephants",
              "Exclusive rights over the cinnamon trade",
              "Control of Kandy",
              "A harbour on the western coast",
            ],
            correctAnswer: "Exclusive rights over the cinnamon trade",
            order: 2,
          },
          {
            text: 'What does the Sinhala saying "Inguru dee miris gaththa wage" mean?',
            type: "MCQ",
            points: 1,
            options: [
              "Victory over all enemies",
              "A fair trade between two nations",
              "An exchange of ginger for chilli — little real improvement",
              "The king always wins",
            ],
            correctAnswer: "An exchange of ginger for chilli — little real improvement",
            order: 3,
          },
          {
            text: "Who arrived in Sri Lanka in 1880 and helped establish Buddhist schools?",
            type: "MCQ",
            points: 1,
            options: [
              "Anagarika Dharmapala",
              "Arumuga Navalar",
              "Henry Steel Olcott",
              "Migettuwatte Gunananda Thero",
            ],
            correctAnswer: "Henry Steel Olcott",
            order: 4,
          },
          {
            text: "What was the immediate cause of the 1857 Sepoy Rebellion in India?",
            type: "MCQ",
            points: 1,
            options: [
              "A new tax on salt",
              "Rumours that rifle cartridges were greased with beef or pork fat",
              "The partition of Bengal",
              "The arrest of Mahatma Gandhi",
            ],
            correctAnswer: "Rumours that rifle cartridges were greased with beef or pork fat",
            order: 5,
          },
          {
            text: "What was the Dandi March?",
            type: "MCQ",
            points: 1,
            options: [
              "A protest march against the partition of India",
              "Gandhi's march to defy salt production laws",
              "A military parade by the Indian National Army",
              "A march demanding voting rights",
            ],
            correctAnswer: "Gandhi's march to defy salt production laws",
            order: 6,
          },
          {
            text: "What major change did the Donoughmore Constitution of 1931 introduce?",
            type: "MCQ",
            points: 1,
            options: [
              "A cabinet system of government",
              "The abolition of the Senate",
              "Universal franchise for all men and women over 21",
              "An executive presidency",
            ],
            correctAnswer: "Universal franchise for all men and women over 21",
            order: 7,
          },
          {
            text: "Who became the first woman Prime Minister in the world?",
            type: "MCQ",
            points: 1,
            options: [
              "Indira Gandhi",
              "Queen Elizabeth II",
              "Mrs. Sirimavo Bandaranaike",
              "Madam Blavatsky",
            ],
            correctAnswer: "Mrs. Sirimavo Bandaranaike",
            order: 8,
          },
          {
            text: "What is the most distinctive feature of Sri Lanka's 1978 Constitution?",
            type: "MCQ",
            points: 1,
            options: [
              "The introduction of free education",
              "The creation of the Senate",
              "The introduction of the Executive Presidency",
              "The abolition of communal representation",
            ],
            correctAnswer: "The introduction of the Executive Presidency",
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
