import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found.");

  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 11 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 11 History",
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
            text: "Where did the Industrial Revolution first begin?",
            type: "MCQ",
            points: 1,
            options: ["France", "Germany", "Britain", "Holland"],
            correctAnswer: "Britain",
            order: 0,
          },
          {
            text: 'Who invented the spinning machine called the "Jenny" in 1764?',
            type: "MCQ",
            points: 1,
            options: [
              "Richard Arkwright",
              "Samuel Crompton",
              "Edmund Cartwright",
              "James Hargreaves",
            ],
            correctAnswer: "James Hargreaves",
            order: 1,
          },
          {
            text: "What was the primary reason the British were interested in the Trincomalee harbour?",
            type: "MCQ",
            points: 1,
            options: [
              "It was rich in cinnamon",
              "It was a safe shelter for ships and a naval base",
              "It was already under Dutch control",
              "It was close to India's western coast",
            ],
            correctAnswer: "It was a safe shelter for ships and a naval base",
            order: 2,
          },
          {
            text: "The Upcountry Treaty of 1815 was signed between the British and whom?",
            type: "MCQ",
            points: 1,
            options: [
              "King Sri Wickrama Rajasinghe",
              "The upcountry aristocrats",
              "The Buddhist monks",
              "The coastal governors",
            ],
            correctAnswer: "The upcountry aristocrats",
            order: 3,
          },
          {
            text: "What was the main cause of the 1848 struggle in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "Loss of the king",
              "Religious conflicts",
              "New government taxes",
              "Dutch invasion",
            ],
            correctAnswer: "New government taxes",
            order: 4,
          },
          {
            text: "Who led the Hindu Renaissance movement in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "Anagarika Dharmapala",
              "M.C. Siddhi Lebbe",
              "Arumuga Navalar",
              "Sir Henry Steel Olcott",
            ],
            correctAnswer: "Arumuga Navalar",
            order: 5,
          },
          {
            text: "What major change did the Donoughmore Constitution of 1931 introduce?",
            type: "MCQ",
            points: 1,
            options: [
              "It abolished the legislative council",
              "It granted universal franchise",
              "It gave the governor more power",
              "It introduced the nationalist representative system",
            ],
            correctAnswer: "It granted universal franchise",
            order: 6,
          },
          {
            text: "The Boston Tea Party of 1773 is considered the beginning of which revolution?",
            type: "MCQ",
            points: 1,
            options: [
              "The French Revolution",
              "The Russian Revolution",
              "The American Revolution",
              "The Industrial Revolution",
            ],
            correctAnswer: "The American Revolution",
            order: 7,
          },
          {
            text: "What was the immediate trigger for World War I?",
            type: "MCQ",
            points: 1,
            options: [
              "Germany's invasion of France",
              "The assassination of Archduke Franz Ferdinand",
              "Britain's declaration of war on Austria",
              "Russia's attack on Serbia",
            ],
            correctAnswer: "The assassination of Archduke Franz Ferdinand",
            order: 8,
          },
          {
            text: "When was the United Nations Organization officially established?",
            type: "MCQ",
            points: 1,
            options: [
              "10 January 1920",
              "14 July 1945",
              "24 October 1945",
              "4 February 1948",
            ],
            correctAnswer: "24 October 1945",
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
