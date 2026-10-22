import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Question, UnitId } from '../../types';
import { allQuestions, allTopics, paperQuestions, unitById } from '../../data';
import { examinedPapers, mainNumber, paperIdOf, type PaperId } from '../../data/papers';
import { useProgress } from '../../lib/progress';
import { rng } from '../../lib/mock';
import { QuestionCard } from '../../components/QuestionCard';
import { Button, Card, EmptyState, SectionTitle } from '../../components/ui';

const sel = 'rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring';
type Mode = 'paper' | 'topic' | 'mixed';

export function PracticeTab() {
  const [params, setParams] = useSearchParams();
  const mode = (params.get('mode') as Mode) || 'paper';
  const setMode = (m: Mode) => {
    const next = new URLSearchParams(params);
    next.set('mode', m);
    setParams(next, { replace: true });
  };
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Practice mode" className="flex flex-wrap gap-1.5">
        {([['paper', 'Previous-paper practice'], ['topic', 'Topic-based practice'], ['mixed', 'Mixed revision']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-md px-3 py-1.5 text-sm focus-ring ${mode === m ? 'bg-accent-600 text-white' : 'bg-ink-800 text-slate-300 hover:bg-ink-700'}`}>{l}</button>
        ))}
      </div>
      {mode === 'paper' && <PaperPractice />}
      {mode === 'topic' && <TopicPractice />}
      {mode === 'mixed' && <MixedRevision />}
    </div>
  );
}

function PaperPractice() {
  const [params, setParams] = useSearchParams();
  const paper = (params.get('paper') as PaperId) || examinedPapers[0].id;
  const qs = paperQuestions.filter((q) => paperIdOf(q) === paper).sort((a, b) => mainNumber(a) - mainNumber(b));
  const meta = examinedPapers.find((p) => p.id === paper) ?? examinedPapers[0];
  return (
    <Card>
      <SectionTitle sub="Work through a real paper in order. Each unit offers two alternatives (Q2k−1 OR Q2k).">Previous-paper practice</SectionTitle>
      <label className="block text-sm text-slate-300">Paper{' '}
        <select value={paper} onChange={(e) => { const n = new URLSearchParams(params); n.set('paper', e.target.value); setParams(n, { replace: true }); }} className={sel}>
          {examinedPapers.map((p) => <option key={p.id} value={p.id}>{p.exam} · {p.type} · {p.set}</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-400">{meta.code} · {meta.regulation} · {meta.duration} · {meta.maxMarks} marks · {meta.branches} · file {meta.file} pp. {meta.pages}</p>
      <div className="mt-4 space-y-5">
        {[1, 2, 3, 4, 5].map((u) => (
          <div key={u}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-300">{unitById.get(u as UnitId)!.title} — answer Q{2 * u - 1} OR Q{2 * u}</h3>
            <div className="space-y-3">{qs.filter((q) => q.unit === u).map((q) => <QuestionCard key={q.id} q={q} showTopicLink />)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopicPractice() {
  const { state } = useProgress();
  const [unit, setUnit] = useState<UnitId>(1);
  const topics = allTopics.filter((t) => t.unit === unit);
  const [topic, setTopic] = useState(topics[0].id);
  const pool = [...allQuestions, ...state.customQuestions].filter((q) => q.topic === topic);
  const papers = pool.filter((q) => q.sourceType === 'uploaded_past_paper' || q.sourceType === 'student_entered');
  const others = pool.filter((q) => !papers.includes(q));
  return (
    <Card>
      <SectionTitle sub="Past-paper questions first, then notes-based and generated practice for the same skill.">Topic-based practice</SectionTitle>
      <div className="flex flex-wrap gap-2">
        <label className="text-sm text-slate-300">Unit{' '}<select value={unit} onChange={(e) => { const u = Number(e.target.value) as UnitId; setUnit(u); setTopic(allTopics.find((t) => t.unit === u)!.id); }} className={sel}>{[1, 2, 3, 4, 5].map((u) => <option key={u} value={u}>Unit {['I', 'II', 'III', 'IV', 'V'][u - 1]}</option>)}</select></label>
        <label className="text-sm text-slate-300">Topic{' '}<select value={topic} onChange={(e) => setTopic(e.target.value)} className={sel}>{topics.map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}</select></label>
      </div>
      <div className="mt-4 space-y-3">
        {pool.length === 0 && <EmptyState title="No questions for this topic yet." />}
        {papers.map((q) => <QuestionCard key={q.id} q={q} />)}
        {others.map((q) => <QuestionCard key={q.id} q={q} />)}
      </div>
    </Card>
  );
}

function MixedRevision() {
  const { state } = useProgress();
  const [unitsSel, setUnitsSel] = useState<UnitId[]>([1, 2, 3, 4, 5]);
  const [count, setCount] = useState(6);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const [includeGenerated, setIncludeGenerated] = useState(true);

  const set: Question[] = useMemo(() => {
    const rand = rng(seed);
    const pool = [...allQuestions, ...state.customQuestions].filter((q) => unitsSel.includes(q.unit) && q.solutionSteps.length > 0 && (includeGenerated || q.sourceType !== 'generated_practice'));
    // Prefer questions never attempted or last marked wrong/partly; then random.
    const weight = (q: Question) => {
      const a = state.attempts[q.id];
      return (!a ? 2 : a.result === 'incorrect' ? 3 : a.result === 'partial' ? 2 : 0) + rand() * 2;
    };
    return pool.map((q) => ({ q, w: weight(q) })).sort((a, b) => b.w - a.w).slice(0, count).map((x) => x.q);
    // seed drives regeneration; attempts intentionally excluded so the set does not reshuffle while marking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, unitsSel, count, includeGenerated]);

  return (
    <Card>
      <SectionTitle sub="A shuffled set favouring questions you have not done or got wrong.">Mixed revision</SectionTitle>
      <fieldset className="flex flex-wrap gap-3 text-sm text-slate-300">
        <legend className="sr-only">Units</legend>
        {([1, 2, 3, 4, 5] as UnitId[]).map((u) => (
          <label key={u} className="flex items-center gap-1.5"><input type="checkbox" className="accent-blue-500" checked={unitsSel.includes(u)} onChange={() => setUnitsSel((s) => (s.includes(u) ? s.filter((x) => x !== u) : [...s, u]))} />Unit {['I', 'II', 'III', 'IV', 'V'][u - 1]}</label>
        ))}
        <label className="flex items-center gap-1.5">Questions <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className={`${sel} w-16`} /></label>
        <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-blue-500" checked={includeGenerated} onChange={(e) => setIncludeGenerated(e.target.checked)} />Include generated practice</label>
        <Button variant="subtle" onClick={() => setSeed((s) => s + 1)}>New set</Button>
      </fieldset>
      <div className="mt-4 space-y-3">
        {unitsSel.length === 0 ? <EmptyState title="Choose at least one unit." /> : set.length === 0 ? <EmptyState title="No questions available for this selection." /> : set.map((q) => <QuestionCard key={q.id} q={q} showTopicLink />)}
      </div>
    </Card>
  );
}
