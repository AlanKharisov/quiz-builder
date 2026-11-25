export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export interface QuizSummary {
  id: number;
  title: string;
  createdAt: string;
  questionCount: number;
}

interface QuestionBase {
  id: number;
  position: number;
  text: string;
}

export interface BooleanQuestion extends QuestionBase {
  type: 'BOOLEAN';
  correctAnswer: boolean;
}

export interface InputQuestion extends QuestionBase {
  type: 'INPUT';
  correctAnswer: string;
}

export interface CheckboxQuestion extends QuestionBase {
  type: 'CHECKBOX';
  options: { id: number; text: string; isCorrect: boolean }[];
}

export type Question = BooleanQuestion | InputQuestion | CheckboxQuestion;

export interface QuizDetail {
  id: number;
  title: string;
  createdAt: string;
  questions: Question[];
}
