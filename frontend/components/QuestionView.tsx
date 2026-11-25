import type { Question } from '@/types/quiz';

const TYPE_LABELS: Record<Question['type'], string> = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
};

export default function QuestionView({ question, index }: { question: Question; index: number }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">
          {index + 1}. {question.text}
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {TYPE_LABELS[question.type]}
        </span>
      </div>

      {question.type === 'BOOLEAN' && (
        <div className="flex gap-6">
          {[true, false].map((value) => (
            <label key={String(value)} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={question.correctAnswer === value}
                readOnly
                disabled
                className="accent-indigo-600"
              />
              {value ? 'True' : 'False'}
              {question.correctAnswer === value && <CorrectBadge />}
            </label>
          ))}
        </div>
      )}

      {question.type === 'INPUT' && (
        <p className="mb-1 text-xs font-medium text-emerald-700">Correct answer</p>
      )}
      {question.type === 'INPUT' && (
        <input
          value={question.correctAnswer}
          readOnly
          disabled
          aria-label="Correct answer"
          className="input bg-slate-50"
        />
      )}

      {question.type === 'CHECKBOX' && (
        <ul className="space-y-1.5">
          {question.options.map((option) => (
            <li key={option.id}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  readOnly
                  disabled
                  className="h-4 w-4 accent-indigo-600"
                />
                {option.text}
                {option.isCorrect && <CorrectBadge />}
              </label>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function CorrectBadge() {
  return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Correct
    </span>
  );
}
