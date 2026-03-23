import { prisma } from "../lib/prisma";

async function main() {
  const subject = await prisma.subject.findUnique({ where: { name: "History" } });
  if (!subject) throw new Error('Subject "History" not found in DB. Make sure it exists.');

  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN profile found. Log in as admin first.");

  // Check if quiz already exists to avoid duplicates
  const existing = await prisma.quiz.findFirst({
    where: { title: "Grade 6 History", createdById: admin.id },
  });
  if (existing) {
    console.log("Quiz already exists:", existing.id);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: "Grade 6 History",
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
            text: "What are the two main categories of sources used to study history?",
            type: "MCQ",
            points: 1,
            options: [
              "Primary and secondary sources",
              "Literary and archaeological sources",
              "Written and verbal sources",
              "Ancient and modern sources",
            ],
            correctAnswer: "Literary and archaeological sources",
            order: 0,
          },
          {
            text: "Who wrote the Mahawamsa and in what century?",
            type: "MCQ",
            points: 1,
            options: [
              "Unknown author, 4th Century AD",
              "King Parakramabahu I, 12th Century AD",
              "Mahanama Thero, 5th Century AD",
              "Mahanama Thero, 3rd Century BC",
            ],
            correctAnswer: "Mahanama Thero, 5th Century AD",
            order: 1,
          },
          {
            text: 'What does "Anno Domini (A.D.)" refer to?',
            type: "MCQ",
            points: 1,
            options: [
              "The period before the birth of Jesus Christ",
              "The Islamic calendar system",
              "The period after the passing of the Lord Buddha",
              "The period after the birth of Jesus Christ",
            ],
            correctAnswer: "The period after the birth of Jesus Christ",
            order: 2,
          },
          {
            text: "Which early human species is credited with first using fire?",
            type: "MCQ",
            points: 1,
            options: [
              "Australopithecus",
              "Homo Habilis",
              "Homo Erectus",
              "Homo Sapiens",
            ],
            correctAnswer: "Homo Erectus",
            order: 3,
          },
          {
            text: "What was the most significant change during the Neolithic Era?",
            type: "MCQ",
            points: 1,
            options: [
              "People began using bows and arrows",
              "People began farming and growing crops",
              "People began painting on rock surfaces",
              "People began performing burial rituals",
            ],
            correctAnswer: "People began farming and growing crops",
            order: 4,
          },
          {
            text: "Where did Prince Vijaya land when he arrived in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "Dambakolapatuna",
              "Mathota",
              "Anuradhagama",
              "Thambapanni",
            ],
            correctAnswer: "Thambapanni",
            order: 5,
          },
          {
            text: "Which king built the first reservoir adjacent to a city in Sri Lanka?",
            type: "MCQ",
            points: 1,
            options: [
              "King Devanampiyatissa",
              "King Mahasen",
              "King Pandukabhaya",
              "King Vasabha",
            ],
            correctAnswer: "King Pandukabhaya",
            order: 6,
          },
          {
            text: "What was the most significant achievement of King Valagamba's reign?",
            type: "MCQ",
            points: 1,
            options: [
              "He built the Ruwanweli Seya dageba",
              "He brought Buddhism to Sri Lanka",
              "He introduced a canal system for irrigation",
              "He had the Thripitaka written down for the first time",
            ],
            correctAnswer: "He had the Thripitaka written down for the first time",
            order: 7,
          },
          {
            text: "What writing system did the Mesopotamians create and how was it recorded?",
            type: "MCQ",
            points: 1,
            options: [
              "Hieroglyphics, carved into stone walls",
              "Pictograms, painted on papyrus",
              "Cuneiform script, pressed into wet clay tablets",
              "Alphabetic script, written on parchment",
            ],
            correctAnswer: "Cuneiform script, pressed into wet clay tablets",
            order: 8,
          },
          {
            text: "How many large reservoirs did King Vasabha build, and what was his notable canal?",
            type: "MCQ",
            points: 1,
            options: [
              "Sixteen reservoirs and the Yodha Ela canal",
              "Eleven reservoirs and the Elahera canal",
              "Eighteen reservoirs and the Elahera canal",
              "Eleven reservoirs and the Jaya Ganga canal",
            ],
            correctAnswer: "Eleven reservoirs and the Elahera canal",
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
