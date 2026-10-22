import { emptyState, meetsMastery, parseState, reducer, type ProgressState } from '../lib/progress';
import { buildPlan } from '../lib/plan';
import { estimatedStepMarks, mixedMock, paperMock } from '../lib/mock';
import { search } from '../lib/search';
import { daysUntil, overallProgress, topicPerformance, unitProgress, weakTopics } from '../lib/analytics';
import { allQuestions, allTopics } from '../data';
import { examinedPapers } from '../data/papers';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

describe('progress reducer', () => {
  it('starts honest and empty', () => {
    const s = emptyState();
    expect(overallProgress(s)).toBe(0);
    expect(unitProgress(s, 1)).toBe(0);
    expect(weakTopics(s)).toEqual([]);
  });

  it('moves a topic to Learning when opened and records last visited', () => {
    const s = reducer(emptyState(), { type: 'openTopic', topicId: 'u4-lagrange' });
    expect(s.topicStatus['u4-lagrange']).toBe('learning');
    expect(s.lastVisited?.topicId).toBe('u4-lagrange');
  });

  it('never downgrades automatically and allows manual override', () => {
    let s = reducer(emptyState(), { type: 'setStatus', topicId: 'u1-grad', status: 'mastered' });
    s = reducer(s, { type: 'openTopic', topicId: 'u1-grad' });
    expect(s.topicStatus['u1-grad']).toBe('mastered');
    s = reducer(s, { type: 'setStatus', topicId: 'u1-grad', status: 'learning' });
    expect(s.topicStatus['u1-grad']).toBe('learning');
  });

  it('logs mistakes for partial/incorrect answers and resolves them on a correct retry', () => {
    let s = reducer(emptyState(), { type: 'attempt', questionId: 'J23-S1-Q1a', topicId: 'u1-stokes', result: 'incorrect', origin: 'practice', masteryCheck: false });
    expect(s.mistakes['J23-S1-Q1a'].resolved).toBe(false);
    expect(s.topicStatus['u1-stokes']).toBe('practising');
    s = reducer(s, { type: 'attempt', questionId: 'J23-S1-Q1a', topicId: 'u1-stokes', result: 'correct', origin: 'practice', masteryCheck: false });
    expect(s.mistakes['J23-S1-Q1a'].resolved).toBe(true);
    expect(s.attempts['J23-S1-Q1a'].count).toBe(2);
  });

  it('applies the mastery rule only when both criteria hold', () => {
    const ids = allQuestions.filter((q) => q.topic === 'u4-form1').map((q) => q.id);
    let s: ProgressState = reducer(emptyState(), { type: 'quiz', topicId: 'u4-form1', score: 2, total: 2, masteryCheck: false });
    expect(meetsMastery(s, 'u4-form1', ids)).toBe(false);
    s = reducer(s, { type: 'attempt', questionId: ids[0], topicId: 'u4-form1', result: 'correct', origin: 'practice', masteryCheck: false });
    expect(meetsMastery(s, 'u4-form1', ids)).toBe(true);
  });

  it('computes weak topics from real results only', () => {
    let s = reducer(emptyState(), { type: 'quiz', topicId: 'u2-conv', score: 0, total: 1, masteryCheck: false });
    expect(topicPerformance(s, 'u2-conv').combined).toBe(0);
    expect(weakTopics(s).map((w) => w.topic.id)).toEqual(['u2-conv']);
    s = reducer(s, { type: 'quiz', topicId: 'u2-conv', score: 1, total: 1, masteryCheck: false });
    expect(weakTopics(s)).toEqual([]);
  });

  it('rejects malformed imports', () => {
    expect(parseState({ foo: 1 })).toBeNull();
    expect(parseState(null)).toBeNull();
    expect(parseState({ ...emptyState(), quiz: undefined })?.quiz).toEqual({});
  });
});

describe('study plan', () => {
  it('needs an exam date and hours, and never assumes them', () => {
    expect(buildPlan(emptyState()).ok).toBe(false);
    const s = { ...emptyState(), examDate: inDays(10) };
    expect(buildPlan(s).ok).toBe(false);
  });

  it('builds a day-by-day plan ending with a mock day', () => {
    const s = { ...emptyState(), examDate: inDays(40), hoursPerDay: 4 };
    const p = buildPlan(s);
    expect(p.ok).toBe(true);
    expect(p.shortMode).toBe(false);
    expect(p.days.length).toBe(40);
    expect(p.days[p.days.length - 1].extra.join(' ')).toMatch(/mock/i);
    const scheduled = new Set(p.days.flatMap((d) => d.items.map((i) => i.topic.id)));
    expect(scheduled.size).toBe(allTopics.length);
    for (const d of p.days) expect(d.items.reduce((a, i) => a + i.hours, 0)).toBeLessThanOrEqual(4 + 1e-9);
  });

  it('switches to short-time mode and reports skipped topics when time is short', () => {
    const p = buildPlan({ ...emptyState(), examDate: inDays(4), hoursPerDay: 2 });
    expect(p.ok).toBe(true);
    expect(p.shortMode).toBe(true);
    expect(p.skipped.length).toBeGreaterThan(0);
  });

  it('handles past and same-day dates', () => {
    expect(buildPlan({ ...emptyState(), examDate: inDays(-1), hoursPerDay: 3 }).ok).toBe(false);
    expect(buildPlan({ ...emptyState(), examDate: inDays(0), hoursPerDay: 3 }).reason).toMatch(/today/);
    expect(daysUntil(inDays(5))).toBe(5);
  });
});

describe('mock exams', () => {
  it('replays a real paper with 5 units × 2 options of 14 marks', () => {
    for (const p of examinedPapers) {
      const m = paperMock(p.id);
      expect(m.sections).toHaveLength(5);
      for (const s of m.sections) {
        expect(s.options).toHaveLength(2);
        for (const o of s.options) expect(o.parts.reduce((a, q) => a + (q.marks ?? 0), 0)).toBe(14);
      }
    }
  });

  it('builds mixed mocks only from real questions, deterministically', () => {
    const a = mixedMock(42);
    const b = mixedMock(42);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    for (const s of a.sections) {
      for (const o of s.options) {
        expect(o.parts.every((q) => q.sourceType === 'uploaded_past_paper')).toBe(true);
        expect(o.parts.every((q) => q.unit === s.unit)).toBe(true);
      }
      expect(s.options[0].source.split(' Q')[0]).not.toBe(s.options[1].source.split(' Q')[0]);
    }
  });

  it('splits marks over steps (estimate) without losing marks', () => {
    for (const q of allQuestions.filter((x) => x.marks)) {
      const m = estimatedStepMarks(q);
      expect(m.reduce((a, b) => a + b, 0)).toBeCloseTo(q.marks!, 6);
      expect(m.every((x) => x >= 0)).toBe(true);
    }
  });
});

describe('search', () => {
  it('finds topics, formulas and questions', () => {
    const hits = search('stokes');
    expect(hits.some((h) => h.kind === 'topic' && h.id === 'u1-stokes')).toBe(true);
    expect(hits.some((h) => h.kind === 'question')).toBe(true);
    expect(search('clairaut')[0].id).toBe('u4-clairaut');
    expect(search('')).toEqual([]);
    expect(search('zzzz-nothing')).toEqual([]);
  });
});
