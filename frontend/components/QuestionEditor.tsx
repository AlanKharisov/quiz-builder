import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { QuizFormValues } from '@/lib/quizSchema';
import FieldError from './FieldError';

const TYPE_LABELS = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
} as const;

interface Props {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}

export default function QuestionEditor({ index, canRemove, onRemove }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuizFormValues>();
  const type = useWatch({ control, name: `questions.${index}.type` });
  const options = useFieldArray({ control, name: `questions.${index}.options` });
  const questionErrors = errors.questions?.[index];

  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <legend className="text-sm font-semibold text-slate-700">Question {index + 1}</legend>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <label htmlFor={`q-${index}-text`} className="sr-only">
            Question text
          </label>
          <input
            id={`q-${index}-text`}
            placeholder="Question text"
            className="input"
            {...register(`questions.${index}.text`)}
          />
          <FieldError message={questionErrors?.text?.message} />
        </div>
        <div>
          <label htmlFor={`q-${index}-type`} className="sr-only">
            Question type
          </label>
          <select id={`q-${index}-type`} className="input" {...register(`questions.${index}.type`)}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {type === 'BOOLEAN' && (
          <div className="flex gap-6" role="radiogroup" aria-label="Correct answer">
            <span className="text-sm text-slate-600">Correct answer:</span>
            {(['true', 'false'] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value={value}
                  className="accent-indigo-600"
                  {...register(`questions.${index}.booleanAnswer`)}
                />
                {value === 'true' ? 'True' : 'False'}
              </label>
            ))}
          </div>
        )}

        {type === 'INPUT' && (
          <div>
            <label htmlFor={`q-${index}-answer`} className="mb-1 block text-sm text-slate-600">
              Correct answer
            </label>
            <input
              id={`q-${index}-answer`}
              placeholder="Expected short answer"
              className="input"
              {...register(`questions.${index}.inputAnswer`)}
            />
            <FieldError message={questionErrors?.inputAnswer?.message} />
          </div>
        )}

        {type === 'CHECKBOX' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Options (tick every correct one):</p>
            {options.fields.map((field, optionIndex) => (
              <div key={field.id}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Option ${optionIndex + 1} is correct`}
                    className="h-4 w-4 accent-indigo-600"
                    {...register(`questions.${index}.options.${optionIndex}.isCorrect`)}
                  />
                  <input
                    placeholder={`Option ${optionIndex + 1}`}
                    className="input"
                    {...register(`questions.${index}.options.${optionIndex}.text`)}
                  />
                  <button
                    type="button"
                    onClick={() => options.remove(optionIndex)}
                    disabled={options.fields.length <= 2}
                    aria-label={`Remove option ${optionIndex + 1}`}
                    className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
                <FieldError message={questionErrors?.options?.[optionIndex]?.text?.message} />
              </div>
            ))}
            <FieldError
              message={questionErrors?.options?.message ?? questionErrors?.options?.root?.message}
            />
            <button
              type="button"
              onClick={() => options.append({ text: '', isCorrect: false })}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              + Add option
            </button>
          </div>
        )}
      </div>
    </fieldset>
  );
}
