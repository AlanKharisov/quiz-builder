import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import QuestionView from '@/components/QuestionView';
import { quizApi } from '@/services/api';
import type { QuizDetail } from '@/types/quiz';

export default function QuizDetailPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    // clear the previous quiz/error when the id changes
    setQuiz(null);
    setError(null);

    const id = Number(router.query.id);
    if (!Number.isInteger(id) || id <= 0) {
      setError('Invalid quiz id');
      return;
    }

    // ignore the response if the user already moved to another quiz
    let cancelled = false;
    quizApi
      .get(id)
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.id]);

  return (
    <Layout title={quiz?.title ?? 'Quiz'}>
      <Link href="/quizzes" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        ← All quizzes
      </Link>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!quiz && !error && <p className="text-slate-500">Loading…</p>}

      {quiz && (
        <>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="mb-6 text-sm text-slate-500">
            {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'} ·
            created {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
          <ol className="space-y-4">
            {quiz.questions.map((question, index) => (
              <QuestionView key={question.id} question={question} index={index} />
            ))}
          </ol>
        </>
      )}
    </Layout>
  );
}
