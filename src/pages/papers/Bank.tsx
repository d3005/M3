import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Difficulty, Question, SourceType, UnitId } from '../../types';
import { allQuestions, allTopics } from '../../data';
import { useProgress } from '../../lib/progress';
import { plain } from '../../lib/search';
import { QuestionCard } from '../../components/QuestionCard';
import { Button, EmptyState } from '../../components/ui';

const sel = 'rounded-md border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring';

export function BankTab() {
  const { state } = useProgress();
  const [params, setParams] = useSearchParams();
  const focusId = params.get('q');
  const [unit, setUnit] = useState<UnitId | 'all'>('all');
  const [topic, setTopic] = useState('all');
  const [year, setYear] = useState('all');
  const [examType, setExamType] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [source, setSource] = useState<SourceType | 'all'>('all');
  const [solved, setSolved] = useState<'all' | 'solved' | 'unsolved' | 'attempted' | 'unattempted'>('all');
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(20);

  const pool: Question[] = useMemo(() => [...allQuestions, ...state.customQuestions], [state.customQuestions]);
  const years = [...new Set(pool.map((q) => q.exam?.year).filter(Boolean))].sort() as number[];
  const types = [...new Set(pool.map((q) => q.exam?.type).filter(Boolean))] as string[];

  const filtered = useMemo(() => {
    if (focusId) return pool.filter((q) => q.id === focusId);
    const terms = plain(text).split(' ').filter(Boolean);
    return pool.filter((q) => {
      if (unit !== 'all' && q.unit !== unit) return false;
      if (topic !== 'all' && q.topic !== topic) return false;
      if (year !== 'all' && String(q.exam?.year ?? '') !== year) return false;
      if (examType !== 'all' && q.exam?.type !== examType) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      if (source !== 'all' && q.sourceType !== source) return false;
      const hasSol = q.solutionSteps.length > 0 && q.verificationStatus !== 'not_verified';
      if (solved === 'solved' && !hasSol) return false;
      if (solved === 'unsolved' && hasSol) return false;
      if (solved === 'attempted' && !state.attempts[q.id]) return false;
      if (solved === 'unattempted' && state.attempts[q.id]) return false;
      if (terms.length) {
        const hay = plain(`${q.title} ${q.question}`);
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [pool, focusId, unit, topic, year, examType, difficulty, source, solved, text, state.attempts]);

  const clearFocus = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    setParams(next, { replace: true });
  };
  const resetFilters = () => {
    setUnit('all'); setTopic('all'); setYear('all'); setExamType('all'); setDifficulty('all'); setSource('all'); setSolved('all'); setText(''); setLimit(20);
  };

  return (
    <div className="space-y-4">
      {focusId ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent-500/40 bg-accent-500/10 p-2 text-sm text-slate-200">
          Showing one question from search. <Button variant="subtle" onClick={clearFocus}>Show the whole bank</Button>
        </div>
      ) : (
        <div className="grid gap-2 rounded-xl border border-ink-700 bg-ink-850 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-400">Search text<input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Lagrange, sin(3x+2y)" className={`${sel} mt-1 w-full`} /></label>
          <label className="text-xs text-slate-400">Unit<select value={unit} onChange={(e) => { setUnit(e.target.value === 'all' ? 'all' : (Number(e.target.value) as UnitId)); setTopic('all'); }} className={`${sel} mt-1 w-full`}><option value="all">All units</option>{[1, 2, 3, 4, 5].map((u) => <option key={u} value={u}>Unit {['I', 'II', 'III', 'IV', 'V'][u - 1]}</option>)}</select></label>
          <label className="text-xs text-slate-400">Topic<select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${sel} mt-1 w-full`}><option value="all">All topics</option>{allTopics.filter((t) => unit === 'all' || t.unit === unit).map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}</select></label>
          <label className="text-xs text-slate-400">Source<select value={source} onChange={(e) => setSource(e.target.value as SourceType | 'all')} className={`${sel} mt-1 w-full`}><option value="all">All sources</option><option value="uploaded_past_paper">Original past-paper questions</option><option value="uploaded_note">From uploaded notes</option><option value="generated_practice">Generated practice</option><option value="student_entered">Entered by me</option></select></label>
          <label className="text-xs text-slate-400">Exam year<select value={year} onChange={(e) => setYear(e.target.value)} className={`${sel} mt-1 w-full`}><option value="all">Any year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
          <label className="text-xs text-slate-400">Regular / supplementary<select value={examType} onChange={(e) => setExamType(e.target.value)} className={`${sel} mt-1 w-full`}><option value="all">Any</option>{types.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
          <label className="text-xs text-slate-400">Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')} className={`${sel} mt-1 w-full`}><option value="all">Any</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
          <label className="text-xs text-slate-400">Solution / my status<select value={solved} onChange={(e) => setSolved(e.target.value as typeof solved)} className={`${sel} mt-1 w-full`}><option value="all">Any</option><option value="solved">Has a checked solution</option><option value="unsolved">No checked solution</option><option value="attempted">I have attempted</option><option value="unattempted">Not attempted yet</option></select></label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
            <span className="text-sm text-slate-300" role="status">{filtered.length} question{filtered.length === 1 ? '' : 's'}</span>
            <Button variant="ghost" onClick={resetFilters}>Clear filters</Button>
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <EmptyState title="No questions match these filters.">Try clearing a filter. Difficulty for past-paper questions is our estimate.</EmptyState>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, limit).map((q) => <QuestionCard key={q.id} q={q} showTopicLink />)}
          {filtered.length > limit && <Button variant="subtle" onClick={() => setLimit((l) => l + 20)}>Show 20 more ({filtered.length - limit} left)</Button>}
        </div>
      )}
    </div>
  );
}
