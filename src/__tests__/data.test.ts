import katex from 'katex';
import { allFormulas, allQuestions, allTopics, paperQuestions, practiceQuestions, topicById, units } from '../data';
import { examinedPapers, mainNumber, paperIdOf, JAN_FILE, JUL_FILE } from '../data/papers';
import { coverageMatrix, inventory } from '../data/sources';
import { splitMath } from '../components/MathText';
import { NAV } from '../components/Layout';

function texSegments(s: string) {
  return splitMath(s).filter((x) => x.kind !== 'text');
}

function allStrings(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const t of allTopics) {
    const push = (w: string, s: string) => out.push({ where: `${t.id}:${w}`, text: s });
    t.concept.forEach((c, i) => push(`concept${i}`, c));
    t.notation.forEach((c, i) => push(`notation${i}`, c));
    t.method.forEach((c, i) => push(`method${i}`, c));
    t.mistakes.forEach((c, i) => push(`mistake${i}`, c));
    for (const ex of [t.worked, t.guided]) {
      push('ex.problem', ex.problem);
      push('ex.why', ex.why);
      push('ex.answer', ex.answer);
      ex.steps.forEach((s, i) => push(`ex.step${i}`, s));
      (ex.hints ?? []).forEach((s, i) => push(`ex.hint${i}`, s));
      if (ex.check) push('ex.check', ex.check);
    }
    for (const q of t.quiz) {
      push(`${q.id}.prompt`, q.prompt);
      push(`${q.id}.expl`, q.explanation);
      q.options.forEach((o, i) => push(`${q.id}.opt${i}`, o));
    }
  }
  for (const q of allQuestions) {
    out.push({ where: `${q.id}.question`, text: q.question });
    out.push({ where: `${q.id}.answer`, text: q.finalAnswer });
    q.solutionSteps.forEach((s, i) => out.push({ where: `${q.id}.step${i}`, text: s }));
    q.commonMistakes.forEach((s, i) => out.push({ where: `${q.id}.mistake${i}`, text: s }));
    if (q.transcriptionNote) out.push({ where: `${q.id}.tnote`, text: q.transcriptionNote });
  }
  return out;
}

