import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { quizApi } from '@/services/api';
import type { QuizSummary } from '@/types/quiz';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    quizApi
      .list()
      .then(setQuizzes)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function handleDelete(quiz: QuizSummary) {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    setDeletingId(quiz.id);
    setError(null);
    try {
      await quizApi.remove(quiz.id);
      setQuizzes((current) => current?.filter((q) => q.id !== quiz.id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete the quiz');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout title="Quizzes">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link href="/create" className="btn-primary">
          + New quiz
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {quizzes === null && !error && <p className="text-slate-500">Loading…</p>}

      {quizzes?.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No quizzes yet.{' '}
          <Link href="/create" className="font-medium text-indigo-600 hover:underline">
            Create the first one
          </Link>
        </div>
      )}

      {quizzes && quizzes.length > 0 && (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <Link href={`/quizzes/${quiz.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{quiz.title}</p>
                <p className="text-sm text-slate-500">
                  {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(quiz)}
                disabled={deletingId === quiz.id}
                aria-label={`Delete ${quiz.title}`}
                title="Delete quiz"
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3"
      />
    </svg>
  );
}
