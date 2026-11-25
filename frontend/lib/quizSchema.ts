import { z } from 'zod';

// same limits as the backend (backend/src/schemas/quiz.ts)
const MAX_QUESTION_LENGTH = 500;
const MAX_ANSWER_LENGTH = 200;

// form keeps fields for all question types, toPayload() sends only the needed ones.
// answer/option limits are checked only for the current type, so hidden fields never block submit
const questionSchema = z
  .object({
    type: z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']),
    text: z
      .string()
      .trim()
      .min(1, 'Question text is required')
      .max(
        MAX_QUESTION_LENGTH,
        `Question text is too long (max ${MAX_QUESTION_LENGTH} characters)`,
      ),
    booleanAnswer: z.enum(['true', 'false']),
    inputAnswer: z.string(),
    options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'INPUT') {
      const answer = q.inputAnswer.trim();
      if (!answer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inputAnswer'],
          message: 'Correct answer is required',
        });
      } else if (answer.length > MAX_ANSWER_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inputAnswer'],
          message: `Correct answer is too long (max ${MAX_ANSWER_LENGTH} characters)`,
        });
      }
    }
    if (q.type === 'CHECKBOX') {
      q.options.forEach((option, i) => {
        const text = option.text.trim();
        if (!text || text.length > MAX_ANSWER_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['options', i, 'text'],
            message: text
              ? `Option text is too long (max ${MAX_ANSWER_LENGTH} characters)`
              : 'Option text is required',
          });
        }
      });
      if (q.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', 'root'],
          message: 'Add at least two options',
        });
      } else if (!q.options.some((o) => o.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', 'root'],
          message: 'Mark at least one option as correct',
        });
      }
    }
  });

export const quizFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
export type QuestionFormValues = QuizFormValues['questions'][number];

export const emptyQuestion = (): QuestionFormValues => ({
  type: 'BOOLEAN',
  text: '',
  booleanAnswer: 'true',
  inputAnswer: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

export type CreateQuizPayload = {
  title: string;
  questions: (
    | { type: 'BOOLEAN'; text: string; correctAnswer: boolean }
    | { type: 'INPUT'; text: string; correctAnswer: string }
    | { type: 'CHECKBOX'; text: string; options: { text: string; isCorrect: boolean }[] }
  )[];
};

export function toPayload(values: QuizFormValues): CreateQuizPayload {
  return {
    title: values.title.trim(),
    questions: values.questions.map((q) => {
      const text = q.text.trim();
      switch (q.type) {
        case 'BOOLEAN':
          return { type: q.type, text, correctAnswer: q.booleanAnswer === 'true' };
        case 'INPUT':
          return { type: q.type, text, correctAnswer: q.inputAnswer.trim() };
        case 'CHECKBOX':
          return {
            type: q.type,
            text,
            options: q.options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
          };
      }
    }),
  };
}
