import type { UnitId } from '../types';
import { allFormulas, allQuestions, allTopics, unitById } from '../data';

export interface SearchHit {
  kind: 'topic' | 'formula' | 'question';
  id: string;
  unit: UnitId;
  title: string;
  context: string;
  to: string;
}

/** Strip LaTeX markup so "\frac{dx}{P}" can be found by typing "dx". */
export function plain(s: string): string {
  return s
    .replace(/\\(mathrm|text|operatorname|bar|overline|hat|vec|mathbf)\{([^}]*)\}/g, ' $2 ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$^_\\&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

interface Entry extends SearchHit { haystack: string }

let index: Entry[] | null = null;

function build(): Entry[] {
  const out: Entry[] = [];
  for (const t of allTopics) {
    const path = unitById.get(t.unit)!.path;
    out.push({ kind: 'topic', id: t.id, unit: t.unit, title: t.title, context: t.short, to: `${path}?topic=${t.id}`, haystack: plain([t.title, t.short, ...t.concept, ...t.method].join(' ')) });
  }
  for (const f of allFormulas) {
    const path = unitById.get(f.unit)!.path;
    out.push({ kind: 'formula', id: f.id, unit: f.unit, title: f.label, context: f.topicTitle, to: `${path}?topic=${f.topicId}#formulas`, haystack: plain([f.label, f.tex, f.topicTitle, f.conditions ?? ''].join(' ')) });
  }
  for (const q of allQuestions) {
    const isPaper = q.sourceType === 'uploaded_past_paper';
    const to = isPaper ? `/papers?tab=bank&q=${encodeURIComponent(q.id)}` : `${unitById.get(q.unit)!.path}?topic=${q.topic}#practice`;
    const ctx = isPaper ? `${q.exam?.date} ${q.exam?.set} Q${q.exam?.questionNumber}` : 'Practice question';
    out.push({ kind: 'question', id: q.id, unit: q.unit, title: q.title, context: ctx, to, haystack: plain([q.title, q.question, q.exam?.date ?? ''].join(' ')) });
  }
  return out;
}

export function search(query: string, limit = 30): SearchHit[] {
  const terms = plain(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  index ??= build();
  const scored: { e: Entry; s: number }[] = [];
  for (const e of index) {
    if (!terms.every((t) => e.haystack.includes(t))) continue;
    const titleHit = terms.every((t) => e.title.toLowerCase().includes(t)) ? 2 : 0;
    const kindBoost = e.kind === 'topic' ? 1 : e.kind === 'formula' ? 0.5 : 0;
    scored.push({ e, s: titleHit + kindBoost });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map(({ e }) => ({ kind: e.kind, id: e.id, unit: e.unit, title: e.title, context: e.context, to: e.to }));
}
