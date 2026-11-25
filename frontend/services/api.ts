import type { QuizDetail, QuizSummary } from '@/types/quiz';
import type { CreateQuizPayload } from '@/lib/quizSchema';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the API. Is the backend running?');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.error ?? `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export const quizApi = {
  list: () => request<QuizSummary[]>('/quizzes'),
  get: (id: number) => request<QuizDetail>(`/quizzes/${id}`),
  create: (payload: CreateQuizPayload) =>
    request<QuizDetail>('/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
};
