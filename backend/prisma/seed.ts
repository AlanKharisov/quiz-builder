import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_TITLE = 'JavaScript Basics';

async function main() {
  const existing = await prisma.quiz.findFirst({ where: { title: SAMPLE_TITLE } });
  if (existing) {
    console.log('Sample quiz already exists, skipping');
    return;
  }

  await prisma.quiz.create({
    data: {
      title: SAMPLE_TITLE,
      questions: {
        create: [
          {
            position: 0,
            type: 'BOOLEAN',
            text: 'JavaScript is a statically typed language.',
            correctAnswer: 'false',
          },
          {
            position: 1,
            type: 'INPUT',
            text: 'Which keyword declares a block-scoped constant?',
            correctAnswer: 'const',
          },
          {
            position: 2,
            type: 'CHECKBOX',
            text: 'Which of these are primitive types in JavaScript?',
            options: {
              create: [
                { position: 0, text: 'string', isCorrect: true },
                { position: 1, text: 'number', isCorrect: true },
                { position: 2, text: 'object', isCorrect: false },
                { position: 3, text: 'boolean', isCorrect: true },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Seeded sample quiz "${SAMPLE_TITLE}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
