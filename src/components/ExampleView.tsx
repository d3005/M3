import { useState } from 'react';
import type { Example } from '../types';
import { MathText } from './MathText';
import { Badge, Button, SourceBadge, VerificationBadge } from './ui';

function ExampleSource({ ex }: { ex: Example }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <SourceBadge type={ex.sourceType} />
      <VerificationBadge status={ex.verificationStatus} />
      {ex.sourceFilename && (
        <span className="text-xs text-slate-400">
          <span className="font-mono">{ex.sourceFilename}</span>
          {ex.sourcePage !== null && `, PDF p. ${ex.sourcePage}`}
        </span>
      )}
    </div>
  );
}

export function WorkedExample({ ex }: { ex: Example }) {
  return (
    <div className="space-y-3">
      <ExampleSource ex={ex} />
      <div className="rounded-lg bg-ink-900/70 p-3 text-slate-100">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-accent-300">Problem</span>
        <MathText text={ex.problem} />
      </div>
      <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">Why this method: </span><MathText text={ex.why} /></p>
      <ol className="space-y-2 text-sm text-slate-200">
        {ex.steps.map((s, i) => (
          <li key={i} className="flex gap-2"><span className="mt-0.5 shrink-0 text-xs text-accent-300">Step {i + 1}</span><div className="min-w-0"><MathText text={s} /></div></li>
        ))}
      </ol>
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm"><span className="mr-1 font-semibold text-emerald-300">Answer:</span><MathText text={ex.answer} /></div>
      {ex.check && <p className="text-sm text-slate-400"><span className="font-semibold text-slate-300">Check: </span><MathText text={ex.check} /></p>}
    </div>
  );
}

export function GuidedExample({ ex }: { ex: Example }) {
  const [hints, setHints] = useState(0);
  const [steps, setSteps] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const h = ex.hints ?? [];
  return (
    <div className="space-y-3">
      <ExampleSource ex={ex} />
      <div className="rounded-lg bg-ink-900/70 p-3 text-slate-100">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-accent-300">Your turn</span>
        <MathText text={ex.problem} />
      </div>
      <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">Pattern: </span><MathText text={ex.why} /></p>
      {hints > 0 && (
        <ul className="space-y-1 text-sm text-amber-200">
          {h.slice(0, hints).map((x, i) => <li key={i}>Hint {i + 1}: <MathText text={x} /></li>)}
        </ul>
      )}
      {steps > 0 && (
        <ol className="space-y-2 text-sm text-slate-200">
          {ex.steps.slice(0, steps).map((s, i) => <li key={i} className="flex gap-2"><span className="mt-0.5 shrink-0 text-xs text-accent-300">Step {i + 1}</span><div className="min-w-0"><MathText text={s} /></div></li>)}
        </ol>
      )}
      {showAnswer && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm"><span className="mr-1 font-semibold text-emerald-300">Answer:</span><MathText text={ex.answer} /></div>}
      <div className="flex flex-wrap gap-2">
        {hints < h.length && <Button variant="subtle" onClick={() => setHints((x) => x + 1)}>Hint ({hints}/{h.length})</Button>}
        {steps < ex.steps.length && <Button variant="subtle" onClick={() => setSteps((x) => x + 1)}>Reveal next step ({steps}/{ex.steps.length})</Button>}
        {!showAnswer && <Button variant="ghost" onClick={() => setShowAnswer(true)}>Show answer</Button>}
        {(hints > 0 || steps > 0 || showAnswer) && <Button variant="ghost" onClick={() => { setHints(0); setSteps(0); setShowAnswer(false); }}>Start again</Button>}
      </div>
      {!h.length && <Badge>No hints for this one — try the first step yourself.</Badge>}
    </div>
  );
}
