import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Question, UnitId } from '../../types';
import { questionById, topicById, unitById } from '../../data';
import { examinedPapers, type PaperId } from '../../data/papers';
import { useProgress, type MockAttempt } from '../../lib/progress';
import { weakTopics } from '../../lib/analytics';
import { canBeMarked, estimatedStepMarks, mixedMock, paperMock, type MockPaper } from '../../lib/mock';
import { MathText } from '../../components/MathText';
import { SourceLine } from '../../components/QuestionCard';
import { Badge, Button, Card, EmptyState, QuestionMeta, SectionTitle } from '../../components/ui';

const ACTIVE_KEY = 'm3-r20-prep:active-mock';
const sel = 'rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring';

interface ActiveMock {
  spec: { kind: 'paper'; paper: PaperId } | { kind: 'mixed' | 'weak'; seed: number; weak: string[] };
  durationMin: number;
  startedAt: number;
  chosen: Record<number, 0 | 1>;
  answers: Record<string, string>;
  phase: 'running' | 'review';
  marks: Record<string, number | ''>;
  timeUp: boolean;
  submittedAt: number | null;
}

function buildFromSpec(a: ActiveMock): MockPaper {
  return a.spec.kind === 'paper' ? paperMock(a.spec.paper, a.durationMin) : mixedMock(a.spec.seed, a.spec.weak, a.durationMin);
}

