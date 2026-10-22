export type UnitId = 1 | 2 | 3 | 4 | 5;

/** Where a question came from. Never fabricate the source fields: use null when unknown. */
export type SourceType = 'uploaded_note' | 'uploaded_past_paper' | 'generated_practice' | 'student_entered';

/** The four content categories required by the brief. */
export type Provenance = 'verified_notes' | 'verified_papers' | 'math_knowledge' | 'recommendation';

export type VerificationStatus =
  | 'verified_symbolic' // checked by scripts/verify_*.py with sympy
  | 'checked_by_hand' // derivation re-checked by hand, not machine-checked
  | 'not_verified'; // no reliable solution yet

export type Transcription = 'exact' | 'exact_suspected_misprint' | 'reconstructed' | 'student_entered';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SourceRef {
  file: string;
  pages: string;
}

export interface ExamMeta {
  date: string; // e.g. "January 2023"
  year: number;
  type: 'Regular/Supplementary' | 'Supplementary' | 'Unknown';
  set: string; // e.g. "Set 1"
  questionNumber: string; // e.g. "1(a)"
  code: string | null; // course code printed on the paper
}

export interface Question {
  id: string;
  unit: UnitId;
  topic: string; // topic id
  subtopic: string | null;
  title: string;
  question: string; // LaTeX-in-markdown
  sourceType: SourceType;
  sourceFilename: string | null;
  sourcePage: number | null; // page index inside the PDF, only when verified
  sourceUrl: string | null;
  exam: ExamMeta | null;
  difficulty: Difficulty;
  marks: number | null;
  prerequisites: string[];
  formulaReferences: string[]; // formula ids
  solutionSteps: string[];
  finalAnswer: string;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  commonMistakes: string[];
  transcription: Transcription | null;
  transcriptionNote: string | null;
  groupKey: string | null; // similar questions share a key
}

export interface Formula {
  id: string;
  label: string;
  tex: string;
  conditions?: string;
  provenance: Provenance;
  sourceRef?: SourceRef;
}

export interface Example {
  title: string;
  problem: string;
  why: string;
  steps: string[];
  hints?: string[];
  answer: string;
  check?: string;
  sourceType: SourceType;
  sourceFilename: string | null;
  sourcePage: number | null;
  verificationStatus: VerificationStatus;
}

export interface QuizItem {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type Priority = 'core' | 'important' | 'supporting';

export interface Topic {
  id: string;
  unit: UnitId;
  title: string;
  short: string;
  provenance: Provenance[];
  syllabusNote: string;
  notesRef: SourceRef | null;
  estHours: number;
  prerequisites: string[];
  concept: string[];
  notation: string[];
  formulas: Formula[];
  method: string[];
  worked: Example;
  guided: Example;
  practice: Question[];
  mistakes: string[];
  quiz: QuizItem[];
}

export interface Unit {
  id: UnitId;
  slug: string;
  path: string;
  title: string;
  short: string;
  overview: string;
  notesStatus: string;
  sources: SourceRef[];
  /** "If the question looks like … use …" pattern-recognition table. */
  guide: { cue: string; method: string; topicId: string }[];
  topics: Topic[];
}

export type TopicStatus = 'not_started' | 'learning' | 'practising' | 'mastered';
export type SelfMark = 'correct' | 'partial' | 'incorrect';
