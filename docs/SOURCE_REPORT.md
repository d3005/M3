# Source audit and coverage report

Audit and web research performed **2026-10-22**. This report only describes material that was actually inspected.

## 1. Inventory of uploaded files

| File (as uploaded) | Kind | Unit | Pages | Readable? | What was inspected |
|---|---|---|---|---|---|
| `MATHEMATICS-III-Jan-2023.pdf` | Past paper | I–V | 8 | Digital PDF; the text layer garbles maths fonts, so every question was **read from rendered page images** | All 8 pages (Sets 1–4, 2 pages each) |
| `MATHEMATICS-III-july-2023.pdf` | Past paper | I–V | 2 | Same as above | Both pages (Set 1) |
| `M3_R20_-_UNIT-3.pdf` | Notes (typed, MRCET watermark) | III | 41 | Typed; headings extractable as text; formulas read from images | Problem headings on all pages; pp. 1–3, 6, 9, 12, 16, 20, 22, 24, 26–27, 32, 34, 40 as images |
| `M3_R20_-_UNIT-4_Ref-2.pdf` | Notes (handwritten CamScanner scan) | IV | 40 | Image-only; readable | All 40 pages as images |
| `M3_R20_-_UNIT-5_ref-2.pdf` | Notes (handwritten CamScanner scan) | V | 50 | Image-only; readable | All 50 pages as images |

Both papers print: *II B.Tech I Semester … Examinations*, **MATHEMATICS-III**, **Code No: R2021011**, **R20**,
**Time: 3 hours, Max. Marks: 70**, "Answer any FIVE Questions, each Question from each unit; All Questions carry
Equal Marks".
- January 2023 is headed "Regular/Supplementary … (Com to all branches, Except EEE & FE)".
- July 2023 is headed "Supplementary … (Com to all branches)".

**Duplicates and versions.**
- Unit 4 notes, PDF pp. 15 and 16, carry the same derivation scanned twice. No conflicting values.
- The Unit 4 and Unit 5 files are "Ref-2". No "Ref-1" or alternate compilation was uploaded, so versions could not be compared.

**Not uploaded (but mentioned in the brief):**
- Unit I notes;
- Unit II notes;
- the alternate Unit 1–4 compilation;
- the "M3 analysis" and "important topics" reports.

You mentioned more files on your device. None of these were used or quoted.

## 2. Coverage matrix

| Unit | Uploaded notes | Past-paper parts (5 sets) | Verifiable | Not verifiable |
|---|---|---|---|---|
| I Vector Calculus | none | 20 | Topics examined: gradient, directional derivative, normals, div/curl, potentials, line/surface integrals, Green, Stokes, Gauss | Exact syllabus wording; any notes-specific methods |
| II Laplace Transforms | none | 20 | Standard transforms, shifts, ×t, ÷t, scale, unit step, inverses, convolution, ODEs | Dirac delta (web summary only), periodic functions |
| III Fourier Methods | Unit-3 (41 pp.) | 20 | Full topic list; transform convention (notes p. 26) | Which normalisation your college prefers (the notes are inconsistent) |
| IV First-order PDEs | Unit-4 Ref-2 (40 pp.) | 20 | Full topic list incl. standard forms I–IV and reducible forms | Contents of any Ref-1 |
| V Higher-order PDEs | Unit-5 ref-2 (50 pp.) | 17 | C.F., all P.I. rules, non-homogeneous, classification, separation | **Wave/heat/Laplace boundary-value problems are in the papers but not in the notes** |

### Notes page map

**Unit 3**

| PDF pp. | Topic |
|---|---|
| 1–10 | Fourier series and Euler's formulae |
| 11–15 | Even and odd functions |
| 16–17 | Half-range series on (0, π) |
| 17–20 | Change of interval |
| 21–23 | Half-range series on (0, l) |
| 24–26 | Fourier integrals |
| 26–30 | Complex transform |
| 31–40 | Sine and cosine transforms |
| 40–41 | Finite transforms |

**Unit 4**

| PDF pp. | Topic |
|---|---|
| 1 | Definitions, order and degree |
| 2–10 | Eliminating constants |
| 11–18 | Eliminating functions |
| 19 | Types of solutions |
| 20–26 | Lagrange's linear equation |
| 27–29 | Form I |
| 30–31 | Reducible forms |
| 32–35 | Form II |
| 35–37 | Form III |
| 37–39 | Clairaut's form |
| 39–40 | Reducible forms (worked examples) |

