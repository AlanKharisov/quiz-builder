import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './db';

const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

const server = createApp(corsOrigin).listen(port, () => {
  console.log(`Quiz Builder API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
