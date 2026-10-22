import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { Question, SelfMark, TopicStatus } from '../types';

export const STORAGE_KEY = 'm3-r20-prep:v1';

export interface QuizRecord { last: number; best: number; total: number; attempts: number; at: string }
export interface AttemptRecord { result: SelfMark; at: string; count: number; origin: 'practice' | 'mock' }
export interface MistakeRecord { at: string; note: string; resolved: boolean; origin: 'practice' | 'mock' | 'quiz' }
export interface ChecklistItem { id: string; text: string; done: boolean; link?: string }
export interface MockAttempt {
  id: string;
  at: string;
  kind: string;
  title: string;
  durationMin: number;
  elapsedSec: number;
  questionIds: string[];
  marks: Record<string, number | null>; // null = could not be marked (no reliable solution)
  maxByQuestion: Record<string, number>;
  score: number;
  max: number;
}

export interface ProgressState {
  version: 1;
  examDate: string | null;
  hoursPerDay: number | null;
  topicStatus: Record<string, TopicStatus>;
  quiz: Record<string, QuizRecord>;
  attempts: Record<string, AttemptRecord>;
  mistakes: Record<string, MistakeRecord>;
  checklist: { date: string; items: ChecklistItem[] } | null;
  lastVisited: { topicId: string; at: string } | null;
  mocks: MockAttempt[];
  customQuestions: Question[];
  activity: Record<string, number>; // YYYY-MM-DD -> actions logged
}

export const emptyState = (): ProgressState => ({
  version: 1,
  examDate: null,
  hoursPerDay: null,
  topicStatus: {},
  quiz: {},
  attempts: {},
  mistakes: {},
  checklist: null,
  lastVisited: null,
  mocks: [],
  customQuestions: [],
  activity: {},
});

export const todayISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const statusRank: Record<TopicStatus, number> = { not_started: 0, learning: 1, practising: 2, mastered: 3 };

export type Action =
  | { type: 'setExamDate'; date: string | null }
  | { type: 'setHours'; hours: number | null }
  | { type: 'openTopic'; topicId: string }
  | { type: 'setStatus'; topicId: string; status: TopicStatus }
  | { type: 'quiz'; topicId: string; score: number; total: number; masteryCheck: boolean }
  | { type: 'attempt'; questionId: string; topicId: string; result: SelfMark; origin: 'practice' | 'mock'; masteryCheck: boolean }
  | { type: 'mistakeNote'; questionId: string; note: string }
  | { type: 'mistakeResolved'; questionId: string; resolved: boolean }
  | { type: 'mistakeRemove'; questionId: string }
  | { type: 'setChecklist'; checklist: ProgressState['checklist'] }
  | { type: 'toggleChecklist'; id: string }
  | { type: 'saveMock'; attempt: MockAttempt }
  | { type: 'addCustom'; question: Question }
  | { type: 'removeCustom'; id: string }
  | { type: 'replace'; state: ProgressState };

function bump(state: ProgressState): ProgressState['activity'] {
  const d = todayISO();
  return { ...state.activity, [d]: (state.activity[d] ?? 0) + 1 };
}

function upgrade(current: TopicStatus | undefined, to: TopicStatus): TopicStatus {
  const cur = current ?? 'not_started';
  return statusRank[to] > statusRank[cur] ? to : cur;
}

/**
 * Mastery rule (auto): quiz best ≥ 80 % AND at least one practice/paper question in the topic
 * self-marked correct. Students can always override the status manually.
 */
export function meetsMastery(state: ProgressState, topicId: string, topicQuestionIds: string[]): boolean {
  const q = state.quiz[topicId];
  const quizOk = !!q && q.total > 0 && q.best / q.total >= 0.8;
  const practiceOk = topicQuestionIds.some((id) => state.attempts[id]?.result === 'correct');
  return quizOk && practiceOk;
}

