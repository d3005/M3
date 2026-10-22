import { useCallback } from 'react';
import type { SelfMark } from '../types';
import { meetsMastery, reducer, useProgress } from './progress';
import { topicQuestionIds } from './analytics';

/** Recording helpers that also apply the automatic mastery rule. */
export function useStudyActions() {
  const { state, dispatch } = useProgress();

  const recordQuiz = useCallback(
    (topicId: string, score: number, total: number) => {
      const next = reducer(state, { type: 'quiz', topicId, score, total, masteryCheck: false });
      dispatch({ type: 'quiz', topicId, score, total, masteryCheck: meetsMastery(next, topicId, topicQuestionIds(next, topicId)) });
    },
    [state, dispatch],
  );

  const recordAttempt = useCallback(
    (questionId: string, topicId: string, result: SelfMark, origin: 'practice' | 'mock' = 'practice') => {
      const next = reducer(state, { type: 'attempt', questionId, topicId, result, origin, masteryCheck: false });
      dispatch({ type: 'attempt', questionId, topicId, result, origin, masteryCheck: meetsMastery(next, topicId, topicQuestionIds(next, topicId)) });
    },
    [state, dispatch],
  );

  return { recordQuiz, recordAttempt };
}
