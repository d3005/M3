import { Link } from 'react-router-dom';
import { allTopics, paperQuestions, unitById, units } from '../../data';
import { examinedPapers, paperIdOf } from '../../data/papers';
import { coverageMatrix, examPattern, inventory, missingMaterials, RESEARCH_DATE, researchMethodology, sourceIssues, webSources } from '../../data/sources';
import { useProgress } from '../../lib/progress';
import { Badge, Card, EmptyState, SectionTitle } from '../../components/ui';

export function ResearchTab() {
  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle sub={`Research performed ${RESEARCH_DATE}.`}>Research methodology</SectionTitle>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-200">{researchMethodology.map((m, i) => <li key={i}>{m}</li>)}</ol>
      </Card>

      <Card>
        <SectionTitle sub="Only these papers were actually read. Each question in the bank links back to its set and PDF page.">Examined papers (verified against their contents)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead><tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-400"><th className="py-2 pr-2">Exam</th><th className="py-2 pr-2">Type</th><th className="py-2 pr-2">Set</th><th className="py-2 pr-2">Code / Reg.</th><th className="py-2 pr-2">Pattern</th><th className="py-2 pr-2">File (PDF pages)</th><th className="py-2">Parts</th></tr></thead>
            <tbody>
              {examinedPapers.map((p) => (
                <tr key={p.id} className="border-b border-ink-700/50">
                  <td className="py-1.5 pr-2 text-slate-200">{p.exam}</td>
                  <td className="py-1.5 pr-2 text-slate-300">{p.type}</td>
                  <td className="py-1.5 pr-2 text-slate-300">{p.set}</td>
                  <td className="py-1.5 pr-2 text-slate-300">{p.code} / {p.regulation}</td>
                  <td className="py-1.5 pr-2 text-slate-300">{p.duration}, {p.maxMarks} marks</td>
                  <td className="py-1.5 pr-2 font-mono text-xs text-slate-400">{p.file} ({p.pages})</td>
                  <td className="py-1.5 tabular-nums text-slate-300"><Link className="text-accent-300 hover:underline focus-ring" to={`/papers?tab=practice&mode=paper&paper=${p.id}`}>{paperQuestions.filter((q) => paperIdOf(q) === p.id).length}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">Full paper accessible: yes (all pages uploaded). Verified: every question transcribed from the page image. No direct web link is given because these copies came from your upload, not a URL.</p>
      </Card>

      <Card>
        <SectionTitle sub="Provisional — confirm the current pattern with your college.">Exam pattern</SectionTitle>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">{examPattern.verified.map((v, i) => <li key={i}>{v}</li>)}</ul>
        <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-sm text-amber-200">{examPattern.provisional}</p>
      </Card>

      <Card>
        <SectionTitle sub="Found by web search, but none could be opened from this build environment. Nothing from these pages is used as a question.">Web archive — inaccessible / unverified sources</SectionTitle>
        <ul className="space-y-3">
          {webSources.map((w) => (
            <li key={w.url} className="rounded-lg bg-ink-900/60 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2"><span className="font-medium text-slate-100">{w.title}</span><Badge tone={w.status.startsWith('Excluded') ? 'red' : 'amber'}>{w.status.startsWith('Excluded') ? 'Excluded' : 'Unverified'}</Badge><Badge>{w.regulation}</Badge></div>
              <a href={w.url} target="_blank" rel="noreferrer noopener" className="mt-1 block break-all text-xs text-accent-300 hover:underline focus-ring">{w.url}</a>
              <p className="mt-1 text-slate-300">{w.claim}</p>
              <p className="text-xs text-slate-400">{w.status}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-400">Links are recorded exactly as returned by search; they may be broken or changed. If you can open them, download the PDFs and add the questions via “Add a question”.</p>
      </Card>

      <Card>
        <SectionTitle>Uploaded file inventory</SectionTitle>
        <ul className="space-y-3 text-sm">
          {inventory.map((f) => (
            <li key={f.file} className="rounded-lg bg-ink-900/60 p-3">
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-slate-100">{f.file}</span><Badge tone={f.kind === 'notes' ? 'violet' : 'blue'}>{f.kind === 'notes' ? 'Notes' : 'Past paper'}</Badge><Badge>{f.unit}</Badge><Badge>{f.pages} pages</Badge></div>
              <p className="mt-1 text-slate-300">{f.subject}</p>
              <p className="text-xs text-slate-400">Readability: {f.readability}</p>
              <p className="text-xs text-slate-400">Inspected: {f.inspected}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Missing material</SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">{missingMaterials.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </Card>
        <Card>
          <SectionTitle>Source coverage matrix</SectionTitle>
          <ul className="space-y-2 text-sm">
            {coverageMatrix.map((c) => (
              <li key={c.unit}><div className="font-medium text-slate-100">{c.unit}</div><div className="text-xs text-slate-400">Notes: {c.notes} · Papers: {c.paperParts}</div><div className="text-xs text-slate-400">Not verifiable: {c.notVerifiable}</div></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="Where the source looks wrong or unclear, we show it as printed and explain how it was handled.">Source issues and suspected misprints</SectionTitle>
        <ul className="space-y-2 text-sm">{sourceIssues.map((s, i) => <li key={i}><span className="font-medium text-amber-300">{s.where}:</span> <span className="text-slate-200">{s.issue}</span> <span className="text-slate-400">— {s.handling}</span></li>)}</ul>
      </Card>
    </div>
  );
}

export function FrequencyTab() {
  const { state } = useProgress();
  const studentPapers = new Set(state.customQuestions.map((q) => `${q.exam?.date ?? '?'}|${q.exam?.set ?? '?'}`));
  const groups = new Map<string, string[]>();
  for (const q of paperQuestions) if (q.groupKey) groups.set(q.groupKey, [...(groups.get(q.groupKey) ?? []), q.id]);
  const repeated = [...groups.entries()].filter(([, ids]) => ids.length > 1);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle sub="A revision aid, not a prediction. Small sample.">Historical topic frequency</SectionTitle>
        <p className="mb-3 text-sm text-slate-300">
          Sample: <strong className="text-white">{examinedPapers.length} verified paper sets</strong> ({paperQuestions.length} question parts) — January 2023 Sets 1–4 and July 2023 Set 1. Years covered: 2023 only.
          Because the January sets were sat in the same session, topics repeat across them; treat the counts as "how often a pattern has been seen", not as odds.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2">Topic</th>
                {examinedPapers.map((p) => <th key={p.id} className="py-2 pr-2 text-center">{p.exam.slice(0, 3)} {p.set.replace('Set ', 'S')}</th>)}
                <th className="py-2 pr-2 text-center">Sets with it</th>
                <th className="py-2 text-center">Parts</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <FrequencyRows key={u.id} unitId={u.id} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Same or nearly the same question in more than one set (differences kept in the bank).">Repeated questions</SectionTitle>
          {repeated.length === 0 ? <EmptyState title="No repeats found." /> : (
            <ul className="space-y-2 text-sm">
              {repeated.map(([k, ids]) => (
                <li key={k} className="rounded-lg bg-ink-900/60 p-2">
                  <div className="text-slate-200">{paperQuestions.find((q) => q.id === ids[0])?.title}</div>
                  <div className="text-xs text-slate-400">{ids.map((id) => { const q = paperQuestions.find((x) => x.id === id)!; return `${q.exam?.date.slice(0, 3)} ${q.exam?.set} Q${q.exam?.questionNumber}`; }).join(' · ')}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionTitle>Observations from the 5 sets</SectionTitle>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">
            <li>Every set follows the same structure: 3 hours, 70 marks, one question per unit with internal choice.</li>
            <li>Unit II: initial-value problems by Laplace transform appear in 4 of 5 sets.</li>
            <li>Unit IV: Lagrange's linear equation appears in every set; formation by eliminating functions in 4 of 5.</li>
            <li>Unit V: separation of variables appears in 3 of 5 sets; wave/heat/Laplace boundary-value problems in 4 of 5 — yet these are absent from the uploaded Unit 5 notes.</li>
            <li>Unit I: Stokes' theorem appears in 3 sets; Gauss in 2; Green in 2.</li>
            <li>Gaps: no 2021, 2022, 2024 or 2025 papers could be examined, so trends over time cannot be assessed.</li>
            {studentPapers.size > 0 && <li>You have entered questions from {studentPapers.size} additional paper(s); they are listed in the bank but not counted above (not verified).</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function FrequencyRows({ unitId }: { unitId: 1 | 2 | 3 | 4 | 5 }) {
  const u = unitById.get(unitId)!;
  const topics = allTopics.filter((t) => t.unit === unitId);
  return (
    <>
      <tr className="bg-ink-900/70"><td colSpan={examinedPapers.length + 3} className="py-1.5 pl-1 text-xs font-semibold uppercase tracking-wide text-accent-300">{u.title}</td></tr>
      {topics.map((t) => {
        const per = examinedPapers.map((p) => paperQuestions.filter((q) => q.topic === t.id && paperIdOf(q) === p.id).length);
        const total = per.reduce((a, b) => a + b, 0);
        return (
          <tr key={t.id} className="border-b border-ink-700/40">
            <td className="py-1 pr-2"><Link to={`${u.path}?topic=${t.id}`} className="text-slate-200 hover:text-accent-300 focus-ring">{t.short}</Link></td>
            {per.map((n, i) => <td key={i} className={`py-1 pr-2 text-center tabular-nums ${n ? 'text-white' : 'text-slate-600'}`}>{n || '·'}</td>)}
            <td className="py-1 pr-2 text-center tabular-nums text-slate-300">{per.filter((n) => n > 0).length}/{examinedPapers.length}</td>
            <td className="py-1 text-center tabular-nums text-slate-300">{total}</td>
          </tr>
        );
      })}
    </>
  );
}
