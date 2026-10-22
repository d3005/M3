import type { Difficulty, Example, Question, SourceType, UnitId, VerificationStatus } from '../types';

export const r = String.raw;

export const NOTES = {
  u3: 'M3_R20_-_UNIT-3.pdf',
  u4: 'M3_R20_-_UNIT-4_Ref-2.pdf',
  u5: 'M3_R20_-_UNIT-5_ref-2.pdf',
} as const;

interface QOpts {
  difficulty?: Difficulty;
  marks?: number | null;
  status?: VerificationStatus;
  note?: string;
  mistakes?: string[];
  formulas?: string[];
  prerequisites?: string[];
}

/** A practice question we wrote ourselves. Source fields are deliberately null. */
export function gen(
  id: string, unit: UnitId, topic: string, title: string, question: string,
  steps: string[], answer: string, o: QOpts = {},
): Question {
  return base(id, unit, topic, title, question, steps, answer, 'generated_practice', null, null, o);
}

/** A practice question taken from an uploaded notes PDF (page = PDF page index, checked on the page image). */
export function fromNotes(
  id: string, unit: UnitId, topic: string, file: string, page: number, title: string, question: string,
  steps: string[], answer: string, o: QOpts = {},
): Question {
  return base(id, unit, topic, title, question, steps, answer, 'uploaded_note', file, page, o);
}

function base(
  id: string, unit: UnitId, topic: string, title: string, question: string, steps: string[], answer: string,
  sourceType: SourceType, file: string | null, page: number | null, o: QOpts,
): Question {
  return {
    id, unit, topic, subtopic: null, title, question, sourceType,
    sourceFilename: file, sourcePage: page, sourceUrl: null, exam: null,
    difficulty: o.difficulty ?? 'medium', marks: o.marks ?? null,
    prerequisites: o.prerequisites ?? [], formulaReferences: o.formulas ?? [],
    solutionSteps: steps, finalAnswer: answer,
    verificationStatus: o.status ?? 'verified_symbolic',
    verificationNote: o.note ?? null, commonMistakes: o.mistakes ?? [],
    transcription: sourceType === 'uploaded_note' ? 'exact' : null, transcriptionNote: null, groupKey: null,
  };
}

interface ExOpts {
  hints?: string[];
  check?: string;
  status?: VerificationStatus;
}

export function exGen(title: string, problem: string, why: string, steps: string[], answer: string, o: ExOpts = {}): Example {
  return { title, problem, why, steps, answer, hints: o.hints, check: o.check, sourceType: 'generated_practice', sourceFilename: null, sourcePage: null, verificationStatus: o.status ?? 'verified_symbolic' };
}

export function exNotes(file: string, page: number, title: string, problem: string, why: string, steps: string[], answer: string, o: ExOpts = {}): Example {
  return { title, problem, why, steps, answer, hints: o.hints, check: o.check, sourceType: 'uploaded_note', sourceFilename: file, sourcePage: page, verificationStatus: o.status ?? 'verified_symbolic' };
}

export function exPaper(file: string, page: number, title: string, problem: string, why: string, steps: string[], answer: string, o: ExOpts = {}): Example {
  return { title, problem, why, steps, answer, hints: o.hints, check: o.check, sourceType: 'uploaded_past_paper', sourceFilename: file, sourcePage: page, verificationStatus: o.status ?? 'verified_symbolic' };
}
