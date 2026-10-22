import { useState } from 'react';
import type { Question, UnitId } from '../../types';
import { allTopics } from '../../data';
import { useProgress } from '../../lib/progress';
import { MathText } from '../../components/MathText';
import { Button, Card, EmptyState, SectionTitle } from '../../components/ui';

const field = 'mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring';

/**
 * Lets the student add questions from papers they hold (e.g. files not uploaded here).
 * They are labelled "Entered by you (unverified)" and excluded from the verified frequency report.
 */
export function AddQuestionTab() {
  const { state, dispatch } = useProgress();
  const [unit, setUnit] = useState<UnitId>(1);
  const [topic, setTopic] = useState(allTopics.find((t) => t.unit === 1)!.id);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<'Regular/Supplementary' | 'Supplementary' | 'Unknown'>('Unknown');
  const [set, setSet] = useState('');
  const [qn, setQn] = useState('');
  const [marks, setMarks] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const add = () => {
    if (!text.trim()) return setError('Type the question text.');
    const y = parseInt(year, 10);
    if (year && (!Number.isFinite(y) || y < 2000 || y > 2100)) return setError('Year looks wrong.');
    setError(null);
    const q: Question = {
      id: `mine-${Date.now()}`,
      unit, topic, subtopic: null,
      title: title.trim() || text.trim().slice(0, 60),
      question: text.trim(),
      sourceType: 'student_entered',
      sourceFilename: null, sourcePage: null, sourceUrl: null,
      exam: month || year ? { date: `${month} ${year}`.trim(), year: Number.isFinite(y) ? y : 0, type, set: set.trim(), questionNumber: qn.trim(), code: null } : null,
      difficulty: 'medium',
      marks: marks ? Number(marks) : null,
      prerequisites: [], formulaReferences: [],
      solutionSteps: answer.trim() ? [`Your recorded answer (not verified by this app): ${answer.trim()}`] : [],
      finalAnswer: answer.trim() || 'Not provided',
      verificationStatus: 'not_verified',
      verificationNote: 'Entered by you — this app has not checked the wording or the answer.',
      commonMistakes: [],
      transcription: 'student_entered', transcriptionNote: null, groupKey: null,
    };
    dispatch({ type: 'addCustom', question: q });
    setSaved(q.title);
    setText(''); setTitle(''); setAnswer(''); setQn(''); setMarks('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle sub="Have a paper that was not uploaded? Add its questions here. They are kept in this browser, shown in the bank as “Entered by you (unverified)”, and never counted in the verified frequency report.">Add a question from your own paper</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-300">Unit<select value={unit} onChange={(e) => { const u = Number(e.target.value) as UnitId; setUnit(u); setTopic(allTopics.find((t) => t.unit === u)!.id); }} className={field}>{[1, 2, 3, 4, 5].map((u) => <option key={u} value={u}>Unit {['I', 'II', 'III', 'IV', 'V'][u - 1]}</option>)}</select></label>
          <label className="text-sm text-slate-300">Topic<select value={topic} onChange={(e) => setTopic(e.target.value)} className={field}>{allTopics.filter((t) => t.unit === unit).map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}</select></label>
          <label className="text-sm text-slate-300 sm:col-span-2">Question text (LaTeX between $…$ is rendered)<textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={field} placeholder="Solve $p^2+q^2=1$." /></label>
          {text && <div className="rounded-lg bg-ink-900/60 p-2 text-sm text-slate-200 sm:col-span-2"><span className="text-xs text-slate-500">Preview: </span><MathText text={text} /></div>}
          <label className="text-sm text-slate-300">Short title (optional)<input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
          <label className="text-sm text-slate-300">Marks<input type="number" min={1} max={14} value={marks} onChange={(e) => setMarks(e.target.value)} className={field} /></label>
          <label className="text-sm text-slate-300">Exam month<input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="e.g. February" className={field} /></label>
          <label className="text-sm text-slate-300">Exam year<input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" className={field} /></label>
          <label className="text-sm text-slate-300">Exam type<select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={field}><option value="Unknown">Unknown</option><option value="Regular/Supplementary">Regular/Supplementary</option><option value="Supplementary">Supplementary</option></select></label>
          <label className="text-sm text-slate-300">Set / Q.no.<div className="flex gap-2"><input value={set} onChange={(e) => setSet(e.target.value)} placeholder="Set 2" className={field} /><input value={qn} onChange={(e) => setQn(e.target.value)} placeholder="5(a)" className={field} /></div></label>
          <label className="text-sm text-slate-300 sm:col-span-2">Your answer (optional, unverified)<input value={answer} onChange={(e) => setAnswer(e.target.value)} className={field} /></label>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
        {saved && <p role="status" className="mt-2 text-sm text-emerald-300">Added “{saved}”. Find it in the Question bank (source: Entered by me).</p>}
        <div className="mt-3"><Button onClick={add}>Add question</Button></div>
      </Card>
      <Card>
        <SectionTitle>Your entered questions ({state.customQuestions.length})</SectionTitle>
        {state.customQuestions.length === 0 ? <EmptyState title="None yet." /> : (
          <ul className="space-y-2">
            {state.customQuestions.map((q) => (
              <li key={q.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-ink-900/60 p-2 text-sm">
                <div className="min-w-0"><div className="text-slate-200">{q.title}</div><div className="text-xs text-slate-400">{q.exam?.date || 'date not given'} {q.exam?.set} {q.exam?.questionNumber && `Q${q.exam.questionNumber}`}</div></div>
                <Button variant="ghost" onClick={() => dispatch({ type: 'removeCustom', id: q.id })}>Delete</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
