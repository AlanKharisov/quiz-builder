import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import FieldError from '@/components/FieldError';
import Layout from '@/components/Layout';
import QuestionEditor from '@/components/QuestionEditor';
import { emptyQuestion, quizFormSchema, toPayload, type QuizFormValues } from '@/lib/quizSchema';
import { quizApi } from '@/services/api';

export default function CreateQuizPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { title: '', questions: [emptyQuestion()] },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const questions = useFieldArray({ control, name: 'questions' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const quiz = await quizApi.create(toPayload(values));
      await router.push(`/quizzes/${quiz.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create the quiz');
    }
  });

  return (
    <Layout title="Create quiz">
      <h1 className="mb-6 text-2xl font-bold">Create a quiz</h1>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              Quiz title
            </label>
            <input
              id="title"
              placeholder="e.g. JavaScript Basics"
              className="input"
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-4">
            {questions.fields.map((field, index) => (
              <QuestionEditor
                key={field.id}
                index={index}
                canRemove={questions.fields.length > 1}
                onRemove={() => questions.remove(index)}
              />
            ))}
            <FieldError message={errors.questions?.message ?? errors.questions?.root?.message} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => questions.append(emptyQuestion())}
              className="btn-secondary"
            >
              + Add question
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving…' : 'Create quiz'}
            </button>
          </div>

          {submitError && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </form>
      </FormProvider>
    </Layout>
  );
}
