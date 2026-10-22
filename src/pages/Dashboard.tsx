import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { TopicStatus } from '../types';
import { allTopics, priorityExplain, priorityOf, topicById, unitById, units } from '../data';
import { parseState, todayISO, useProgress, type ChecklistItem } from '../lib/progress';
import { daysUntil, openMistakes, overallProgress, statusCounts, statusLabel, statusOf, unitProgress, weakTopics } from '../lib/analytics';
import { buildPlan, orderedTopics } from '../lib/plan';
import { Badge, Button, Card, EmptyState, PriorityBadge, ProgressBar, SectionTitle, StatusPill } from '../components/ui';
import { FormulaReview } from '../components/FormulaReview';

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export default function Dashboard() {
  const { state, dispatch, reset } = useProgress();
  const navigate = useNavigate();
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const days = daysUntil(state.examDate);
  const plan = useMemo(() => buildPlan(state), [state]);
  const counts = statusCounts(state);
  const weak = weakTopics(state);
  const mistakes = openMistakes(state);
  const today = todayISO();

  const continueTarget = (() => {
    const last = state.lastVisited && topicById.get(state.lastVisited.topicId);
    if (last && statusOf(state, last.id) !== 'mastered') return last;
    return orderedTopics(state)[0] ?? null;
  })();

  const checklist = state.checklist?.date === today ? state.checklist : null;

  const makeChecklistFromPlan = () => {
    const d0 = plan.ok ? plan.days[0] : null;
    const items: ChecklistItem[] = [];
    if (d0) {
      for (const it of d0.items) {
        const u = unitById.get(it.topic.unit)!;
        items.push({ id: `${it.topic.id}-${it.kind}`, text: `${it.kind === 'learn' ? 'Learn' : it.kind === 'practise' ? 'Practise' : 'Revise'}: ${u.short} — ${it.topic.short} (~${it.hours} h)`, done: false, link: `${u.path}?topic=${it.topic.id}` });
      }
      for (const e of d0.extra) items.push({ id: `extra-${items.length}`, text: e, done: false, link: '/papers?tab=mock' });
    } else {
      for (const t of orderedTopics(state).slice(0, 2)) {
        const u = unitById.get(t.unit)!;
        items.push({ id: `${t.id}-study`, text: `Study ${u.short} — ${t.short}`, done: false, link: `${u.path}?topic=${t.id}` });
      }
    }
    if (mistakes.length) items.push({ id: 'mistakes', text: `Re-attempt ${Math.min(3, mistakes.length)} open mistake(s)`, done: false, link: '/papers?tab=mistakes' });
    items.push({ id: 'formulas', text: 'Formula review (10 minutes)', done: false });
    dispatch({ type: 'setChecklist', checklist: { date: today, items } });
  };

  const addItem = () => {
    const text = newItem.trim();
    if (!text) return;
    const base = checklist ?? { date: today, items: [] };
    dispatch({ type: 'setChecklist', checklist: { date: today, items: [...base.items, { id: `c-${Date.now()}`, text, done: false }] } });
    setNewItem('');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `m3-progress-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed = parseState(JSON.parse(await file.text()));
      if (!parsed) throw new Error('not a progress file');
      dispatch({ type: 'replace', state: parsed });
      setImportMsg('Progress imported.');
    } catch {
      setImportMsg('That file is not a valid progress export — nothing was changed.');
    }
  };

  const filteredTopics = allTopics.filter((t) => statusFilter === 'all' || statusOf(state, t.id) === statusFilter);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = todayISO(d);
    return { k, n: state.activity[k] ?? 0, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-accent-300">Page 1 · Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Your M3 preparation</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Every number here comes from what you have actually done in this browser — nothing is pre-filled. Content sources:
          uploaded notes for Units III–V, the uploaded Jan & Jul 2023 papers for all units, and clearly labelled standard mathematics where notes were not provided.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <SectionTitle sub="You choose the date — the app never assumes it.">Exam countdown</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="text-sm text-slate-300">
              Exam date
              <input type="date" value={state.examDate ?? ''} onChange={(e) => dispatch({ type: 'setExamDate', date: e.target.value || null })} className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 text-slate-100 focus-ring [color-scheme:dark]" />
            </label>
            <label className="text-sm text-slate-300">
              Study hours per day
              <input type="number" min={0.5} max={16} step={0.5} value={state.hoursPerDay ?? ''} placeholder="e.g. 3" onChange={(e) => { const v = parseFloat(e.target.value); dispatch({ type: 'setHours', hours: Number.isFinite(v) && v > 0 ? Math.min(16, v) : null }); }} className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 text-slate-100 focus-ring" />
            </label>
          </div>
          <div className="mt-4 rounded-lg bg-ink-900/70 p-3 text-center" aria-live="polite">
            {days === null ? (
              <p className="text-sm text-slate-400">No exam date set yet.</p>
            ) : days > 0 ? (
              <>
                <div className="text-4xl font-bold tabular-nums text-white">{days}</div>
                <div className="text-sm text-slate-400">day{days === 1 ? '' : 's'} to go</div>
              </>
            ) : days === 0 ? (
              <p className="font-semibold text-amber-300">Exam day. Light revision only — you've got this.</p>
            ) : (
              <p className="text-sm text-amber-300">That date has passed. Update it for a new plan.</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle sub="Weighted by status: Learning 25 %, Practising 60 %, Mastered 100 %.">Progress</SectionTitle>
          <ProgressBar value={overallProgress(state)} label="Overall" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {units.map((u) => (
              <Link key={u.id} to={u.path} className="rounded-lg p-1 focus-ring hover:bg-ink-800">
                <ProgressBar value={unitProgress(state, u.id)} label={u.title} />
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {(Object.keys(counts) as TopicStatus[]).map((s) => (
              <span key={s} className="rounded-md bg-ink-900 px-2 py-1 text-slate-300">{statusLabel[s]}: <span className="font-semibold tabular-nums text-white">{counts[s]}</span></span>
            ))}
            <span className="rounded-md bg-ink-900 px-2 py-1 text-slate-400">of {allTopics.length} topics</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button className="py-3" onClick={() => continueTarget && navigate(`${unitById.get(continueTarget.unit)!.path}?topic=${continueTarget.id}`)} disabled={!continueTarget}>
          {continueTarget ? <>Continue studying: {continueTarget.short} →</> : 'All topics mastered 🎉'}
        </Button>
        <Button className="py-3" variant="subtle" onClick={() => setFormulaOpen(true)}>Formula review</Button>
        <Button className="py-3" variant="subtle" onClick={() => navigate('/papers?tab=mistakes')}>Mistake review ({mistakes.length} open)</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Generated from your exam date, hours and saved progress. A plan, not a promise.">Daily study plan</SectionTitle>
          {!plan.ok ? (
            <EmptyState title="No plan yet">{plan.reason}</EmptyState>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <Badge>Needs ≈ {plan.hoursNeeded.toFixed(1)} h</Badge>
                <Badge>Available ≈ {plan.capacity.toFixed(1)} h</Badge>
                {plan.shortMode && <Badge tone="amber">Short-time mode</Badge>}
              </div>
              {plan.shortMode && (
                <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-200">
                  Not enough time for every topic at full depth. Topics are compressed (~60 % of the usual time), weakest and higher-priority first.
                  {plan.skipped.length > 0 && <> Not scheduled: {plan.skipped.map((t) => t.short).join(', ')}.</>} Priorities are recommendations from the 2023 papers, not predictions.
                </p>
              )}
              <ol className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {plan.days.slice(0, 14).map((d) => (
                  <li key={d.index} className="rounded-lg bg-ink-900/60 p-2">
                    <div className="mb-1 flex justify-between text-xs text-slate-400"><span className="font-medium text-slate-200">{d.index === 0 ? 'Today' : fmtDate(d.date)}</span><span>{d.hours.toFixed(1)} h</span></div>
                    <ul className="space-y-0.5 text-sm">
                      {d.items.map((it, i) => {
                        const u = unitById.get(it.topic.unit)!;
                        return <li key={i}><Link className="text-accent-300 hover:underline focus-ring" to={`${u.path}?topic=${it.topic.id}`}>{it.kind === 'learn' ? 'Learn' : it.kind === 'practise' ? 'Practise' : 'Revise'} {it.topic.short}</Link> <span className="text-xs text-slate-500">({u.short}, {it.hours} h)</span></li>;
                      })}
                      {d.extra.map((e, i) => <li key={`e${i}`} className="text-slate-300">{e}</li>)}
                    </ul>
                  </li>
                ))}
              </ol>
              {plan.days.length > 14 && <p className="mt-2 text-xs text-slate-500">Showing the next 14 of {plan.days.length} days.</p>}
            </>
          )}
        </Card>

        <Card>
          <SectionTitle sub="Today's targets. Ticks are saved; the list starts fresh each day.">Daily checklist</SectionTitle>
          {!checklist ? (
            <EmptyState title="No checklist for today">
              <div className="mt-2"><Button onClick={makeChecklistFromPlan}>Create today's checklist{plan.ok ? ' from the plan' : ''}</Button></div>
            </EmptyState>
          ) : (
            <>
              <ProgressBar value={checklist.items.filter((i) => i.done).length / Math.max(1, checklist.items.length)} label={`${checklist.items.filter((i) => i.done).length}/${checklist.items.length} done`} />
              <ul className="mt-3 space-y-1.5">
                {checklist.items.map((it) => (
                  <li key={it.id} className="flex items-start gap-2 text-sm">
                    <input id={`chk-${it.id}`} type="checkbox" checked={it.done} onChange={() => dispatch({ type: 'toggleChecklist', id: it.id })} className="mt-1 h-4 w-4 accent-blue-500" />
                    <label htmlFor={`chk-${it.id}`} className={`flex-1 ${it.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{it.text}</label>
                    {it.link && <Link to={it.link} className="text-xs text-accent-300 hover:underline focus-ring">open</Link>}
                    <button type="button" aria-label={`Remove ${it.text}`} className="text-xs text-slate-500 hover:text-rose-300 focus-ring" onClick={() => dispatch({ type: 'setChecklist', checklist: { ...checklist, items: checklist.items.filter((x) => x.id !== it.id) } })}>✕</button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <label htmlFor="new-check" className="sr-only">Add checklist item</label>
                <input id="new-check" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} placeholder="Add your own target…" className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring" />
                <Button variant="subtle" onClick={addItem}>Add</Button>
              </div>
              <div className="mt-2"><Button variant="ghost" onClick={makeChecklistFromPlan}>Rebuild from plan</Button></div>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Topics where your quiz, practice and mock results average below 60 %.">Weak topics</SectionTitle>
          {weak.length === 0 ? (
            <EmptyState title="No weak topics detected yet">
              {Object.keys(state.quiz).length + Object.keys(state.attempts).length === 0 ? 'Take a topic quiz or mark a practice question — results will appear here.' : 'Nothing below 60 % so far. Keep testing yourself.'}
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {weak.slice(0, 8).map(({ topic, perf }) => {
                const u = unitById.get(topic.unit)!;
                return (
                  <li key={topic.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ink-900/60 p-2 text-sm">
                    <Link to={`${u.path}?topic=${topic.id}`} className="text-accent-300 hover:underline focus-ring">{u.short}: {topic.short}</Link>
                    <span className="text-xs text-slate-400">{Math.round((perf.combined ?? 0) * 100)}% · {perf.evidence} result{perf.evidence === 1 ? '' : 's'}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {weak.length > 0 && <div className="mt-3"><Button variant="subtle" onClick={() => navigate('/papers?tab=mock&mode=weak')}>Build a targeted mock from weak areas</Button></div>}
        </Card>

        <Card>
          <SectionTitle sub="Actions recorded per day (quizzes, marked questions, checklist ticks, mocks).">Recent activity</SectionTitle>
          <div className="flex h-28 items-end gap-2" role="img" aria-label={`Activity last 7 days: ${last7.map((d) => d.n).join(', ')}`}>
            {last7.map((d) => {
              const max = Math.max(1, ...last7.map((x) => x.n));
              return (
                <div key={d.k} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] tabular-nums text-slate-400">{d.n || ''}</span>
                  <div className="w-full rounded-t bg-accent-500/70" style={{ height: `${(d.n / max) * 80 + (d.n ? 4 : 1)}px` }} />
                  <span className="text-[10px] text-slate-500">{d.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">Mocks taken: {state.mocks.length}. Questions self-marked: {Object.keys(state.attempts).length}. Quizzes taken: {Object.keys(state.quiz).length}.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <SectionTitle sub={priorityExplain}>All topics</SectionTitle>
          <label className="text-sm text-slate-300">
            Show{' '}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TopicStatus | 'all')} className="rounded-md border border-ink-600 bg-ink-900 px-2 py-1 text-sm focus-ring">
              <option value="all">All</option>
              {(Object.keys(statusLabel) as TopicStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </label>
        </div>
        {filteredTopics.length === 0 ? (
          <EmptyState title="No topics with that status." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-2 font-medium">Topic</th><th className="py-2 pr-2 font-medium">Priority</th><th className="py-2 pr-2 font-medium">Quiz best</th><th className="py-2 font-medium">Status (you can override)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((t) => {
                  const u = unitById.get(t.unit)!;
                  const q = state.quiz[t.id];
                  return (
                    <tr key={t.id} className="border-b border-ink-700/50">
                      <td className="py-1.5 pr-2"><Link className="text-slate-200 hover:text-accent-300 focus-ring" to={`${u.path}?topic=${t.id}`}><span className="text-xs text-slate-500">{u.short} · </span>{t.short}</Link></td>
                      <td className="py-1.5 pr-2"><PriorityBadge p={priorityOf(t.id)} /></td>
                      <td className="py-1.5 pr-2 tabular-nums text-slate-300">{q ? `${q.best}/${q.total}` : '—'}</td>
                      <td className="py-1.5">
                        <div className="flex items-center gap-2">
                          <StatusPill s={statusOf(state, t.id)} />
                          <label className="sr-only" htmlFor={`st-${t.id}`}>Status of {t.short}</label>
                          <select id={`st-${t.id}`} value={statusOf(state, t.id)} onChange={(e) => dispatch({ type: 'setStatus', topicId: t.id, status: e.target.value as TopicStatus })} className="rounded-md border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-xs focus-ring">
                            {(Object.keys(statusLabel) as TopicStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle sub="Progress lives only in this browser's local storage. Export a backup to move it to another device.">Your data</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" onClick={exportData}>Export progress (JSON)</Button>
          <Button variant="subtle" onClick={() => fileRef.current?.click()}>Import progress…</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ''; }} aria-label="Import progress file" />
          {!confirmReset ? (
            <Button variant="danger" onClick={() => setConfirmReset(true)}>Reset all progress</Button>
          ) : (
            <div role="alertdialog" aria-label="Confirm reset" className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-100">
              This deletes your exam date, statuses, quiz scores, mistakes, checklist and mock history. Continue?
              <Button variant="danger" onClick={() => { reset(); setConfirmReset(false); }}>Yes, reset</Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          )}
        </div>
        {importMsg && <p role="status" className="mt-2 text-sm text-slate-300">{importMsg}</p>}
      </Card>

      <FormulaReview open={formulaOpen} onClose={() => setFormulaOpen(false)} />
    </div>
  );
}
