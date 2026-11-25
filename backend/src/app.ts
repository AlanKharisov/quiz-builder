import cors from 'cors';
import express from 'express';
import { quizzesRouter } from './routes/quizzes';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp(corsOrigin: string) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/quizzes', quizzesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
