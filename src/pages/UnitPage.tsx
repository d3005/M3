import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type { Difficulty, Topic, TopicStatus, UnitId } from '../types';
import { paperCountByTopic, paperQuestions, priorityOf, topicById, unitById } from '../data';
import { coverageMatrix, sourceIssues } from '../data/sources';
import { useProgress } from '../lib/progress';
import { statusLabel, statusOf, topicPerformance, unitProgress } from '../lib/analytics';
import { MathText } from '../components/MathText';
import { FormulaTable } from '../components/FormulaTable';
import { WorkedExample, GuidedExample } from '../components/ExampleView';
import { QuestionCard } from '../components/QuestionCard';
import { Quiz } from '../components/Quiz';
import { FormulaReview, printSection } from '../components/FormulaReview';
import { Badge, Button, Card, Collapsible, EmptyState, PriorityBadge, ProgressBar, ProvenanceBadges, SectionTitle, StatusPill } from '../components/ui';

const roman = ['I', 'II', 'III', 'IV', 'V'];

function MasteryIndicator({ topic }: { topic: Topic }) {
  const { state, dispatch } = useProgress();
  const q = state.quiz[topic.id];
  const quizOk = !!q && q.best / q.total >= 0.8;
  const ids = [...topic.practice.map((p) => p.id), ...paperQuestions.filter((p) => p.topic === topic.id).map((p) => p.id)];
  const practiceOk = ids.some((id) => state.attempts[id]?.result === 'correct');
  const perf = topicPerformance(state, topic.id);
  const status = statusOf(state, topic.id);
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/60 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-200">Mastery</span>
        <StatusPill s={status} />
        <label className="sr-only" htmlFor={`status-${topic.id}`}>Set status</label>
        <select id={`status-${topic.id}`} value={status} onChange={(e) => dispatch({ type: 'setStatus', topicId: topic.id, status: e.target.value as TopicStatus })} className="rounded-md border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-xs focus-ring">
          {(Object.keys(statusLabel) as TopicStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
      </div>
      <ul className="mt-2 space-y-0.5 text-xs">
        <li className={quizOk ? 'text-emerald-300' : 'text-slate-400'}>{quizOk ? '✓' : '○'} Topic quiz best ≥ 80 % {q ? `(best ${q.best}/${q.total})` : '(not taken)'}</li>
        <li className={practiceOk ? 'text-emerald-300' : 'text-slate-400'}>{practiceOk ? '✓' : '○'} At least one practice or past-paper question marked correct</li>
      </ul>
      <p className="mt-1 text-[11px] text-slate-500">Both ✓ ⇒ status becomes Mastered automatically. Current combined score: {perf.combined === null ? 'no results yet' : `${Math.round(perf.combined * 100)} %`}.</p>
    </div>
  );
}

const pathSteps = [
  ['concept', '1 Understand'],
  ['formulas', '2 Formulas'],
  ['worked', '3 Worked example'],
  ['guided', '4 Guided example'],
  ['practice', '5 Practise'],
  ['mistakes', '6 Avoid mistakes'],
  ['quiz', '7 Retest (quiz)'],
] as const;

function TopicView({ topic }: { topic: Topic }) {
  const [diff, setDiff] = useState<Difficulty | 'all'>('all');
  const papers = paperQuestions.filter((q) => q.topic === topic.id);
  const practice = topic.practice.filter((q) => diff === 'all' || q.difficulty === diff);
  const unit = unitById.get(topic.unit)!;
  return (
    <div className="print-area space-y-4" key={topic.id}>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">{unit.title}</p>
            <h2 className="text-xl font-semibold text-white">{topic.title}</h2>
          </div>
          <div className="no-print flex gap-2">
            <Button variant="ghost" onClick={printSection}>Print topic</Button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ProvenanceBadges items={topic.provenance} />
          <PriorityBadge p={priorityOf(topic.id)} />
          <Badge tone="blue">{paperCountByTopic[topic.id]} past-paper part{paperCountByTopic[topic.id] === 1 ? '' : 's'}</Badge>
          <Badge>≈ {topic.estHours} h</Badge>
        </div>
        <p className="mt-2 text-xs text-slate-400">{topic.syllabusNote}</p>
        {topic.notesRef && <p className="mt-1 text-xs text-slate-400">Notes: <span className="font-mono">{topic.notesRef.file}</span>, PDF pp. {topic.notesRef.pages}</p>}
        <nav aria-label="Learning path" className="no-print mt-3 flex flex-wrap gap-1.5">
          {pathSteps.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-md bg-ink-800 px-2 py-1 text-xs text-slate-300 hover:bg-ink-700 focus-ring">{label}</a>
          ))}
        </nav>
        <div className="mt-3"><MasteryIndicator topic={topic} /></div>
      </Card>

      <Card id="concept">
        <SectionTitle>1 · Understand the idea</SectionTitle>
        <div className="space-y-2 leading-relaxed text-slate-200">
          {topic.concept.map((c, i) => <p key={i}><MathText text={c} /></p>)}
        </div>
        {(topic.notation.length > 0 || topic.prerequisites.length > 0) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {topic.notation.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Notation</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">{topic.notation.map((n, i) => <li key={i}><MathText text={n} /></li>)}</ul>
              </div>
            )}
            {topic.prerequisites.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Prerequisites</h3>
                <ul className="mt-1 space-y-1 text-sm">
                  {topic.prerequisites.map((p) => {
                    const t = topicById.get(p);
                    if (!t) return null;
                    const u = unitById.get(t.unit)!;
                    return <li key={p}><Link to={`${u.path}?topic=${p}`} className="text-accent-300 hover:underline focus-ring">{u.short} → {t.short}</Link></li>;
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card id="formulas">
        <SectionTitle sub="Memorise only these. Each row shows where it is verified from.">2 · Formulas</SectionTitle>
        <FormulaTable formulas={topic.formulas} />
        <h3 className="mt-4 text-sm font-semibold text-slate-300">Method (how to attack a question)</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-200">{topic.method.map((m, i) => <li key={i}><MathText text={m} /></li>)}</ol>
      </Card>

      <Card id="worked">
        <SectionTitle sub="Read every step; cover the right side and predict the next line.">3 · Worked example — {topic.worked.title}</SectionTitle>
        <WorkedExample ex={topic.worked} />
      </Card>

      <Card id="guided">
        <SectionTitle sub="Use hints only when stuck; reveal one step at a time.">4 · Guided example — {topic.guided.title}</SectionTitle>
        <GuidedExample ex={topic.guided} />
      </Card>

      <Card id="practice">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <SectionTitle sub="Attempt first. Solutions stay hidden until you ask.">5 · Practise independently</SectionTitle>
          <label className="no-print text-sm text-slate-300">Difficulty{' '}
            <select value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | 'all')} className="rounded-md border border-ink-600 bg-ink-900 px-2 py-1 text-sm focus-ring">
              <option value="all">All</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </label>
        </div>
        <div className="space-y-3">
          {practice.length === 0 ? <EmptyState title="No practice questions at this difficulty." /> : practice.map((q) => <QuestionCard key={q.id} q={q} />)}
        </div>
        <div className="mt-4">
          <Collapsible title={<>From the uploaded past papers ({papers.length})</>} defaultOpen={papers.length > 0 && papers.length <= 3}>
            {papers.length === 0 ? (
              <EmptyState title="Not asked in the 5 uploaded 2023 paper sets">That does not mean it cannot be asked — the sample is small.</EmptyState>
            ) : (
              <div className="space-y-3">{papers.map((q) => <QuestionCard key={q.id} q={q} />)}</div>
            )}
          </Collapsible>
        </div>
      </Card>

      <Card id="mistakes">
        <SectionTitle>6 · Common mistakes and how to avoid them</SectionTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">{topic.mistakes.map((m, i) => <li key={i}><MathText text={m} /></li>)}</ul>
        <p className="mt-3 text-xs text-slate-400">Questions you mark partly correct or incorrect are added to <Link to="/papers?tab=mistakes" className="text-accent-300 hover:underline focus-ring">Mistake review</Link>.</p>
      </Card>

      <Card id="quiz">
        <SectionTitle sub="Quick check of the key facts. Score ≥ 80 % counts towards mastery.">7 · Topic quiz</SectionTitle>
        <Quiz topicId={topic.id} items={topic.quiz} />
      </Card>
    </div>
  );
}

export default function UnitPage({ unitId }: { unitId: UnitId }) {
  const unit = unitById.get(unitId)!;
  const { state, dispatch } = useProgress();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [formulaOpen, setFormulaOpen] = useState(false);
  const tab = params.get('tab') ?? 'topics';
  const requested = params.get('topic');
  const topic = useMemo(() => {
    const t = requested ? unit.topics.find((x) => x.id === requested) : undefined;
    return t ?? unit.topics.find((x) => statusOf(state, x.id) !== 'mastered') ?? unit.topics[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, unit]);
  const invalidTopic = requested !== null && !unit.topics.some((x) => x.id === requested);

  useEffect(() => {
    if (tab === 'topics' && topic) dispatch({ type: 'openTopic', topicId: topic.id });
  }, [topic, tab, dispatch]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(t);
  }, [location.hash, topic]);

  const papers = paperQuestions.filter((q) => q.unit === unitId);
  const coverage = coverageMatrix[unitId - 1];
  const issues = sourceIssues.filter((s) => s.unit === unitId);

  const selectTab = (t: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-300">Page {unitId + 1} · Unit {roman[unitId - 1]}</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{unit.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">{unit.overview}</p>
          <p className="mt-1 max-w-3xl text-xs text-slate-500">{unit.notesStatus}</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <ProgressBar value={unitProgress(state, unitId)} label="Unit progress" />
          <div className="no-print flex gap-2"><Button variant="subtle" onClick={() => setFormulaOpen(true)}>Formula sheet / print</Button></div>
        </div>
      </header>

      <div role="tablist" aria-label="Unit sections" className="no-print flex flex-wrap gap-1.5 border-b border-ink-700 pb-2">
        {[['topics', 'Topics'], ['papers', `Past-paper questions (${papers.length})`], ['sources', 'Sources & coverage']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => selectTab(k)} className={`rounded-md px-3 py-1.5 text-sm focus-ring ${tab === k ? 'bg-accent-600 text-white' : 'bg-ink-800 text-slate-300 hover:bg-ink-700'}`}>{l}</button>
        ))}
      </div>

      {tab === 'topics' && (
        <Collapsible title={<>Which method? Pattern-recognition table for Unit {roman[unitId - 1]}</>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead><tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-400"><th className="py-1.5 pr-3 font-medium">If the question looks like…</th><th className="py-1.5 pr-3 font-medium">Use</th><th className="py-1.5 font-medium">Topic</th></tr></thead>
              <tbody>
                {unit.guide.map((g, i) => (
                  <tr key={i} className="border-b border-ink-700/50 align-top">
                    <td className="py-1.5 pr-3 text-slate-200">{g.cue}</td>
                    <td className="py-1.5 pr-3 text-slate-300">{g.method}</td>
                    <td className="py-1.5"><Link to={`?topic=${g.topicId}`} className="text-accent-300 hover:underline focus-ring">{topicById.get(g.topicId)?.short}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">Study aid (our summary). Cues are drawn from the uploaded papers and notes.</p>
        </Collapsible>
      )}

      {tab === 'topics' && (
        <div className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <nav aria-label={`${unit.short} topics`} className="no-print hidden xl:block">
            <ol className="space-y-1 xl:sticky xl:top-4">
              {unit.topics.map((t, i) => (
                <li key={t.id}>
                  <Link to={`?topic=${t.id}`} aria-current={t.id === topic.id ? 'page' : undefined} className={`block rounded-lg border px-3 py-2 text-sm focus-ring ${t.id === topic.id ? 'border-accent-500/60 bg-accent-600/15 text-white' : 'border-ink-700 bg-ink-850 text-slate-300 hover:bg-ink-800'}`}>
                    <div className="flex items-start gap-2"><span className="text-xs tabular-nums text-slate-500">{i + 1}</span><span className="leading-snug">{t.short}</span></div>
                    <div className="ml-4 mt-1 flex flex-wrap gap-1"><StatusPill s={statusOf(state, t.id)} />{paperCountByTopic[t.id] > 0 && <Badge tone="blue">{paperCountByTopic[t.id]} in papers</Badge>}</div>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0">
            <div className="no-print mb-3 xl:hidden">
              <label htmlFor="topic-picker" className="text-xs text-slate-400">Topic ({unit.topics.findIndex((t) => t.id === topic.id) + 1} of {unit.topics.length})</label>
              <div className="mt-1 flex gap-2">
                <select id="topic-picker" value={topic.id} onChange={(e) => { const next = new URLSearchParams(params); next.set('topic', e.target.value); next.delete('tab'); setParams(next); }} className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-900 px-2 py-2 text-sm text-slate-100 focus-ring">
                  {unit.topics.map((t, i) => <option key={t.id} value={t.id}>{i + 1}. {t.short} — {statusLabel[statusOf(state, t.id)]}{paperCountByTopic[t.id] ? ` · ${paperCountByTopic[t.id]} in papers` : ''}</option>)}
                </select>
              </div>
            </div>
            {invalidTopic && <p role="alert" className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-200">That topic link is not part of {unit.short}; showing “{topic.short}” instead.</p>}
            <TopicView topic={topic} />
          </div>
        </div>
      )}

      {tab === 'papers' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">All {papers.length} Unit {roman[unitId - 1]} question parts from the uploaded January 2023 (Sets 1–4) and July 2023 (Set 1) papers. For filters and mock exams use <Link to="/papers?tab=bank" className="text-accent-300 hover:underline focus-ring">Page 7</Link>.</p>
          {papers.map((q) => <QuestionCard key={q.id} q={q} showTopicLink />)}
        </div>
      )}

      {tab === 'sources' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <SectionTitle>Coverage for this unit</SectionTitle>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-400">Uploaded notes</dt><dd className="text-slate-200">{coverage.notes}</dd></div>
              <div><dt className="text-slate-400">Past-paper evidence</dt><dd className="text-slate-200">{coverage.paperParts}</dd></div>
              <div><dt className="text-slate-400">Could be verified</dt><dd className="text-slate-200">{coverage.verifiable}</dd></div>
              <div><dt className="text-slate-400">Could not be verified</dt><dd className="text-slate-200">{coverage.notVerifiable}</dd></div>
            </dl>
          </Card>
          <Card>
            <SectionTitle>Topic-by-topic basis</SectionTitle>
            <ul className="space-y-2 text-sm">
              {unit.topics.map((t) => (
                <li key={t.id}><span className="text-slate-200">{t.short}</span> <span className="text-xs text-slate-500">— {t.notesRef ? `notes pp. ${t.notesRef.pages}` : 'no uploaded notes'}; {paperCountByTopic[t.id]} paper part(s)</span></li>
              ))}
            </ul>
          </Card>
          {issues.length > 0 && (
            <Card className="lg:col-span-2">
              <SectionTitle>Source issues affecting this unit</SectionTitle>
              <ul className="space-y-2 text-sm">{issues.map((s, i) => <li key={i}><span className="font-medium text-amber-300">{s.where}:</span> <span className="text-slate-200">{s.issue}</span> <span className="text-slate-400">{s.handling}</span></li>)}</ul>
            </Card>
          )}
        </div>
      )}

      <FormulaReview open={formulaOpen} onClose={() => setFormulaOpen(false)} initialUnit={unitId} />
    </div>
  );
}
