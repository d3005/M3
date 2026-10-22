/**
 * Source inventory, coverage and research log.
 * Everything here describes what was ACTUALLY inspected in this build. Do not add entries
 * for files or web pages that were not opened.
 */

export const RESEARCH_DATE = '2026-10-22';

export interface InventoryItem {
  file: string;
  uploadedAs: string;
  kind: 'notes' | 'past_paper';
  unit: string;
  subject: string;
  pages: number;
  readability: string;
  inspected: string;
}

export const inventory: InventoryItem[] = [
  {
    file: 'MATHEMATICS-III-Jan-2023.pdf',
    uploadedAs: '91012570-MATHEMATICS-III-Jan-2023.pdf',
    kind: 'past_paper',
    unit: 'Units I–V',
    subject: 'II B.Tech I Sem Regular/Supplementary Exam, January 2023, Mathematics-III, Code R2021011, R20 — Sets 1, 2, 3, 4',
    pages: 8,
    readability: 'Digital PDF. Text layer exists but maths symbols are garbled (custom fonts); every question was transcribed from rendered page images.',
    inspected: 'All 8 pages viewed as images.',
  },
  {
    file: 'MATHEMATICS-III-july-2023.pdf',
    uploadedAs: 'eb44677d-MATHEMATICS-III-july-2023.pdf',
    kind: 'past_paper',
    unit: 'Units I–V',
    subject: 'II B.Tech I Sem Supplementary Exam, July 2023, Mathematics-III, Code R2021011, R20 — Set 1',
    pages: 2,
    readability: 'Digital PDF; same symbol-font issue; transcribed from page images.',
    inspected: 'Both pages viewed as images.',
  },
  {
    file: 'M3_R20_-_UNIT-3.pdf',
    uploadedAs: 'dd09c4cf-M3_R20_-_UNIT-3.pdf',
    kind: 'notes',
    unit: 'Unit III',
    subject: 'Fourier series (pp. 1–23) and Fourier transforms (pp. 24–41). Typed notes, header "MATHEMATICS-III", watermark "MRCET (EAMCET CODE: MLRD)".',
    pages: 41,
    readability: 'Typed PDF (Acrobat Distiller). Headings extractable as text; formulas read from page images.',
    inspected: 'Problem headings on all pages (text); pages 1–3, 6, 9, 12, 16, 20, 22, 24, 26–27, 32, 34, 40 viewed as images.',
  },
  {
    file: 'M3_R20_-_UNIT-4_Ref-2.pdf',
    uploadedAs: '4256d3e4-M3_R20_-_UNIT-4_Ref-2.pdf',
    kind: 'notes',
    unit: 'Unit IV',
    subject: 'First-order PDEs: formation (constants, functions), Lagrange linear equation, non-linear standard forms I–IV, reducible forms.',
    pages: 40,
    readability: 'Handwritten CamScanner scan, no text layer. Readable at screen resolution; some pages carry app banners/watermarks.',
    inspected: 'All 40 pages viewed as images.',
  },
  {
    file: 'M3_R20_-_UNIT-5_ref-2.pdf',
    uploadedAs: '5791ad70-M3_R20_-_UNIT-5_ref-2.pdf',
    kind: 'notes',
    unit: 'Unit V',
    subject: 'Higher-order linear PDEs: homogeneous (C.F., P.I. rules, failure case, xᵐyⁿ, general method), non-homogeneous, classification, separation of variables.',
    pages: 50,
    readability: 'Handwritten CamScanner scan, no text layer. Readable at screen resolution.',
    inspected: 'All 50 pages viewed as images.',
  },
];

export const missingMaterials = [
  'Unit I (Vector Calculus) notes — not uploaded. Unit I content in this app is labelled "additional mathematical knowledge".',
  'Unit II (Laplace Transforms) notes — not uploaded. Unit II content is labelled "additional mathematical knowledge".',
  'The "alternate Unit 1–4 compilation" mentioned in the brief — not uploaded.',
  'The "existing M3 analysis and important-topics reports" mentioned in the brief — not uploaded, so none of their claims are used.',
  'Unit 4 and Unit 5 files are named "Ref-2"/"ref-2"; any "Ref-1" versions were not uploaded, so duplicates/differences between versions could not be compared.',
  'You mentioned more files on your device — add them in a later session and the data model can absorb them (see README).',
];

