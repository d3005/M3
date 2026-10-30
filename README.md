# JNTUK M3 (R20) — 7-page interactive exam preparation system

A working React + TypeScript + Tailwind web app for preparing **JNTUK B.Tech Mathematics-III, R20 regulation,
course code R2021011**. The code is confirmed on both uploaded question papers.

It teaches each topic step by step, gives practice with hidden solutions, quizzes and a mastery tracker, and
builds a study plan from **your** exam date. It includes the uploaded January 2023 and July 2023 papers as a
question bank, and runs timed mock exams built from those real questions.

> **Honesty conventions used everywhere in the app.** Every topic, formula, example and question is labelled as one of:
> *Verified from uploaded notes* · *Verified from uploaded past papers* · *Additional explanation (math knowledge)* ·
> *Study recommendation*. Questions we wrote ourselves are labelled **"Generated practice — not from an uploaded past paper"**
> and carry no source file or page. Worked solutions are ours, not official university answers.

## Run it

Requires Node 18+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ at http://localhost:4173
npm test             # 44 unit/integration tests (Vitest + Testing Library)
```

The build uses relative paths and hash routing, so `dist/` also works from any static host or sub-folder.

**Live site.** `.github/workflows/deploy.yml` tests and builds every push and pull request, and publishes `dist/` to GitHub Pages from the default branch (https://d3005.github.io/m3/). One-time setup: Settings > Pages > Source = **GitHub Actions**.

Optional checks:

```bash
pip install sympy
npm run verify:math  # 446 SymPy checks of the worked solutions (papers, notes, generated practice)

# with `npm run preview` running and Playwright available (PLAYWRIGHT_MODULE can point at a global install):
npm run e2e          # browser smoke test of all routes (desktop + 375px mobile) and an end-to-end user flow
```

## The seven pages (routes)

| # | Route | Page |
|---|---|---|
| 1 | `#/` | **Dashboard**: exam-date countdown, overall and per-unit progress, status counts, Continue Studying, formula review, mistake review, daily study plan (with short-time mode), daily checklist, weak topics, topic status table with manual override, export/import, reset with confirmation |
| 2 | `#/vector-calculus` | **Unit I: Vector Calculus** |
| 3 | `#/laplace-transforms` | **Unit II: Laplace Transforms** |
| 4 | `#/fourier-methods` | **Unit III: Fourier Methods** |
| 5 | `#/first-order-pdes` | **Unit IV: First-Order PDEs** |
| 6 | `#/higher-order-pdes` | **Unit V: Higher-Order PDEs** |
| 7 | `#/papers` | **Previous Papers, Practice and Mock Exams**: research archive, frequency report, question bank with filters, practice modes (previous paper / topic / mixed), timed mock exam, mistake review, add-your-own-question |

Each unit page has three sections:
- **Topics**: a "Which method?" table plus a 7-step learning path per topic:
  1. concept;
  2. formulas and method;
  3. worked example;
  4. guided example with hints;
  5. practice with step reveal and self-marking;
  6. common mistakes;
  7. quiz and mastery indicator.
- **Past-paper questions** for the unit.
- **Sources & coverage**.

Query parameters such as `?topic=u4-lagrange` or `?tab=bank` deep-link into a page; they do not create extra pages.

## Content at a glance

| | Count |
|---|---|
| Topics (I–V) | 43 (8 / 9 / 8 / 8 / 10) |
| Formula cards | 87 |
| Past-paper question parts (exact transcription, with set, Q-no., marks, PDF page) | 97 |
| Practice questions | 82 (28 from uploaded notes, 54 generated) |
| Worked + guided examples | 86 (42 from notes, 7 from papers, 37 generated) |
| Quiz items (auto-marked) | 66 |

The source audit, coverage matrix, list of unverifiable material, research log and source errata are in
**[docs/SOURCE_REPORT.md](docs/SOURCE_REPORT.md)**. The same information is shown on Page 7 and in each unit's "Sources & coverage" tab.

## Architecture

```
src/
  types.ts              data model (Question, Topic, Unit, Formula, Example, QuizItem …)
  data/
    papers.ts           97 past-paper question parts + examined-paper metadata
    unit1.ts … unit5.ts topics: concept, formulas, method, examples, practice, mistakes, quiz
    sources.ts          inventory, coverage matrix, source issues, web research log, exam pattern
    index.ts            units, "which method?" guides, lookups, priority (from paper frequency)
  lib/
    progress.tsx        reducer + localStorage persistence (key m3-r20-prep:v1)
    analytics.ts        progress, weak topics, performance (only from saved activity)
    plan.ts             study-plan generator (short-time mode when hours < need)
    mock.ts             mock-exam builders (real paper replay / mixed / weak-area), estimated step marks
    search.ts           global search over topics, formulas and questions
  components/           MathText (KaTeX), QuestionCard, Quiz, Example views, FormulaTable, FormulaReview, Layout …
  pages/                Dashboard, UnitPage (used by the five unit routes), PapersPage (+ papers/* tabs)
scripts/
  verify_papers.py      SymPy checks for every past-paper solution
  verify_notes.py       SymPy checks for the examples taken from the notes
  verify_math.py        SymPy checks for generated examples and practice
  e2e/                  Playwright smoke + flow scripts
```

