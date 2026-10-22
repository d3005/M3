import { useSearchParams } from 'react-router-dom';
import { paperQuestions, practiceQuestions } from '../data';
import { examinedPapers } from '../data/papers';
import { RESEARCH_DATE } from '../data/sources';
import { useProgress } from '../lib/progress';
import { ResearchTab, FrequencyTab } from './papers/Research';
import { BankTab } from './papers/Bank';
import { PracticeTab } from './papers/Practice';
import { MockTab } from './papers/Mock';
import { MistakesTab } from './papers/Mistakes';
import { AddQuestionTab } from './papers/AddQuestion';

const TABS = [
  ['research', 'Archive & research'],
  ['frequency', 'Frequency report'],
  ['bank', 'Question bank'],
  ['practice', 'Practice modes'],
  ['mock', 'Timed mock exam'],
  ['mistakes', 'Mistake review'],
  ['add', 'Add a question'],
] as const;

export default function PapersPage() {
  const [params, setParams] = useSearchParams();
  const { state } = useProgress();
  const tab = (params.get('tab') ?? 'research') as (typeof TABS)[number][0];
  const select = (t: string) => setParams(new URLSearchParams({ tab: t }), { replace: false });
  const openMistakes = Object.values(state.mistakes).filter((m) => !m.resolved).length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-accent-300">Page 7 · Previous papers, practice & mock exams</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Previous Papers, Practice and Mock Exams</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          {paperQuestions.length} question parts transcribed from {examinedPapers.length} verified paper sets (uploaded Jan 2023 Sets 1–4 and Jul 2023 Set 1, code R2021011),
          plus {practiceQuestions.length} practice questions from notes or clearly labelled as generated. Online research ({RESEARCH_DATE}) found further papers, but none could be opened from this environment — see Archive & research.
        </p>
      </header>
      <div role="tablist" aria-label="Page 7 sections" className="flex flex-wrap gap-1.5 border-b border-ink-700 pb-2">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => select(k)} className={`rounded-md px-3 py-1.5 text-sm focus-ring ${tab === k ? 'bg-accent-600 text-white' : 'bg-ink-800 text-slate-300 hover:bg-ink-700'}`}>
            {l}{k === 'mistakes' && openMistakes > 0 ? ` (${openMistakes})` : ''}
          </button>
        ))}
      </div>
      {tab === 'research' && <ResearchTab />}
      {tab === 'frequency' && <FrequencyTab />}
      {tab === 'bank' && <BankTab />}
      {tab === 'practice' && <PracticeTab />}
      {tab === 'mock' && <MockTab />}
      {tab === 'mistakes' && <MistakesTab />}
      {tab === 'add' && <AddQuestionTab />}
      {!TABS.some(([k]) => k === tab) && <ResearchTab />}
    </div>
  );
}