export interface CoverageRow {
  unit: string;
  notes: string;
  paperParts: string;
  verifiable: string;
  notVerifiable: string;
}

export const coverageMatrix: CoverageRow[] = [
  {
    unit: 'I — Vector Calculus',
    notes: 'None uploaded',
    paperParts: '20 parts across 5 sets',
    verifiable: 'Topics actually examined (gradient, D.D., normals, div/curl, potentials, line/surface integrals, Green, Stokes, Gauss). All paper solutions machine-checked.',
    notVerifiable: 'Exact Unit I syllabus wording; any notes-specific methods or notation.',
  },
  {
    unit: 'II — Laplace Transforms',
    notes: 'None uploaded',
    paperParts: '20 parts across 5 sets',
    verifiable: 'Standard transforms, shifting, ×t, ÷t, scale, unit step, inverse, partial fractions, convolution, ODEs — all appear in papers.',
    notVerifiable: 'Dirac delta and periodic functions (no paper evidence, no notes). Exact syllabus wording.',
  },
  {
    unit: 'III — Fourier Methods',
    notes: 'M3_R20_-_UNIT-3.pdf (41 pp., typed)',
    paperParts: '20 parts across 5 sets',
    verifiable: 'Full topic list from notes; transform convention from notes p. 26; several paper questions are worked examples in the notes.',
    notVerifiable: 'Whether your college uses the 1/√(2π) convention (the notes are internally inconsistent).',
  },
  {
    unit: 'IV — First-order PDEs',
    notes: 'M3_R20_-_UNIT-4_Ref-2.pdf (40 pp., scanned)',
    paperParts: '20 parts across 5 sets',
    verifiable: 'Full topic list from notes, including all four non-linear standard forms and reducible forms.',
    notVerifiable: 'Contents of any "Ref-1" version.',
  },
  {
    unit: 'V — Higher-order PDEs',
    notes: 'M3_R20_-_UNIT-5_ref-2.pdf (50 pp., scanned)',
    paperParts: '17 parts across 5 sets',
    verifiable: 'Homogeneous/non-homogeneous linear PDEs, all P.I. rules, classification, separation of variables.',
    notVerifiable: 'Wave, heat and Laplace equations are examined in the papers but are NOT in the uploaded notes — taught here from standard mathematics and labelled so.',
  },
];

export interface SourceIssue {
  unit: number | null;
  where: string;
  issue: string;
  handling: string;
}