### Data model (`Question`)

`id, unit, topic, subtopic, title, question, sourceType (uploaded_note | uploaded_past_paper | generated_practice | student_entered),
sourceFilename, sourcePage, sourceUrl, exam {date, year, type, set, questionNumber, code}, difficulty, marks, prerequisites,
formulaReferences, solutionSteps, finalAnswer, verificationStatus (verified_symbolic | checked_by_hand | not_verified),
verificationNote, commonMistakes, transcription (exact | exact_suspected_misprint | reconstructed | student_entered),
transcriptionNote, groupKey`.

Source fields are `null` whenever they are not verified. The tests enforce this:
- a generated question can never carry a file or page;
- every cited file must be one of the uploaded files;
- every cited page must exist in that file.

### Adding content later

- **More past papers.** Append `q({...})` entries in `src/data/papers.ts` and an `examinedPapers` row. Add matching
  checks to `scripts/verify_papers.py`. The tests check that each main question sums to 14 marks and sits in the right unit.
- **More notes.** Add an `inventory` row in `sources.ts`, then cite pages with `fromNotes(...)` and `exNotes(...)`.
- **Without code.** Page 7 → "Add a question" stores questions from your own papers in the browser. They are labelled
  *Entered by you (unverified)* and excluded from the verified frequency report.

## Persistence and privacy

Progress is stored **only in this browser's localStorage**: statuses, quiz scores, attempts, mistakes, checklist, mock
history and your own questions. There is no account, no server and no cloud sync. Clearing site data or using another
device or browser starts from zero; use **Dashboard → Export progress** to back up and **Import** to restore. If storage
is blocked (some private modes) the app still works and shows a warning that progress will not be kept. No API keys or
external AI services are used.

## Test report (this build)

| Check | Result |
|---|---|
| `tsc -b` (strict) | pass |
| `vite build` | pass |
| Vitest: 44 tests | all pass. They cover:<br>• data integrity: unique ids, every topic complete, source attribution rules, page bounds, 14-mark structure, coverage counts, frequency claims;<br>• **strict KaTeX rendering of every formula and maths fragment**;<br>• reducer, mastery rule, study plan, mock builders, search;<br>• rendering of all 7 routes plus a not-found route;<br>• quiz scoring, the solution-reveal confirmation, the reset confirmation, the formula dialog, bank filters, and a full mock-exam flow. |
| SymPy | 446/446 checks pass: papers 158, generated material 196, notes 92 |
| Browser smoke (Chromium) | 17 URLs × desktop (1366 px) and mobile (375 px): no console errors, no KaTeX errors, no horizontal page overflow, no unlabeled buttons, no links without `href` |
| Browser flow | 16/16 steps pass:<br>• the exam date drives the countdown and plan;<br>• checklist ticks and the date persist after reload;<br>• search navigates;<br>• a wrong answer lands in mistake review;<br>• an in-progress mock survives reload, then is submitted, marked and saved;<br>• weak topics update;<br>• the mobile menu and topic picker work. |

The machine checks caught two errors in our own draft answers before release:
- Jul 2023 Q1(b): the correct work done is **208/15**.
- Jan 2023 Set 3 Q4(b): the particular solution was corrected.

## Known limitations

- **No Unit I or Unit II notes were uploaded.** Those units are taught from standard mathematics and labelled that way. Their topic lists are confirmed by the 2023 papers. Dirac delta is included only because a web syllabus summary lists it.
- **Unit 5 notes stop at separation of variables.** Wave, heat and Laplace equations are taught from standard mathematics, because the papers ask them.
- **No web paper could be opened.** Search results were found, but every fetch from this sandbox failed. The historical analysis therefore rests on **5 paper sets from 2023 only**, and frequencies are a revision aid, not a prediction.
- The exam pattern (3 h, 70 marks, one question per unit with choice) is taken from the two 2023 papers and shown as **provisional**.
- Long answers are **self-assessed** against our solutions, with indicative per-step marks clearly labelled as estimates. Only the multiple-choice quizzes are auto-marked.
- Some solutions are machine-checked at sample values rather than in full generality. Each is noted on the question:
  - Jan 2023 Set 3 Q5(a) and Set 4 Q6(a): the general coefficient formula is checked at sample `n`;
  - separation-of-variables "all cases": each case is checked at a sample `k`.

  Seven items are checked by hand only: one past-paper question (Jan 2023 Set 4 Q9(a), "all forms of solution"), three practice questions and three examples.
- Fourier-transform normalisation: the app uses the notes' definition `F(p)=∫f e^{ipx}dx`. Other books differ by constant factors (see Unit III).
