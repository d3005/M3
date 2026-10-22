import { useState } from 'react';
import type { QuizItem } from '../types';
import { MathText } from './MathText';
import { Badge, Button } from './ui';
import { useProgress } from '../lib/progress';
import { useStudyActions } from '../lib/actions';

export function Quiz({ topicId, items }: { topicId: string; items: QuizItem[] }) {
  const { state } = useProgress();
  const { recordQuiz } = useStudyActions();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const rec = state.quiz[topicId];
  const score = items.filter((it) => answers[it.id] === it.answer).length;
  const allAnswered = items.every((it) => answers[it.id] !== undefined);

  const submit = () => {
    setSubmitted(true);
    recordQuiz(topicId, score, items.length);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <span>{items.length} question{items.length > 1 ? 's' : ''} · auto-marked</span>
        {rec && <Badge tone="blue">Best {rec.best}/{rec.total} · last {rec.last}/{rec.total} · {rec.attempts} attempt{rec.attempts > 1 ? 's' : ''}</Badge>}
      </div>
      <ol className="space-y-4">
        {items.map((it, qi) => (
          <li key={it.id} className="rounded-lg border border-ink-700 bg-ink-900/60 p-3">
            <fieldset>
              <legend className="mb-2 text-sm text-slate-200">
                <span className="mr-1 text-accent-300">{qi + 1}.</span>
                <MathText text={it.prompt} />
              </legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {it.options.map((opt, oi) => {
                  const chosen = answers[it.id] === oi;
                  const correct = submitted && oi === it.answer;
                  const wrong = submitted && chosen && oi !== it.answer;
                  return (
                    <label key={oi} className={`flex cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-accent-400 ${correct ? 'border-emerald-500/60 bg-emerald-500/10' : wrong ? 'border-rose-500/60 bg-rose-500/10' : chosen ? 'border-accent-500/60 bg-accent-500/10' : 'border-ink-700 hover:bg-ink-800'}`}>
                      <input type="radio" className="mt-1 accent-blue-500" name={it.id} checked={chosen} disabled={submitted} onChange={() => setAnswers((a) => ({ ...a, [it.id]: oi }))} />
                      <span className="min-w-0"><MathText text={opt} /></span>
                    </label>
                  );
                })}
              </div>
              {submitted && (
                <p className={`mt-2 text-xs ${answers[it.id] === it.answer ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {answers[it.id] === it.answer ? 'Correct. ' : 'Not quite. '}
                  <span className="text-slate-300"><MathText text={it.explanation} /></span>
                </p>
              )}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button onClick={submit} disabled={!allAnswered}>Submit quiz</Button>
        ) : (
          <>
            <span className="text-sm font-medium text-slate-200" role="status">Score: {score}/{items.length}</span>
            <Button variant="ghost" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retake</Button>
          </>
        )}
        {!allAnswered && !submitted && <span className="text-xs text-slate-500">Answer every question to submit.</span>}
      </div>
    </div>
  );
}
