import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question, SelfMark } from '../types';
import { MathText } from './MathText';
import { Badge, Button, QuestionMeta } from './ui';
import { useProgress } from '../lib/progress';
import { useStudyActions } from '../lib/actions';
import { estimatedStepMarks } from '../lib/mock';
import { topicById, unitById } from '../data';

export function SourceLine({ q }: { q: Question }) {
  if (q.sourceType === 'generated_practice') return <p className="text-xs text-slate-400">Generated practice question — not from an uploaded past paper.</p>;
  if (q.sourceType === 'student_entered') return <p className="text-xs text-amber-300">Entered by you from your own paper{q.exam ? ` (${q.exam.date}${q.exam.set ? ', ' + q.exam.set : ''})` : ''}. Not verified by this app.</p>;
  return (
    <p className="text-xs text-slate-400">
      Source: <span className="font-mono text-slate-300">{q.sourceFilename}</span>
      {q.sourcePage !== null && <>, PDF page {q.sourcePage}</>}
      {q.sourceType === 'uploaded_past_paper' && q.exam?.code && <> · Code {q.exam.code}</>}
    </p>
  );
}

const markText: Record<SelfMark, string> = { correct: 'Correct', partial: 'Partly correct', incorrect: 'Incorrect' };

export function QuestionCard({ q, showTopicLink = false, onMarked }: { q: Question; showTopicLink?: boolean; onMarked?: (m: SelfMark) => void }) {
  const { state } = useProgress();
  const { recordAttempt } = useStudyActions();
  const [attempt, setAttempt] = useState('');
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const last = state.attempts[q.id];
  const stepMarks = estimatedStepMarks(q);
  const topic = topicById.get(q.topic);
  const unit = unitById.get(q.unit);
  const hasSolution = q.solutionSteps.length > 0;

  const reveal = () => {
    if (!attempt.trim() && hints === 0 && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setRevealed(true);
  };

  const mark = (m: SelfMark) => {
    recordAttempt(q.id, q.topic, m, 'practice');
    onMarked?.(m);
  };

  return (
    <article className="rounded-xl border border-ink-700 bg-ink-850 p-4" aria-labelledby={`${q.id}-title`}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h3 id={`${q.id}-title`} className="font-semibold text-slate-100">{q.title}</h3>
        {last && <Badge tone={last.result === 'correct' ? 'green' : last.result === 'partial' ? 'amber' : 'red'}>Last: {markText[last.result]} ×{last.count}</Badge>}
      </div>
      <QuestionMeta q={q} />
      <div className="mt-3 leading-relaxed text-slate-200">
        <MathText text={q.question} />
      </div>
      <div className="mt-2 space-y-1">
        <SourceLine q={q} />
        {q.transcriptionNote && (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-200">
            <MathText text={q.transcriptionNote} />
          </p>
        )}
        {showTopicLink && topic && unit && (
          <p className="text-xs text-slate-400">
            Topic: <Link className="text-accent-300 underline-offset-2 hover:underline focus-ring" to={`${unit.path}?topic=${topic.id}`}>{unit.short} → {topic.short}</Link>
          </p>
        )}
      </div>

      <label className="mt-3 block text-xs font-medium text-slate-400" htmlFor={`${q.id}-attempt`}>Your working / final answer (optional — kept only on this screen)</label>
      <textarea id={`${q.id}-attempt`} value={attempt} onChange={(e) => setAttempt(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus-ring" placeholder="Work it out on paper, then note your final answer here before revealing." />

      {!hasSolution ? (
        <p className="mt-3 text-sm text-amber-300">No reliable solution is stored for this question yet, so it cannot be marked here.</p>
      ) : (
        <>
          {!revealed && hints > 0 && (
            <ol className="mt-3 space-y-2 border-l-2 border-accent-500/40 pl-3 text-sm text-slate-300">
              {q.solutionSteps.slice(0, hints).map((s, i) => (
                <li key={i}><span className="mr-1 text-xs text-accent-300">Step {i + 1}.</span><MathText text={s} /></li>
              ))}
            </ol>
          )}
          {!revealed && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hints < q.solutionSteps.length - 1 && (
                <Button variant="subtle" onClick={() => setHints((h) => h + 1)}>Show next step ({hints}/{q.solutionSteps.length})</Button>
              )}
              <Button variant="ghost" onClick={reveal}>Reveal full solution</Button>
            </div>
          )}
          {confirming && !revealed && (
            <div role="alertdialog" aria-label="Confirm reveal" className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              You have not written an attempt or used a hint yet. Attempting first is how the method sticks. Reveal anyway?
              <div className="mt-2 flex gap-2">
                <Button variant="primary" onClick={() => { setConfirming(false); setRevealed(true); }}>Yes, reveal</Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>No, I'll try first</Button>
              </div>
            </div>
          )}
          {revealed && (
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-200">Step-by-step solution</h4>
                  {stepMarks.length > 0 && <Badge tone="amber" title="Indicative only. Not an official marking scheme.">Marks per step are an estimate</Badge>}
                </div>
                <ol className="space-y-2 text-sm text-slate-200">
                  {q.solutionSteps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 shrink-0 text-xs text-accent-300">{i + 1}.</span>
                      <div className="min-w-0 flex-1"><MathText text={s} /></div>
                      {stepMarks[i] !== undefined && <span className="shrink-0 text-xs tabular-nums text-slate-500">~{stepMarks[i]}M</span>}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                <span className="mr-1 font-semibold text-emerald-300">Final answer:</span>
                <MathText text={q.finalAnswer} />
              </div>
              {q.verificationNote && <p className="text-xs text-slate-400">{q.verificationNote}</p>}
              {q.commonMistakes.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {q.commonMistakes.map((m, i) => <li key={i}><MathText text={m} /></li>)}
                </ul>
              )}
              <p className="text-xs text-slate-500">This is our worked solution, not an official university answer.</p>
              <div>
                <p className="mb-1 text-sm text-slate-300">How did you do? (saved to your progress)</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="subtle" onClick={() => mark('correct')}>✓ Correct</Button>
                  <Button variant="subtle" onClick={() => mark('partial')}>◐ Partly</Button>
                  <Button variant="subtle" onClick={() => mark('incorrect')}>✗ Incorrect</Button>
                  <Button variant="ghost" onClick={() => { setRevealed(false); setHints(0); }}>Hide solution</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
}
