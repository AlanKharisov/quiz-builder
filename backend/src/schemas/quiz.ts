import { z } from 'zod';

export const QUESTION_TYPES = ['BOOLEAN', 'INPUT', 'CHECKBOX'] as const;

const questionText = z.string().trim().min(1, 'Question text is required').max(500);

const booleanQuestion = z.object({
  type: z.literal('BOOLEAN'),
  text: questionText,
  correctAnswer: z.boolean(),
});

const inputQuestion = z.object({
  type: z.literal('INPUT'),
  text: questionText,
  correctAnswer: z.string().trim().min(1, 'Correct answer is required').max(200),
});

const checkboxQuestion = z.object({
  type: z.literal('CHECKBOX'),
  text: questionText,
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'Option text is required').max(200),
        isCorrect: z.boolean(),
      }),
    )
    .min(2, 'Add at least two options')
    .refine((options) => options.some((o) => o.isCorrect), {
      message: 'Mark at least one option as correct',
    }),
});

export const questionSchema = z.discriminatedUnion('type', [
  booleanQuestion,
  inputQuestion,
  checkboxQuestion,
]);

export const createQuizSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;

export const idParamSchema = z.coerce.number().int().positive();