**Unit 5**

| PDF pp. | Topic |
|---|---|
| 1–6 | Homogeneous linear PDE: C.F. |
| 7–17 | P.I. for φ(ax+by), and the failure case |
| 18–26 | P.I. for xᵐyⁿ |
| 27–33 | General P.I. rule |
| 34–45 | Non-homogeneous linear PDE |
| 46 | Classification |
| 46–50 | Separation of variables |

## 3. Questions or pages that could not be fully verified

| Item | Issue | Handling in the app |
|---|---|---|
| Jan 2023 Set 1 Q4(a) | `y'(0) = −18` as printed; the standard version has `y'(0) = 2` | Transcribed exactly; both solved |
| Jan 2023 Set 1 Q9(a) | `∂³z/∂z²∂y` printed (should be `∂x²∂y`) | Flagged; solved with the corrected reading |
| Jan 2023 Set 3 Q8(a) | As printed, only one standard first integral exists | Partial result plus two plausible intended versions |
| Jul 2023 Q6(a) | Middle piece `1 − x` (likely `2 − x`) | Both transforms computed |
| Jan 2023 Set 2 Q7(b) | "f(x) and g(x)" vs `g(y)` in the equation | Equation used as printed |
| Jan 2023 Set 2 Q9(a) | End conditions not printed | Stated as an assumption |
| Jan 2023 Set 3 pages | Hidden text-layer "R19" under the visible "R20" | Visible label used; noted |
| Unit 3 notes p. 2 | Orthogonality note (ii): the cases are swapped | Correct statement used |
| Unit 3 notes p. 27 | Uses `1/√(2π)` in Problem 1, inconsistent with the definition on p. 26; prints "cos ax" for "cos ap" | App uses the p. 26 definition and states it |
| Unit 5 notes | No wave/heat/Laplace material | Labelled "not in uploaded notes" |
| Units I–II | No notes | Labelled "additional mathematical knowledge" |

No page was so damaged that a value had to be guessed. CamScanner banners overlap a few lines in the Unit 4 notes (pp. 14–16), but the content is legible.

## 4. Web research (Page 7 → Archive & research)

**Queries run:**
- JNTUK R20 Mathematics III R2021011 previous question papers PDF;
- … January 2023 supplementary;
- … "Vector Calculus, Transforms and PDE" question paper 2023 2024;
- R20 Mathematics-III syllabus (several variants).

**Result:** about ten candidate pages were found, from jntufastupdates, manabadi, aajhub, manaresults and several
college-hosted R20 syllabus PDFs. **None could be opened.** WebFetch failed with DNS resolution errors and direct
downloads were refused by the sandbox proxy. Therefore:

- no web paper is marked verified;
- no web question is in the bank;
- R19 papers (manaresults) and a first-year "Mathematics-III (EEE only)" listing were **excluded** as a different regulation or course.

One search summary claimed "75 marks, 5 × 15" for December 2023. This **conflicts** with the 70 marks printed on both
uploaded papers and is treated as unreliable. The full list, with links exactly as returned by search, is on Page 7.

**Sample size for the frequency report:** 5 verified paper sets (January 2023 Sets 1–4, July 2023 Set 1), 97 question
parts, one year (2023). There are no 2021, 2022, 2024 or 2025 papers. Frequency is a revision aid, not a prediction.

## 5. Notable cross-references between notes and papers

Several paper questions are worked examples in the uploaded notes:

| Paper question | Notes location |
|---|---|
| Jul 2023 Q5(a) | Unit 3 p. 9 |
| Jan 2023 Set 1 Q5(b) | Unit 3 p. 24 |
| Jan 2023 Set 1 Q6(b) | Unit 3 p. 25 |
| Jan 2023 Set 4 Q5(b) | Unit 3 p. 41 |
| Jan 2023 Set 1 Q7(b) | Unit 4 p. 40 |
| Jan 2023 Set 2 Q7(b) | Unit 4 p. 18 |
| Jan 2023 Set 4 Q7(b) | Unit 4 p. 4 |
| Jan 2023 Set 4 Q8(b) | Unit 4 p. 29 |
| Jan 2023 Set 3 Q9(a) | Unit 5 pp. 48–49 |
| Jan 2023 Set 3 Q10(b) | Unit 5 p. 30 |

In every case the app's answer agrees with the notes.
