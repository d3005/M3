import type { Question, UnitId } from '../types';
import { examinedPapers, mainNumber, paperIdOf, type PaperId } from '../data/papers';
import { paperQuestions } from '../data';

export interface MockOption { label: string; source: string; parts: Question[] }
export interface MockSection { unit: UnitId; options: MockOption[] }
export interface MockPaper { id: string; kind: 'paper' | 'mixed' | 'weak'; title: string; durationMin: number; sections: MockSection[]; note: string }

/** Deterministic PRNG so a mock can be rebuilt from its seed. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function partsOf(paper: PaperId, qn: number): Question[] {
  return paperQuestions.filter((q) => paperIdOf(q) === paper && mainNumber(q) === qn);
}

function label(paper: PaperId) {
  const p = examinedPapers.find((x) => x.id === paper)!;
  return `${p.exam} ${p.set}`;
}

/** A real paper exactly as set: unit k gets Q(2k−1) OR Q(2k). */
export function paperMock(paper: PaperId, durationMin = 180): MockPaper {
  const sections: MockSection[] = ([1, 2, 3, 4, 5] as UnitId[]).map((u) => ({
    unit: u,
    options: [2 * u - 1, 2 * u].map((qn) => ({ label: `Q${qn}`, source: label(paper), parts: partsOf(paper, qn) })),
  }));
  return { id: `paper-${paper}`, kind: 'paper', title: `${label(paper)} (as set)`, durationMin, sections, note: 'All questions are real questions from the uploaded paper.' };
}

/** Mixed mock: each unit's two options are drawn from two different real papers. Optional topic weighting for weak areas. */
export function mixedMock(seed: number, weakTopicIds: string[] = [], durationMin = 180): MockPaper {
  const rand = rng(seed);
  const ids = examinedPapers.map((p) => p.id) as PaperId[];
  const sections: MockSection[] = ([1, 2, 3, 4, 5] as UnitId[]).map((u) => {
    const candidates: MockOption[] = [];
    for (const pid of ids) {
      for (const qn of [2 * u - 1, 2 * u]) {
        const parts = partsOf(pid, qn);
        if (parts.length) candidates.push({ label: '', source: `${label(pid)} Q${qn}`, parts });
      }
    }
    const score = (o: MockOption) => (o.parts.some((p) => weakTopicIds.includes(p.topic)) ? 1 : 0) + rand() * 0.9;
    const ranked = candidates.map((o) => ({ o, s: weakTopicIds.length ? score(o) : rand() })).sort((a, b) => b.s - a.s);
    const first = ranked[0].o;
    const second = ranked.find((x) => x.o.source.split(' Q')[0] !== first.source.split(' Q')[0])?.o ?? ranked[1].o;
    return { unit: u, options: [{ ...first, label: `Q${2 * u - 1}` }, { ...second, label: `Q${2 * u}` }] };
  });
  return {
    id: `${weakTopicIds.length ? 'weak' : 'mixed'}-${seed}`,
    kind: weakTopicIds.length ? 'weak' : 'mixed',
    title: weakTopicIds.length ? 'Targeted mock (weak areas first)' : 'Mixed mock from real 2023 questions',
    durationMin,
    sections,
    note: 'Every question is a real question from an uploaded 2023 paper (source shown on each). No generated questions were needed.',
  };
}

/**
 * Indicative (ESTIMATED) split of a question's marks over its solution steps.
 * Not an official scheme: marks are spread evenly with the remainder on the last step, in 0.5 steps.
 */
export function estimatedStepMarks(q: Question): number[] {
  const marks = q.marks ?? 0;
  const n = q.solutionSteps.length;
  if (!n || !marks) return [];
  const each = Math.floor((marks / n) * 2) / 2;
  const arr = Array(n).fill(each);
  arr[n - 1] = Math.round((marks - each * (n - 1)) * 2) / 2;
  return arr;
}

export function canBeMarked(q: Question): boolean {
  return q.verificationStatus !== 'not_verified' && q.solutionSteps.length > 0;
}
