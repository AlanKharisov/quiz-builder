import { z } from 'zod';

// form keeps fields for all question types, toPayload() sends only the needed ones
const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    type: z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']),
    text: z.string().trim().min(1, 'Question text is required'),
    booleanAnswer: z.enum(['true', 'false']),
    inputAnswer: z.string(),
    options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'INPUT' && !q.inputAnswer.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inputAnswer'],
        message: 'Correct answer is required',
      });
    }
    if (q.type === 'CHECKBOX') {
      q.options.forEach((option, i) => {
        if (!optionSchema.safeParse(option).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['options', i, 'text'],
            message: 'Option text is required',
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
