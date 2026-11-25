import { Router, type NextFunction, type Request, type Response } from 'express';
import { createQuizSchema, idParamSchema } from '../schemas/quiz';
import { createQuiz, deleteQuiz, getQuiz, listQuizzes } from '../services/quizService';
import { HttpError } from '../middleware/errorHandler';

export const quizzesRouter = Router();

// pass async errors to the error handler (express 4 doesn't do it automatically)
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

function parseId(raw: string) {
  const parsed = idParamSchema.safeParse(raw);
  if (!parsed.success) throw new HttpError(400, 'Quiz id must be a positive integer');
  return parsed.data;
}

quizzesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createQuizSchema.parse(req.body);
    const quiz = await createQuiz(input);
    res.status(201).json(quiz);
  }),
);

quizzesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listQuizzes());
  }),
);

quizzesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const quiz = await getQuiz(parseId(req.params.id));
    if (!quiz) throw new HttpError(404, 'Quiz not found');
    res.json(quiz);
  }),
);

quizzesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await deleteQuiz(parseId(req.params.id));
    if (!deleted) throw new HttpError(404, 'Quiz not found');
    res.status(204).end();
  }),
);
