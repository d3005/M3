import type { Topic, TopicStatus } from '../types';
import { allTopics, priorityOf } from '../data';
import type { ProgressState } from './progress';
import { daysUntil, statusOf, topicPerformance } from './analytics';

const remainingFactor: Record<TopicStatus, number> = { not_started: 1, learning: 0.7, practising: 0.4, mastered: 0 };
const priorityRank = { core: 0, important: 1, supporting: 2 } as const;

export interface PlanItem { topic: Topic; hours: number; kind: 'learn' | 'practise' | 'revise' }
export interface PlanDay { index: number; date: Date; items: PlanItem[]; extra: string[]; hours: number }
export interface StudyPlan {
  ok: boolean;
  reason?: string;
  daysLeft: number;
  hoursPerDay: number;
  hoursNeeded: number;
  capacity: number;
  shortMode: boolean;
  skipped: Topic[];
  days: PlanDay[];
}

/** Order: weak topics first, then priority (paper evidence), then unit/syllabus order (prerequisites come first within a unit). */
export function orderedTopics(state: ProgressState): Topic[] {
  const idx = new Map(allTopics.map((t, i) => [t.id, i]));
  return allTopics
    .filter((t) => statusOf(state, t.id) !== 'mastered')
    .sort((a, b) => {
      const wa = isWeak(state, a.id) ? 0 : 1;
      const wb = isWeak(state, b.id) ? 0 : 1;
      if (wa !== wb) return wa - wb;
      const pa = priorityRank[priorityOf(a.id)];
      const pb = priorityRank[priorityOf(b.id)];
      if (pa !== pb) return pa - pb;
      return (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0);
    });
}

function isWeak(state: ProgressState, id: string) {
  const c = topicPerformance(state, id).combined;
  return c !== null && c < 0.6;
}

/**
 * Builds a realistic day-by-day plan from the exam date and daily hours.
 * It never promises a result; when time is short it drops lower-priority topics and says so.
 */
export function buildPlan(state: ProgressState, now = new Date()): StudyPlan {
  const daysLeft = daysUntil(state.examDate, now);
  const hoursPerDay = state.hoursPerDay ?? 0;
  const empty = { daysLeft: daysLeft ?? 0, hoursPerDay, hoursNeeded: 0, capacity: 0, shortMode: false, skipped: [], days: [] };
  if (daysLeft === null) return { ok: false, reason: 'Enter your exam date to generate a plan.', ...empty };
  if (daysLeft <= 0) return { ok: false, reason: daysLeft === 0 ? 'Your exam is today — use the formula review and mistake review instead of new topics.' : 'The exam date is in the past. Update it to plan again.', ...empty };
  if (!hoursPerDay || hoursPerDay <= 0) return { ok: false, reason: 'Enter how many hours per day you can study.', ...empty };

  const topics = orderedTopics(state);
  const need = (t: Topic) => Math.max(0.5, Math.round(t.estHours * remainingFactor[statusOf(state, t.id)] * 2) / 2);
  // Reserve the final day for a timed mock + mistakes when there are at least 3 days.
  const studyDays = daysLeft >= 3 ? daysLeft - 1 : daysLeft;
  const capacity = studyDays * hoursPerDay;
  const hoursNeeded = topics.reduce((s, t) => s + need(t), 0);

  let chosen = topics;
  let shortMode = false;
  const skipped: Topic[] = [];
  // Short-time mode: compress every topic to ~60 % of its estimate and drop what still does not fit
  // (lowest priority last in the order, so it is dropped first).
  const compressed = (t: Topic) => Math.max(0.5, Math.round(need(t) * 0.6 * 2) / 2);
  if (hoursNeeded > capacity) {
    shortMode = true;
    chosen = [];
    let used = 0;
    for (const t of topics) {
      const h = compressed(t);
      if (used + h <= capacity) {
        chosen.push(t);
        used += h;
      } else skipped.push(t);
    }
  }
  const alloc = (t: Topic) => (shortMode ? compressed(t) : need(t));

  const days: PlanDay[] = [];
  let day = 0;
  let left = hoursPerDay;
  const mk = (i: number): PlanDay => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { index: i, date: d, items: [], extra: [], hours: 0 };
  };
  days.push(mk(0));
  for (const t of chosen) {
    let h = alloc(t);
    const kind: PlanItem['kind'] = statusOf(state, t.id) === 'not_started' ? 'learn' : statusOf(state, t.id) === 'learning' ? 'practise' : 'revise';
    while (h > 0 && day < studyDays) {
      const slot = Math.min(h, left);
      days[day].items.push({ topic: t, hours: slot, kind });
      days[day].hours += slot;
      h -= slot;
      left -= slot;
      if (left <= 0.01) {
        day++;
        left = hoursPerDay;
        if (day < studyDays) days.push(mk(day));
      }
    }
    if (day >= studyDays) break;
  }
  if (daysLeft >= 3) {
    const last = mk(daysLeft - 1);
    last.extra.push('Timed mock exam (Page 7) — 3 hours if you can.', 'Mistake review and formula sheet.');
    last.hours = hoursPerDay;
    // fill gap days (if topics ran out early) with mixed revision
    while (days.length < daysLeft - 1) {
      const d = mk(days.length);
      d.extra.push('Mixed revision set (Page 7) and re-attempt open mistakes.');
      d.hours = hoursPerDay;
      days.push(d);
    }
    days.push(last);
  }
  for (const d of days) if (!d.items.length && !d.extra.length) d.extra.push('Mixed revision set (Page 7).');
  return { ok: true, daysLeft, hoursPerDay, hoursNeeded, capacity, shortMode, skipped, days };
}
