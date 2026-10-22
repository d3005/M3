import { useState } from 'react';
import { Link } from 'react-router-dom';
import { questionById, topicById, unitById } from '../../data';
import { useProgress } from '../../lib/progress';
import { QuestionCard } from '../../components/QuestionCard';
import { Badge, Button, Card, EmptyState, SectionTitle } from '../../components/ui';

export function MistakesTab() {
  const { state, dispatch } = useProgress();
  const [show, setShow] = useState<'open' | 'resolved'>('open');
  const entries = Object.entries(state.mistakes)
    .map(([id, m]) => ({ id, m, q: questionById.get(id) ?? state.customQuestions.find((c) => c.id === id) }))
    .filter((x) => x.q && (show === 'open' ? !x.m.resolved : x.m.resolved))
    .sort((a, b) => b.m.at.localeCompare(a.m.at));

  const weakTopicIds = [...new Set(entries.filter((e) => !e.m.resolved).map((e) => e.q!.topic))];

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle sub="Questions you marked partly correct or incorrect (practice and mocks). Re-attempt them; a correct re-attempt resolves the mistake.">Mistake review</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant={show === 'open' ? 'primary' : 'subtle'} onClick={() => setShow('open')}>Open ({Object.values(state.mistakes).filter((m) => !m.resolved).length})</Button>
          <Button variant={show === 'resolved' ? 'primary' : 'subtle'} onClick={() => setShow('resolved')}>Resolved ({Object.values(state.mistakes).filter((m) => m.resolved).length})</Button>
        </div>
        {show === 'open' && weakTopicIds.length > 0 && (
          <div className="mt-3 text-sm text-slate-300">
            Targeted revision:{' '}
            {weakTopicIds.map((tid) => {
              const t = topicById.get(tid);
              if (!t) return null;
              const u = unitById.get(t.unit)!;
              return <Link key={tid} to={`${u.path}?topic=${tid}`} className="mr-2 inline-block text-accent-300 hover:underline focus-ring">{u.short}: {t.short}</Link>;
            })}
          </div>
        )}
      </Card>
      {entries.length === 0 ? (
        <EmptyState title={show === 'open' ? 'No open mistakes' : 'Nothing resolved yet'}>
          {show === 'open' ? 'When you mark a question as partly correct or incorrect it appears here for re-testing.' : 'Re-attempt an open mistake and mark it correct to resolve it.'}
        </EmptyState>
      ) : (
        entries.map(({ id, m, q }) => (
          <div key={id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge tone={m.origin === 'mock' ? 'violet' : 'amber'}>From {m.origin}</Badge>
              <span>Logged {new Date(m.at).toLocaleDateString()}</span>
              <Button variant="ghost" onClick={() => dispatch({ type: 'mistakeResolved', questionId: id, resolved: !m.resolved })}>{m.resolved ? 'Re-open' : 'Mark resolved'}</Button>
              <Button variant="ghost" onClick={() => dispatch({ type: 'mistakeRemove', questionId: id })}>Remove</Button>
            </div>
            <label className="block text-xs text-slate-400" htmlFor={`note-${id}`}>What went wrong? (your note)</label>
            <input id={`note-${id}`} value={m.note} onChange={(e) => dispatch({ type: 'mistakeNote', questionId: id, note: e.target.value })} placeholder="e.g. forgot the 1/2 in a₀/2" className="w-full rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 text-sm text-slate-100 focus-ring" />
            <QuestionCard q={q!} showTopicLink />
          </div>
        ))
      )}
    </div>
  );
}