describe('content integrity', () => {
  it('has exactly seven navigation destinations', () => {
    expect(NAV).toHaveLength(7);
    expect(NAV.map((n) => n.to)).toEqual(['/', '/vector-calculus', '/laplace-transforms', '/fourier-methods', '/first-order-pdes', '/higher-order-pdes', '/papers']);
  });

  it('uses unique ids', () => {
    const tIds = allTopics.map((t) => t.id);
    expect(new Set(tIds).size).toBe(tIds.length);
    const qIds = allQuestions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
    const fIds = allFormulas.map((f) => f.id);
    expect(new Set(fIds).size).toBe(fIds.length);
    const quizIds = allTopics.flatMap((t) => t.quiz.map((q) => q.id));
    expect(new Set(quizIds).size).toBe(quizIds.length);
  });

  it('gives every topic all required teaching parts', () => {
    for (const t of allTopics) {
      expect(t.concept.length, t.id).toBeGreaterThan(0);
      expect(t.formulas.length, t.id).toBeGreaterThan(0);
      expect(t.method.length, t.id).toBeGreaterThan(0);
      expect(t.worked.steps.length, t.id).toBeGreaterThan(0);
      expect(t.guided.steps.length, t.id).toBeGreaterThan(0);
      expect(t.practice.length, t.id).toBeGreaterThan(0);
      expect(t.mistakes.length, t.id).toBeGreaterThan(0);
      expect(t.quiz.length, t.id).toBeGreaterThan(0);
      for (const q of t.quiz) {
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThan(q.options.length);
      }
      for (const p of t.prerequisites) expect(topicById.has(p), `${t.id} prereq ${p}`).toBe(true);
    }
  });

  it('points every method-guide row at a topic of the same unit', () => {
    for (const u of units) {
      expect(u.guide.length, u.title).toBeGreaterThan(0);
      for (const g of u.guide) expect(topicById.get(g.topicId)?.unit, g.topicId).toBe(u.id);
    }
  });

  it('links every question to an existing topic of the same unit', () => {
    for (const q of allQuestions) {
      const t = topicById.get(q.topic);
      expect(t, q.id).toBeDefined();
      expect(t!.unit, q.id).toBe(q.unit);
    }
  });

  it('never attributes a generated question to a source', () => {
    for (const q of practiceQuestions.filter((x) => x.sourceType === 'generated_practice')) {
      expect(q.sourceFilename, q.id).toBeNull();
      expect(q.sourcePage, q.id).toBeNull();
      expect(q.exam, q.id).toBeNull();
    }
    for (const t of allTopics) for (const ex of [t.worked, t.guided]) {
      if (ex.sourceType === 'generated_practice') expect(ex.sourceFilename, t.id).toBeNull();
    }
  });

  it('cites only uploaded files, with page numbers inside each file', () => {
    const pages = new Map(inventory.map((f) => [f.file, f.pages]));
    const cited = [
      ...allQuestions.filter((q) => q.sourceFilename).map((q) => ({ id: q.id, file: q.sourceFilename!, page: q.sourcePage })),
      ...allTopics.flatMap((t) => [t.worked, t.guided].filter((e) => e.sourceFilename).map((e) => ({ id: t.id, file: e.sourceFilename!, page: e.sourcePage }))),
    ];
    for (const c of cited) {
      expect(pages.has(c.file), `${c.id} cites ${c.file}`).toBe(true);
      expect(c.page, c.id).not.toBeNull();
      expect(c.page!, c.id).toBeGreaterThanOrEqual(1);
      expect(c.page!, c.id).toBeLessThanOrEqual(pages.get(c.file)!);
    }
  });

  it('records every past-paper question with its exam metadata', () => {
    expect(paperQuestions.length).toBe(97);
    for (const q of paperQuestions) {
      expect([JAN_FILE, JUL_FILE]).toContain(q.sourceFilename);
      expect(q.exam?.code).toBe('R2021011');
      expect(q.marks).not.toBeNull();
      expect(paperIdOf(q)).not.toBeNull();
      expect(q.solutionSteps.length, q.id).toBeGreaterThan(0);
    }
  });

  it('matches the printed structure: each main question totals 14 marks and covers its unit', () => {
    for (const p of examinedPapers) {
      for (let qn = 1; qn <= 10; qn++) {
        const parts = paperQuestions.filter((q) => paperIdOf(q) === p.id && mainNumber(q) === qn);
        expect(parts.length, `${p.id} Q${qn}`).toBeGreaterThan(0);
        expect(parts.reduce((s, q) => s + (q.marks ?? 0), 0), `${p.id} Q${qn}`).toBe(14);
        for (const q of parts) expect(q.unit, q.id).toBe(Math.ceil(qn / 2));
      }
    }
  });

  it('keeps the coverage matrix counts in sync with the bank', () => {
    units.forEach((u, i) => {
      const n = paperQuestions.filter((q) => q.unit === u.id).length;
      expect(coverageMatrix[i].paperParts.startsWith(`${n} parts`), u.title).toBe(true);
    });
  });

  it('backs the frequency observations shown on Page 7', () => {
    const setsWith = (topics: string[]) => examinedPapers.filter((p) => paperQuestions.some((q) => paperIdOf(q) === p.id && topics.includes(q.topic))).length;
    expect(setsWith(['u2-ode'])).toBe(4);
    expect(setsWith(['u4-lagrange'])).toBe(5);
    expect(setsWith(['u4-func'])).toBe(4);
    expect(setsWith(['u5-separation'])).toBe(3);
    expect(setsWith(['u5-wave', 'u5-heat', 'u5-laplace'])).toBe(4);
    expect(setsWith(['u1-stokes'])).toBe(3);
    expect(setsWith(['u1-gauss'])).toBe(2);
    expect(setsWith(['u1-green'])).toBe(2);
  });

  it('renders every formula and maths fragment with KaTeX in strict mode', () => {
    const bad: string[] = [];
    for (const f of allFormulas) {
      try { katex.renderToString(f.tex, { throwOnError: true, displayMode: true }); } catch (e) { bad.push(`${f.id}: ${(e as Error).message}`); }
    }
    for (const { where, text } of allStrings()) {
      for (const seg of texSegments(text)) {
        try { katex.renderToString(seg.value, { throwOnError: true, displayMode: seg.kind === 'display' }); } catch (e) { bad.push(`${where}: ${(e as Error).message}`); }
      }
      // An odd number of unescaped $ means a broken delimiter.
      const dollars = (text.replace(/\\\$/g, '').match(/\$/g) ?? []).length;
      if (dollars % 2 !== 0) bad.push(`${where}: unbalanced $ delimiters`);
    }
    expect(bad).toEqual([]);
  });
});
