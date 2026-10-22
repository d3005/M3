import type { TopicStatus, UnitId } from '../types';
import { allTopics, allQuestions, questionById, units } from '../data';
import type { ProgressState } from './progress';

export const statusWeight: Record<TopicStatus, number> = { not_started: 0, learning: 0.25, practising: 0.6, mastered: 1 };
export const statusLabel: Record<TopicStatus, string> = { not_started: 'Not started', learning: 'Learning', practising: 'Practising', mastered: 'Mastered' };
const markValue = { correct: 1, partial: 0.5, incorrect: 0 } as const;

export function statusOf(state: ProgressState, topicId: string): TopicStatus {
  return state.topicStatus[topicId] ?? 'not_started';
}

export function topicQuestionIds(state: ProgressState, topicId: string): string[] {
  return [...allQuestions, ...state.customQuestions].filter((q) => q.topic === topicId).map((q) => q.id);
}

export interface TopicPerformance {
  quizPct: number | null;
  practicePct: number | null;
  mockPct: number | null;
  combined: number | null;
  evidence: number; // number of graded events behind the score
}

export function topicPerformance(state: ProgressState, topicId: string): TopicPerformance {
  const quiz = state.quiz[topicId];
  const quizPct = quiz && quiz.total > 0 ? quiz.last / quiz.total : null;

  const ids = new Set(topicQuestionIds(state, topicId));
  const practice = Object.entries(state.attempts).filter(([id, a]) => ids.has(id) && a.origin === 'practice');
  const practicePct = practice.length ? practice.reduce((s, [, a]) => s + markValue[a.result], 0) / practice.length : null;

  let got = 0;
  let max = 0;
  let mockEvents = 0;
  for (const m of state.mocks) {
    for (const [qid, mark] of Object.entries(m.marks)) {
      if (mark === null || !ids.has(qid)) continue;
      got += mark;
      max += m.maxByQuestion[qid] ?? 0;
      mockEvents++;
    }
  }
  const mockPct = max > 0 ? got / max : null;

  const parts = [quizPct, practicePct, mockPct].filter((v): v is number => v !== null);
  const combined = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
  return { quizPct, practicePct, mockPct, combined, evidence: (quiz ? 1 : 0) + practice.length + mockEvents };
}

export function weakTopics(state: ProgressState, threshold = 0.6) {
  return allTopics
    .map((t) => ({ topic: t, perf: topicPerformance(state, t.id) }))
    .filter((x) => x.perf.combined !== null && x.perf.combined < threshold)
    .sort((a, b) => (a.perf.combined ?? 0) - (b.perf.combined ?? 0));
}

export function unitProgress(state: ProgressState, unitId: UnitId): number {
  const topics = units.find((u) => u.id === unitId)?.topics ?? [];
  if (!topics.length) return 0;
  return topics.reduce((s, t) => s + statusWeight[statusOf(state, t.id)], 0) / topics.length;
}

export function overallProgress(state: ProgressState): number {
  return allTopics.reduce((s, t) => s + statusWeight[statusOf(state, t.id)], 0) / allTopics.length;
}

export function statusCounts(state: ProgressState): Record<TopicStatus, number> {
  const c: Record<TopicStatus, number> = { not_started: 0, learning: 0, practising: 0, mastered: 0 };
  for (const t of allTopics) c[statusOf(state, t.id)]++;
  return c;
}

export function openMistakes(state: ProgressState) {
  return Object.entries(state.mistakes)
    .filter(([, m]) => !m.resolved)
    .map(([id, m]) => ({ id, m, q: questionById.get(id) ?? state.customQuestions.find((c) => c.id === id) }))
    .filter((x) => x.q);
}

export function daysUntil(examDate: string | null, now = new Date()): number | null {
  if (!examDate) return null;
  const [y, m, d] = examDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const exam = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam.getTime() - today.getTime()) / 86400000);
}