export const sourceIssues: SourceIssue[] = [
  { unit: 2, where: 'Jan 2023 Set 1 Q4(a)', issue: "Printed y'(0) = −18; the standard version of this problem has y'(0) = 2.", handling: 'Transcribed exactly; both versions solved and labelled.' },
  { unit: 5, where: 'Jan 2023 Set 1 Q9(a)', issue: 'Printed ∂³z/∂z²∂y (meaningless); almost certainly ∂³z/∂x²∂y.', handling: 'Transcribed exactly; solved with the corrected reading, flagged.' },
  { unit: 4, where: 'Jan 2023 Set 3 Q8(a)', issue: 'x²(y² − z²)p + y²(z² − x²)q = z²(x² − y²) as printed admits only one standard first integral.', handling: 'Transcribed exactly; partial result given plus two plausible intended versions.' },
  { unit: 3, where: 'Jul 2023 Q6(a)', issue: 'Middle piece printed "1 − x" (discontinuous); standard problem has "2 − x".', handling: 'Both transforms computed.' },
  { unit: 4, where: 'Jan 2023 Set 2 Q7(b)', issue: 'Instruction says "f(x) and g(x)" but the equation has g(y).', handling: 'Equation used as printed.' },
  { unit: 5, where: 'Jan 2023 Set 2 Q9(a)', issue: 'End conditions u(0,t) = u(l,t) = 0 not printed (implied by "string").', handling: 'Stated as an assumption in the solution.' },
  { unit: null, where: 'Jan 2023 Set 3 (PDF pp. 5–6)', issue: 'Hidden text layer contains "R19" beneath the visible "R20" label.', handling: 'Visible label (R20) and code R2021011 used; noted only for transparency.' },
  { unit: 3, where: 'Unit 3 notes p. 2', issue: 'Orthogonality note (ii) lists ∫ sin mx sin nx = 0 for m = n = 0 and π for m ≠ n > 0 — the cases are swapped (correct: 0 for m ≠ n, π for m = n > 0).', handling: 'Correct statement used in the app; flagged here.' },
  { unit: 3, where: 'Unit 3 notes p. 27, Problem 1', issue: 'Uses a 1/√(2π) factor although p. 26 defines F(p) = ∫ f e^{ipx} dx without it; final line prints "cos ax" where "cos ap" is meant.', handling: 'App consistently uses the p. 26 definition and states the convention.' },
  { unit: 4, where: 'Unit 4 notes pp. 15 & 16', issue: 'The e^{ax+by} f(ax − by) derivation is scanned twice (pp. 15–16); CamScanner banners overlap some lines on pp. 14–16.', handling: 'Content read from both copies; no conflicting values.' },
  { unit: 5, where: 'Unit 5 notes (whole file)', issue: 'Ends at separation of variables (p. 50); no wave/heat/Laplace boundary-value problems although the papers ask them.', handling: 'Those topics are labelled "not in uploaded notes" and taught from standard mathematics.' },
];

export interface WebSource {
  title: string;
  url: string;
  claim: string;
  status: string;
  regulation: string;
}

/** Web research log. NOTHING here was opened: the sandbox's fetch tool could not resolve any host. */
export const webSources: WebSource[] = [
  { title: 'Manabadi — JNTU Kakinada B.Tech 2-1 Mathematics previous papers', url: 'https://www.manabadi.co.in/institute/DownLoadBQP-Syllabuswise.aspx?title=JNTU+Kakinada-BTech+2-1-MATHEMATICS-Previous-Year-Question-Papers&SYSID=118&clsid=13&QPT=p&SubjectId=287', claim: 'Search summary mentions R20 Mathematics-III papers for Feb 2022 and July 2022.', status: 'Search-result summary only — page not opened (fetch failed: DNS).', regulation: 'R20 (per summary)' },
  { title: 'JNTU Fast Updates — JNTUK 2-1 (R20) Regular/Supply papers, January 2023', url: 'https://www.jntufastupdates.com/jntuk-2-1-question-papers-2023/', claim: 'Listing page for Jan 2023 2-1 R20 papers.', status: 'Search-result summary only — not opened.', regulation: 'R20 (per summary)' },
  { title: 'JNTU Fast Updates — JNTUK 2-1 (R20) papers, December 2023', url: 'https://www.jntufastupdates.com/jntuk-2-1-r20-question-papers-dec-2023/', claim: 'Listing includes Mathematics-III. Summary also claimed "75 marks, 5 × 15" — this CONFLICTS with the 70 marks printed on both uploaded papers and is treated as unreliable.', status: 'Search-result summary only — not opened.', regulation: 'R20 (per summary)' },
  { title: 'Aajhub — JNTUK 2-1 R20 papers, December 2023', url: 'https://aajhub.in/jntuk-2-1-question-papers-2023-r20/', claim: 'Listing of Dec 2023 2-1 R20 papers.', status: 'Search-result summary only — not opened.', regulation: 'R20 (per summary)' },
  { title: 'JNTU Fast Updates — JNTUK 2-1 papers 2021–2024 (collection)', url: 'https://www.jntufastupdates.com/jntuk-2-1-question-papers/', claim: 'General collection page.', status: 'Search-result summary only — not opened.', regulation: 'Mixed' },
  { title: 'Manaresults — Mathematics-III R19 (R19BS1203)', url: 'https://www.manaresults.co.in/download.php?subcode=R19BS1203', claim: 'R19 Mathematics-III papers (2020–2023).', status: 'Excluded: different regulation (R19). Not opened.', regulation: 'R19' },
  { title: 'JNTU Fast Updates — JNTUK 1-2 R20 supply papers Jan/Feb 2023', url: 'https://www.jntufastupdates.com/jntuk-1-2-r20-supply-question-papers-jan-2023/', claim: 'Lists a "Mathematics-III (Only EEE)" first-year paper.', status: 'Excluded: different semester/course. Not opened.', regulation: 'R20 (1-2)' },
  { title: 'R20 2nd-year syllabus (college-hosted PDF)', url: 'https://diet.ac.in/wp-content/uploads/2024/10/R20-2nd-Year-syllabus.pdf', claim: 'Search summary: five units — vector calculus; Laplace transforms; Fourier series & transforms; first-order PDE; second-order PDE & applications.', status: 'Search-result summary only — not opened (proxy refused / DNS).', regulation: 'R20' },
  { title: 'R20 CSE-AI&DS syllabus (college-hosted PDF)', url: 'https://files.rcee.ac.in/files/examcell/syllabus/r20/ug_btech_ai-ds.pdf', claim: 'Summary: Unit V includes separation of variables for wave, heat and 2-D Laplace equations.', status: 'Search-result summary only — not opened.', regulation: 'R20' },
  { title: 'R20 Mechanical syllabus (college-hosted PDF)', url: 'https://jntukucen.ac.in/wp-content/uploads/2023/11/R20-Mechanical-Engineering-Syllabus.pdf', claim: 'Summary: unit numbering differs for Mechanical (first-order PDE placed with Fourier).', status: 'Search-result summary only — not opened. Check your own branch syllabus.', regulation: 'R20' },
  { title: 'R20 Civil syllabus (college-hosted PDF)', url: 'https://diet.edu.in/cmoon_images/b.tech_civil_r20_syllabus.pdf', claim: 'Summary: course listed as BSC301 "Mathematics-III (Vector Calculus, Transforms and PDE)", 3 credits.', status: 'Search-result summary only — not opened.', regulation: 'R20' },
];

