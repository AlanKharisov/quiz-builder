import { prisma } from '../db';
import type { CreateQuizInput, QuestionInput } from '../schemas/quiz';

type QuestionWithOptions = {
  id: number;
  position: number;
  type: string;
  text: string;
  correctAnswer: string | null;
  options: { id: number; position: number; text: string; isCorrect: boolean }[];
};

// convert db row to the shape we return from the api
function toApiQuestion(q: QuestionWithOptions) {
  const base = { id: q.id, position: q.position, type: q.type, text: q.text };
  switch (q.type) {
    case 'BOOLEAN':
      return { ...base, correctAnswer: q.correctAnswer === 'true' };
    case 'INPUT':
      return { ...base, correctAnswer: q.correctAnswer ?? '' };
    default:
      return {
        ...base,
        options: [...q.options]
          .sort((a, b) => a.position - b.position)
          .map(({ id, text, isCorrect }) => ({ id, text, isCorrect })),
      };
  }
}

function toQuestionCreate(question: QuestionInput, position: number) {
  switch (question.type) {
    case 'BOOLEAN':
      return {
        position,
        type: question.type,
        text: question.text,
        correctAnswer: String(question.correctAnswer),
      };
    case 'INPUT':
      return {
        position,
        type: question.type,
        text: question.text,
        correctAnswer: question.correctAnswer,
      };
    case 'CHECKBOX':
      return {
        position,
        type: question.type,
        text: question.text,
        options: {
          create: question.options.map((option, i) => ({ ...option, position: i })),
        },
      };
  }
}

export async function listQuizzes() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true, _count: { select: { questions: true } } },
  });
  return quizzes.map(({ _count, ...quiz }) => ({ ...quiz, questionCount: _count.questions }));
}

export async function getQuiz(id: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { position: 'asc' }, include: { options: true } } },
  });
  if (!quiz) return null;
  return { ...quiz, questions: quiz.questions.map(toApiQuestion) };
}

export async function createQuiz(input: CreateQuizInput) {
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      questions: { create: input.questions.map(toQuestionCreate) },
    },
  });
  return getQuiz(quiz.id);
}

export async function deleteQuiz(id: number) {
  const { count } = await prisma.quiz.deleteMany({ where: { id } });
  return count > 0;
}