function loadActive(): ActiveMock | null {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ActiveMock) : null;
  } catch {
    return null;
  }
}
function saveActive(a: ActiveMock | null) {
  try {
    if (a) window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* storage unavailable: the mock still works for this tab */
  }
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, Math.floor(sec % 60))).padStart(2, '0')}`;

export function MockTab() {
  const { state, dispatch } = useProgress();
  const [params] = useSearchParams();
  const [active, setActiveRaw] = useState<ActiveMock | null>(() => loadActive());
  const [lastResult, setLastResult] = useState<MockAttempt | null>(null);
  const setActive = (a: ActiveMock | null) => { setActiveRaw(a); saveActive(a); };

  // setup state
  const weak = weakTopics(state);
  const [kind, setKind] = useState<'paper' | 'mixed' | 'weak'>(params.get('mode') === 'weak' && weak.length ? 'weak' : 'mixed');
  const [paper, setPaper] = useState<PaperId>(examinedPapers[0].id);
  const [duration, setDuration] = useState(180);

  const start = () => {
    const spec: ActiveMock['spec'] = kind === 'paper' ? { kind: 'paper', paper } : { kind, seed: Date.now() % 1_000_000, weak: kind === 'weak' ? weak.map((w) => w.topic.id) : [] };
    setLastResult(null);
    setActive({ spec, durationMin: duration, startedAt: Date.now(), chosen: {}, answers: {}, phase: 'running', marks: {}, timeUp: false, submittedAt: null });
  };

  const dispatchSave = (r: MockAttempt) => {
    dispatch({ type: 'saveMock', attempt: r });
    for (const [qid, m] of Object.entries(r.marks)) {
      if (m === null) continue;
      const max = r.maxByQuestion[qid];
      const frac = max ? m / max : 0;
      const q = topicOfQuestion(qid);
      if (!q) continue;
      dispatch({ type: 'attempt', questionId: qid, topicId: q, result: frac >= 0.8 ? 'correct' : frac >= 0.4 ? 'partial' : 'incorrect', origin: 'mock', masteryCheck: false });
    }
  };

  if (active) return <MockRunner active={active} setActive={setActive} onSaved={(r) => { setLastResult(r); setActive(null); dispatchSave(r); }} />;

  return (
    <div className="space-y-4">
      {lastResult && <MockResult r={lastResult} />}
      <Card>
        <SectionTitle sub="Built from real questions in the uploaded 2023 papers. Pattern is provisional (3 h, 70 marks, one question per unit with internal choice).">Timed mock exam</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-slate-300">Type
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={`${sel} mt-1 w-full`}>
              <option value="mixed">Mixed mock (real questions, shuffled papers)</option>
              <option value="paper">Replay an actual paper</option>
              <option value="weak" disabled={!weak.length}>Targeted at my weak topics{!weak.length ? ' (no data yet)' : ''}</option>
            </select>
          </label>
          {kind === 'paper' && (
            <label className="text-sm text-slate-300">Paper
              <select value={paper} onChange={(e) => setPaper(e.target.value as PaperId)} className={`${sel} mt-1 w-full`}>{examinedPapers.map((p) => <option key={p.id} value={p.id}>{p.exam} {p.set}</option>)}</select>
            </label>
          )}
          <label className="text-sm text-slate-300">Time limit (minutes)
            <input type="number" min={10} max={240} step={5} value={duration} onChange={(e) => setDuration(Math.max(10, Math.min(240, Number(e.target.value) || 180)))} className={`${sel} mt-1 w-full`} />
          </label>
        </div>
        {kind === 'weak' && weak.length > 0 && <p className="mt-2 text-xs text-slate-400">Weak topics used: {weak.map((w) => w.topic.short).join(', ')}.</p>}
        <div className="mt-3"><Button onClick={start}>Start mock exam</Button></div>
        <p className="mt-2 text-xs text-slate-500">Write answers on paper (recommended) or in the boxes. Solutions stay hidden until you submit. Your in-progress mock survives a page reload.</p>
      </Card>
      <Card>
        <SectionTitle>Past mock attempts</SectionTitle>
        {state.mocks.length === 0 ? <EmptyState title="No mocks taken yet." /> : (
          <ul className="space-y-1.5 text-sm">
            {state.mocks.map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-ink-900/60 px-3 py-2">
                <span className="text-slate-200">{m.title}</span>
                <span className="text-slate-400">{new Date(m.at).toLocaleString()} · {Math.round(m.elapsedSec / 60)} min · <span className="font-semibold text-white">{m.score}/{m.max}</span> self-assessed</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function topicOfQuestion(qid: string): string | null {
  return questionById.get(qid)?.topic ?? null;
}

function MockRunner({ active, setActive, onSaved }: { active: ActiveMock; setActive: (a: ActiveMock | null) => void; onSaved: (r: MockAttempt) => void }) {
  const paper = useMemo(() => buildFromSpec(active), [active.spec]); // eslint-disable-line react-hooks/exhaustive-deps
  const [now, setNow] = useState(Date.now());
  const [confirmQuit, setConfirmQuit] = useState(false);
  const limit = active.durationMin * 60;
  const elapsed = Math.floor(((active.submittedAt ?? now) - active.startedAt) / 1000);
  const remaining = limit - elapsed;

  useEffect(() => {
    if (active.phase !== 'running') return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [active.phase]);

  useEffect(() => {
    if (active.phase === 'running' && remaining <= 0) setActive({ ...active, phase: 'review', timeUp: true, submittedAt: active.startedAt + limit * 1000 });
  }, [remaining, active, limit, setActive]);

  const chosenParts: Question[] = paper.sections.flatMap((s) => (active.chosen[s.unit] !== undefined ? s.options[active.chosen[s.unit]].parts : []));

  if (active.phase === 'running') {
    return (
      <div className="space-y-4">
        <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-ink-700 bg-ink-950/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
          <span className="font-semibold text-white">{paper.title}</span>
          <span role="timer" aria-live="off" className={`rounded-md px-2 py-1 font-mono text-lg tabular-nums ${remaining < 600 ? 'bg-rose-500/20 text-rose-200' : 'bg-ink-800 text-white'}`}>{mmss(remaining)}</span>
          <span className="text-xs text-slate-400">Chosen: {Object.keys(active.chosen).length}/5 units</span>
          <div className="ml-auto flex gap-2">
            <Button onClick={() => setActive({ ...active, phase: 'review', submittedAt: Date.now() })}>Submit</Button>
            {!confirmQuit ? <Button variant="ghost" onClick={() => setConfirmQuit(true)}>Abandon</Button> : <Button variant="danger" onClick={() => setActive(null)}>Confirm abandon (not saved)</Button>}
          </div>
        </div>
        <p className="text-xs text-slate-400">{paper.note} Answer one option per unit. Pattern shown is the 2023 pattern — provisional.</p>
        {paper.sections.map((s) => (
          <Card key={s.unit}>
            <SectionTitle sub="Choose ONE option (internal choice).">{unitById.get(s.unit)!.title} · 14 marks</SectionTitle>
            <div className="grid gap-3 lg:grid-cols-2">
              {s.options.map((o, oi) => (
                <div key={oi} className={`rounded-lg border p-3 ${active.chosen[s.unit] === oi ? 'border-accent-500/70 bg-accent-500/5' : 'border-ink-700'}`}>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                    <input type="radio" name={`unit-${s.unit}`} checked={active.chosen[s.unit] === oi} onChange={() => setActive({ ...active, chosen: { ...active.chosen, [s.unit]: oi as 0 | 1 } })} className="accent-blue-500" />
                    {o.label} <span className="text-xs font-normal text-slate-400">({o.source})</span>
                  </label>
                  <ol className="space-y-3">
                    {o.parts.map((q) => (
                      <li key={q.id} className="text-sm text-slate-200">
                        <div className="mb-1 flex gap-2"><span className="text-accent-300">({q.exam?.questionNumber.replace(/^\d+/, '').replace(/[()]/g, '') || '—'})</span><Badge>{q.marks}M</Badge></div>
                        <MathText text={q.question} />
                        {active.chosen[s.unit] === oi && (
                          <textarea aria-label={`Answer for ${q.title}`} value={active.answers[q.id] ?? ''} onChange={(e) => setActive({ ...active, answers: { ...active.answers, [q.id]: e.target.value } })} rows={2} placeholder="Optional: key result / final answer" className="mt-2 w-full rounded-md border border-ink-600 bg-ink-900 p-2 text-sm focus-ring" />
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Button onClick={() => setActive({ ...active, phase: 'review', submittedAt: Date.now() })}>Submit mock</Button>
      </div>
    );
  }

  // ---- review / marking
  const markable = chosenParts.filter(canBeMarked);
  const allMarked = markable.every((q) => active.marks[q.id] !== undefined && active.marks[q.id] !== '');
  const save = () => {
    const marks: Record<string, number | null> = {};
    const maxBy: Record<string, number> = {};
    for (const q of chosenParts) {
      maxBy[q.id] = q.marks ?? 0;
      marks[q.id] = canBeMarked(q) && active.marks[q.id] !== '' && active.marks[q.id] !== undefined ? Number(active.marks[q.id]) : null;
    }
    const score = Object.values(marks).reduce<number>((s, m) => s + (m ?? 0), 0);
    const max = Object.entries(marks).reduce((s, [id, m]) => s + (m === null ? 0 : maxBy[id]), 0);
    onSaved({ id: `mock-${active.startedAt}`, at: new Date().toISOString(), kind: paper.kind, title: paper.title, durationMin: active.durationMin, elapsedSec: Math.min(elapsed, limit), questionIds: chosenParts.map((q) => q.id), marks, maxByQuestion: maxBy, score, max });
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle sub="Compare your work with each solution and award yourself marks honestly. Step marks are estimates, not an official scheme.">Mark your mock — {paper.title}</SectionTitle>
        {active.timeUp && <p role="alert" className="mb-2 text-sm text-amber-300">Time's up — the mock was submitted automatically.</p>}
        <p className="text-sm text-slate-300">Time used: {mmss(Math.min(elapsed, limit))} of {active.durationMin}:00. Units answered: {Object.keys(active.chosen).length}/5.</p>
        {chosenParts.length === 0 && <EmptyState title="You did not choose any question.">Nothing to mark — you can abandon this mock.</EmptyState>}
      </Card>
      {chosenParts.map((q) => {
        const steps = estimatedStepMarks(q);
        return (
          <Card key={q.id}>
            <QuestionMeta q={q} />
            <div className="mt-2 text-slate-200"><MathText text={q.question} /></div>
            <SourceLine q={q} />
            {active.answers[q.id] && <p className="mt-2 rounded-md bg-ink-900 p-2 text-sm text-slate-300"><span className="text-xs text-slate-500">Your note: </span>{active.answers[q.id]}</p>}
            {canBeMarked(q) ? (
              <>
                <ol className="mt-3 space-y-1.5 text-sm text-slate-200">
                  {q.solutionSteps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-xs text-accent-300">{i + 1}.</span><div className="min-w-0 flex-1"><MathText text={s} /></div>{steps[i] !== undefined && <span className="text-xs text-slate-500">~{steps[i]}M</span>}</li>)}
                </ol>
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-sm"><span className="font-semibold text-emerald-300">Answer: </span><MathText text={q.finalAnswer} /></div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-200">Marks awarded
                  <input type="number" min={0} max={q.marks ?? 0} step={0.5} value={active.marks[q.id] ?? ''} onChange={(e) => { const v = e.target.value === '' ? '' : Math.max(0, Math.min(q.marks ?? 0, Number(e.target.value))); setActive({ ...active, marks: { ...active.marks, [q.id]: v } }); }} className={`${sel} w-20`} />
                  / {q.marks}
                </label>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-300">No reliable solution available — this part is excluded from the score.</p>
            )}
          </Card>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={!allMarked}>Save result</Button>
        {!allMarked && <span className="self-center text-xs text-slate-400">Enter marks for every part to save.</span>}
        <Button variant="ghost" onClick={() => setActive(null)}>Discard</Button>
      </div>
    </div>
  );
}

function MockResult({ r }: { r: MockAttempt }) {
  const byUnit = new Map<UnitId, { got: number; max: number }>();
  const byTopic = new Map<string, { got: number; max: number }>();
  for (const [qid, m] of Object.entries(r.marks)) {
    if (m === null) continue;
    const tid = topicOfQuestion(qid);
    const t = tid ? topicById.get(tid) : undefined;
    if (!t) continue;
    const u = byUnit.get(t.unit) ?? { got: 0, max: 0 };
    byUnit.set(t.unit, { got: u.got + m, max: u.max + r.maxByQuestion[qid] });
    const tt = byTopic.get(t.id) ?? { got: 0, max: 0 };
    byTopic.set(t.id, { got: tt.got + m, max: tt.max + r.maxByQuestion[qid] });
  }
  const weakHere = [...byTopic.entries()].filter(([, v]) => v.max && v.got / v.max < 0.5);
  return (
    <Card>
      <SectionTitle sub="Self-assessed against our worked solutions — not an official grade.">Result saved: {r.score}/{r.max}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">By unit</h3>
          <ul className="mt-1 space-y-1 text-sm">{[...byUnit.entries()].sort((a, b) => a[0] - b[0]).map(([u, v]) => <li key={u} className="flex justify-between"><span>{unitById.get(u)!.short}</span><span className="tabular-nums">{v.got}/{v.max}</span></li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Revise next (below 50 %)</h3>
          {weakHere.length === 0 ? <p className="mt-1 text-sm text-slate-400">No topic below 50 % in this mock.</p> : (
            <ul className="mt-1 space-y-1 text-sm">{weakHere.map(([tid, v]) => { const t = topicById.get(tid)!; const u = unitById.get(t.unit)!; return <li key={tid}><Link to={`${u.path}?topic=${tid}`} className="text-accent-300 hover:underline focus-ring">{u.short}: {t.short}</Link> <span className="text-xs text-slate-400">({v.got}/{v.max})</span></li>; })}</ul>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">Parts below 80 % were added to Mistake review.</p>
    </Card>
  );
}
