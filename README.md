# Quiz Builder

A full-stack web app for building custom quizzes with three question types:
**True/False**, **short text answer** and **multiple choice** (several correct answers).

- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite, Zod validation
- **Frontend:** Next.js (Pages Router), React, TypeScript, Tailwind CSS, React Hook Form + Zod

```
quiz-builder/
├── backend/            # Express REST API
│   ├── prisma/         # schema, migrations, seed script
│   └── src/
│       ├── routes/     # HTTP layer
│       ├── services/   # data access (Prisma)
│       ├── schemas/    # Zod request validation
│       └── middleware/ # error handling
└── frontend/           # Next.js app
    ├── pages/          # /quizzes, /quizzes/[id], /create
    ├── components/     # Layout, QuestionEditor, QuestionView, ...
    ├── services/       # API client
    ├── lib/            # form schema + mapping to the API payload
    └── types/
```

## Requirements

- Node.js 20+ and npm

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # DATABASE_URL, PORT, CORS_ORIGIN
npx prisma migrate dev      # creates the SQLite database and runs the seed script
npm run dev                 # http://localhost:4000
```

The database is a local SQLite file (`backend/prisma/dev.db`), so there is nothing else to install.
`prisma migrate dev` also seeds a sample quiz ("JavaScript Basics"). Useful commands:

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run db:seed`  | Create the sample quiz (skipped if it exists)       |
| `npm run db:reset` | Drop the database, re-apply migrations and seed     |
| `npm run build`    | Compile TypeScript to `dist/` (`npm start` runs it) |

> Using PostgreSQL instead: set `provider = "postgresql"` in `prisma/schema.prisma`, point
> `DATABASE_URL` at your database, delete `prisma/migrations` and run `npx prisma migrate dev`.

## 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                 # http://localhost:3000
```

Open http://localhost:3000. It redirects to the quiz list.

## Pages

| Route           | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `/quizzes`      | All quizzes with the number of questions; delete with the trash icon   |
| `/quizzes/[id]` | Read-only view of a quiz with its questions and correct answers marked |
| `/create`       | Form: title + questions; add/remove questions and options dynamically  |

## API

| Method   | Endpoint       | Description                                   |
| -------- | -------------- | --------------------------------------------- |
| `POST`   | `/quizzes`     | Create a quiz → `201` with the full quiz      |
| `GET`    | `/quizzes`     | `[{ id, title, createdAt, questionCount }]`   |
| `GET`    | `/quizzes/:id` | Full quiz with questions (`404` if not found) |
| `DELETE` | `/quizzes/:id` | Delete a quiz and its questions → `204`       |

Invalid input returns `400` with field-level details:

```json
{
  "error": "Validation failed",
  "details": [{ "path": "title", "message": "Title is required" }]
}
```

## Creating a sample quiz

The seed script already creates one. To create another one:

**From the UI:** open `/create`, enter a title, add questions, pick the type of each one, mark
the correct answer(s) and press **Create quiz**.

**From the API:**

```bash
curl -X POST http://localhost:4000/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Geography",
    "questions": [
      { "type": "BOOLEAN", "text": "Paris is the capital of France", "correctAnswer": true },
      { "type": "INPUT", "text": "Longest river in the world?", "correctAnswer": "Nile" },
      {
        "type": "CHECKBOX",
        "text": "Which countries are in Europe?",
        "options": [
          { "text": "Spain", "isCorrect": true },
          { "text": "Brazil", "isCorrect": false },
          { "text": "Poland", "isCorrect": true }
        ]
      }
    ]
  }'
```

Validation rules (shared by the form and the API): title and question text are required, at least
one question per quiz, a short-answer question needs its correct answer, a multiple-choice
question needs at least two options and at least one of them marked correct.

## Code quality

Both apps have ESLint and Prettier set up:

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
npm run typecheck     # tsc --noEmit
```

## Design notes

- Question types are stored in one `Question` table with a `type` column; multiple-choice options
  live in an `Option` table. Deleting a quiz cascades to its questions and options.
- SQLite has no enums, so the type is a string validated by Zod in the API layer.
- The create form keeps fields for every question type, so switching the type of a question does
  not lose what was typed; only the relevant fields are sent to the API.