export function reducer(state: ProgressState, action: Action): ProgressState {
  switch (action.type) {
    case 'setExamDate':
      return { ...state, examDate: action.date };
    case 'setHours':
      return { ...state, hoursPerDay: action.hours };
    case 'openTopic':
      return {
        ...state,
        lastVisited: { topicId: action.topicId, at: new Date().toISOString() },
        topicStatus: { ...state.topicStatus, [action.topicId]: upgrade(state.topicStatus[action.topicId], 'learning') },
      };
    case 'setStatus':
      return { ...state, topicStatus: { ...state.topicStatus, [action.topicId]: action.status } };
    case 'quiz': {
      const prev = state.quiz[action.topicId];
      const rec: QuizRecord = {
        last: action.score,
        best: Math.max(prev?.best ?? 0, action.score),
        total: action.total,
        attempts: (prev?.attempts ?? 0) + 1,
        at: new Date().toISOString(),
      };
      let status = upgrade(state.topicStatus[action.topicId], 'practising');
      if (action.masteryCheck) status = 'mastered';
      return { ...state, quiz: { ...state.quiz, [action.topicId]: rec }, topicStatus: { ...state.topicStatus, [action.topicId]: status }, activity: bump(state) };
    }
    case 'attempt': {
      const prev = state.attempts[action.questionId];
      const at = new Date().toISOString();
      const attempts = { ...state.attempts, [action.questionId]: { result: action.result, at, count: (prev?.count ?? 0) + 1, origin: action.origin } };
      const mistakes = { ...state.mistakes };
      if (action.result !== 'correct') {
        mistakes[action.questionId] = { at, note: mistakes[action.questionId]?.note ?? '', resolved: false, origin: action.origin };
      } else if (mistakes[action.questionId]) {
        mistakes[action.questionId] = { ...mistakes[action.questionId], resolved: true };
      }
      let status = upgrade(state.topicStatus[action.topicId], 'practising');
      if (action.masteryCheck) status = 'mastered';
      return { ...state, attempts, mistakes, topicStatus: { ...state.topicStatus, [action.topicId]: status }, activity: bump(state) };
    }
    case 'mistakeNote': {
      const m = state.mistakes[action.questionId];
      if (!m) return state;
      return { ...state, mistakes: { ...state.mistakes, [action.questionId]: { ...m, note: action.note } } };
    }
    case 'mistakeResolved': {
      const m = state.mistakes[action.questionId];
      if (!m) return state;
      return { ...state, mistakes: { ...state.mistakes, [action.questionId]: { ...m, resolved: action.resolved } } };
    }
    case 'mistakeRemove': {
      const rest = { ...state.mistakes };
      delete rest[action.questionId];
      return { ...state, mistakes: rest };
    }
    case 'setChecklist':
      return { ...state, checklist: action.checklist };
    case 'toggleChecklist': {
      if (!state.checklist) return state;
      return {
        ...state,
        checklist: { ...state.checklist, items: state.checklist.items.map((i) => (i.id === action.id ? { ...i, done: !i.done } : i)) },
        activity: bump(state),
      };
    }
    case 'saveMock':
      return { ...state, mocks: [action.attempt, ...state.mocks].slice(0, 50), activity: bump(state) };
    case 'addCustom':
      return { ...state, customQuestions: [...state.customQuestions, action.question] };
    case 'removeCustom':
      return { ...state, customQuestions: state.customQuestions.filter((q) => q.id !== action.id) };
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

/** Validate unknown JSON (from storage or an import file) into a ProgressState. */
export function parseState(raw: unknown): ProgressState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<ProgressState>;
  if (o.version !== 1) return null;
  const base = emptyState();
  return {
    ...base,
    ...o,
    topicStatus: o.topicStatus ?? {},
    quiz: o.quiz ?? {},
    attempts: o.attempts ?? {},
    mistakes: o.mistakes ?? {},
    mocks: Array.isArray(o.mocks) ? o.mocks : [],
    customQuestions: Array.isArray(o.customQuestions) ? o.customQuestions : [],
    activity: o.activity ?? {},
  } as ProgressState;
}

function loadInitial(): { state: ProgressState; storageOk: boolean; loadError: string | null } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: emptyState(), storageOk: true, loadError: null };
    const parsed = parseState(JSON.parse(raw));
    if (!parsed) return { state: emptyState(), storageOk: true, loadError: 'Saved progress had an unknown format and was ignored.' };
    return { state: parsed, storageOk: true, loadError: null };
  } catch {
    return { state: emptyState(), storageOk: false, loadError: null };
  }
}

interface Ctx {
  state: ProgressState;
  dispatch: (a: Action) => void;
  storageOk: boolean;
  loadError: string | null;
  reset: () => void;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadInitial());
  const [state, dispatch] = useReducer(reducer, initial.current.state);
  const [storageOk, setStorageOk] = useState(initial.current.storageOk);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (!storageOk) setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [state, storageOk]);

  const reset = useCallback(() => dispatch({ type: 'replace', state: emptyState() }), []);
  const value = useMemo(() => ({ state, dispatch, storageOk, loadError: initial.current.loadError, reset }), [state, storageOk, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