export const researchMethodology = [
  `Date: ${RESEARCH_DATE}.`,
  'Step 1 — Uploaded files: rendered every past-paper page as an image and transcribed each question by eye (text layers garble maths fonts). Notes PDFs were read page by page from images (Units 4–5 are handwritten scans).',
  'Step 2 — Web search (queries included "JNTUK R20 Mathematics III R2021011 previous question papers PDF", "… January 2023 supplementary", "… Vector Calculus, Transforms and PDE question paper 2023 2024", and R20 syllabus queries).',
  'Step 3 — Opening results: every attempt to open a result (WebFetch and direct download) failed in this sandbox (DNS resolution failure / proxy refusal). Therefore NO web paper was verified, and NO web question is included in the bank.',
  'Step 4 — Verification: all worked solutions were checked with SymPy (scripts/verify_papers.py, verify_math.py, verify_notes.py). Questions marked "checked_by_hand" are not machine-checked.',
  'Consequence: the historical analysis rests on 5 paper sets from one year (2023). This is a small sample — treat frequencies as a revision aid, not a prediction.',
];

export const examPattern = {
  verified: [
    'Both uploaded papers print: Code No. R2021011, R20, Time 3 hours, Max. Marks 70.',
    'Instructions printed: "Answer any FIVE Questions, each Question from each unit. All Questions carry Equal Marks" — i.e. 5 × 14 marks, with an internal choice Q(2k−1) OR Q(2k) for unit k.',
    'Most questions are split 7 + 7 marks; some are a single 14-mark question (e.g. Jan 2023 Set 2 Q9, Q10; Jul 2023 Q9); one is 9 + 5 (Jan 2023 Set 1 Q3).',
  ],
  provisional:
    'This is the pattern of the January and July 2023 papers only. It does NOT prove the current pattern. Confirm the pattern for your examination with your college/exam cell (one unverified web summary even mentioned 75 marks).',
};
