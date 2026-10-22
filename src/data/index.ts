import type { Formula, Priority, Question, Topic, Unit, UnitId } from '../types';
import { unit1Topics } from './unit1';
import { unit2Topics } from './unit2';
import { unit3Topics } from './unit3';
import { unit4Topics } from './unit4';
import { unit5Topics } from './unit5';
import { paperQuestions } from './papers';
import { NOTES } from './helpers';

export const units: Unit[] = [
  {
    id: 1, slug: 'vector-calculus', path: '/vector-calculus', title: 'Unit I: Vector Calculus', short: 'Vector Calculus',
    overview: 'Vector differentiation (gradient, divergence, curl, potentials) and vector integration (line, surface, volume integrals) with the theorems of Green, Stokes and Gauss.',
    notesStatus: 'No Unit I notes were uploaded. Topics are confirmed by the uploaded 2023 papers; explanations are additional mathematical knowledge.',
    sources: [], guide: [
      { cue: 'Rate of change of a scalar "in the direction of" a vector or line PQ', method: 'Directional derivative ∇φ · â (normalise!)', topicId: 'u1-grad' },
      { cue: '"Angle between surfaces", "unit normal", "intersect orthogonally"', method: 'Gradients as normals, dot product', topicId: 'u1-grad' },
      { cue: '"Solenoidal", ∇·F, identities with r and rⁿ', method: 'Divergence; ∇rⁿ = n rⁿ⁻² r', topicId: 'u1-div' },
      { cue: '"Irrotational", "scalar potential"', method: 'Curl = 0, then integrate component-wise', topicId: 'u1-curl' },
      { cue: '"Work done" along a given curve', method: 'Parametrise, ∫ F · dr', topicId: 'u1-line' },
      { cue: '∬ F · n dS over an open surface (plane, cylinder)', method: 'Projection or cylindrical parametrisation', topicId: 'u1-surface' },
      { cue: '∮ (M dx + N dy) around a plane region', method: "Green's theorem", topicId: 'u1-green' },
      { cue: '∮ F · dr in space, or ∬ curl F · n dS', method: "Stokes' theorem (use the flattest surface)", topicId: 'u1-stokes' },
      { cue: '∬ over a CLOSED surface, "transform into a triple integral"', method: 'Gauss divergence theorem', topicId: 'u1-gauss' },
    ], topics: unit1Topics,
  },
  {
    id: 2, slug: 'laplace-transforms', path: '/laplace-transforms', title: 'Unit II: Laplace Transforms', short: 'Laplace Transforms',
    overview: 'Standard transforms, shifting theorems, multiplication/division by t, unit step and delta functions, inverse transforms, convolution and initial-value problems.',
    notesStatus: 'No Unit II notes were uploaded. Topics are confirmed by the uploaded 2023 papers (except Dirac delta, which is from the web syllabus summary only); explanations are additional mathematical knowledge.',
    sources: [], guide: [
      { cue: 'Sum of standard functions, powers of sin/cos', method: 'Identities + table + linearity', topicId: 'u2-standard' },
      { cue: 'e^{at} × f(t)', method: 'First shifting: s → s − a', topicId: 'u2-shift1' },
      { cue: 't × f(t), f(t)/t, f(at), or ∫₀^∞ e^{−at} g(t) dt', method: '−d/ds, ∫ₛ^∞, change of scale, or put s = a', topicId: 'u2-tmul' },
      { cue: 'Piecewise f(t), u(t − a), e^{−as} in an inverse', method: 'Unit step + second shifting theorem', topicId: 'u2-step' },
      { cue: '∫₀ᵗ f(u) du inside L{…}', method: 'Divide by s', topicId: 'u2-deriv-int' },
      { cue: 'Rational F(s) to invert', method: 'Partial fractions / complete the square', topicId: 'u2-inverse' },
      { cue: '"Use convolution", product F(s)G(s) of simple pieces', method: '∫₀ᵗ f(u) g(t − u) du', topicId: 'u2-conv' },
      { cue: 'ODE with y(0), y′(0) given', method: 'Transform, solve for Y(s), invert', topicId: 'u2-ode' },
    ], topics: unit2Topics,
  },
  {
    id: 3, slug: 'fourier-methods', path: '/fourier-methods', title: 'Unit III: Fourier Methods', short: 'Fourier Methods',
    overview: "Fourier series (Euler's formulae, even/odd, change of interval, half-range) and Fourier integrals and transforms (complex, sine, cosine, finite).",
    notesStatus: 'Grounded in the uploaded typed notes M3_R20_-_UNIT-3.pdf (41 pages).',
    sources: [{ file: NOTES.u3, pages: '1–41' }], guide: [
      { cue: 'Periodic function on (−π, π) or (0, 2π)', method: "Euler's formulae", topicId: 'u3-euler' },
      { cue: 'Symmetric interval and f even/odd', method: 'Only cosines (even) / only sines (odd)', topicId: 'u3-evenodd' },
      { cue: 'Period 2l ≠ 2π, e.g. f(x + 2) = f(x)', method: 'Change of interval: nπx/l, factor 1/l', topicId: 'u3-interval' },
      { cue: '"Half-range sine/cosine series" on (0, l)', method: 'Odd/even extension, factor 2/l', topicId: 'u3-halfrange' },
      { cue: 'Non-periodic f on (0, ∞) or ℝ; "using Fourier integral show …"', method: 'Fourier sine/cosine integral', topicId: 'u3-integral' },
      { cue: '"Fourier transform" of f on (−∞, ∞)', method: 'F(p) = ∫ f e^{ipx} dx (state convention)', topicId: 'u3-ft' },
      { cue: '"Fourier sine/cosine transform", integral equations', method: 'F_s / F_c and the 2/π inversion', topicId: 'u3-sincos' },
      { cue: '"Finite Fourier transform" on (0, l)', method: 'Kernel sin/cos(nπx/l)', topicId: 'u3-finite' },
    ], topics: unit3Topics,
  },
  {
    id: 4, slug: 'first-order-pdes', path: '/first-order-pdes', title: 'Unit IV: First-Order PDEs', short: 'First-Order PDEs',
    overview: "Formation of PDEs, Lagrange's linear equation, non-linear standard forms I–IV and equations reducible to them.",
    notesStatus: 'Grounded in the uploaded handwritten notes M3_R20_-_UNIT-4_Ref-2.pdf (40 pages, read from images).',
    sources: [{ file: NOTES.u4, pages: '1–40' }], guide: [
      { cue: '"Eliminate arbitrary constants"', method: 'Differentiate w.r.t. x, y; remove constants', topicId: 'u4-const' },
      { cue: '"Eliminate arbitrary function(s)", f(u, v) = 0', method: 'Divide derivatives / Jacobians', topicId: 'u4-func' },
      { cue: 'Linear in p, q: Pp + Qq = R', method: "Lagrange: dx/P = dy/Q = dz/R", topicId: 'u4-lagrange' },
      { cue: 'Only p and q appear', method: 'Form I: z = ax + by + c', topicId: 'u4-form1' },
      { cue: 'z, p, q only (no x, y)', method: 'Form II: z = f(x + ay)', topicId: 'u4-form2' },
      { cue: 'x with p separable from y with q', method: 'Form III: f(x, p) = g(y, q) = a', topicId: 'u4-form3' },
      { cue: 'z = px + qy + f(p, q) (after rearranging)', method: 'Clairaut: p → a, q → b', topicId: 'u4-clairaut' },
      { cue: 'xp, yq, x^m p, z p combinations', method: 'Substitute log x, x^{1−m}, z^{k+1}', topicId: 'u4-reducible' },
    ], topics: unit4Topics,
  },
  {
    id: 5, slug: 'higher-order-pdes', path: '/higher-order-pdes', title: 'Unit V: Higher-Order PDEs', short: 'Higher-Order PDEs',
    overview: 'Linear PDEs with constant coefficients (C.F. and P.I.), non-homogeneous equations, classification, separation of variables and its applications.',
    notesStatus: 'Grounded in the uploaded handwritten notes M3_R20_-_UNIT-5_ref-2.pdf (50 pages). Wave/heat/Laplace topics are NOT in those notes (they appear in papers) and are labelled accordingly.',
    sources: [{ file: NOTES.u5, pages: '1–50' }], guide: [
      { cue: 'All derivative terms of the same order, RHS = 0', method: 'C.F. from f(m, 1) = 0', topicId: 'u5-cf' },
      { cue: 'RHS = e^{ax+by}, sin/cos(ax+by), φ(ax+by)', method: 'P.I. = ∫…∫φ/f(a,b); failure ⇒ ×x and ∂f/∂D', topicId: 'u5-pi-exp' },
      { cue: 'RHS = polynomial xᵐyⁿ', method: 'Binomial expansion of 1/f(D, D′)', topicId: 'u5-pi-poly' },
      { cue: 'RHS like y cos x, (y − 1)eˣ', method: 'General rule 1/(D − mD′)', topicId: 'u5-pi-general' },
      { cue: 'Terms of different orders (e.g. D² − D′ + D)', method: 'Factor (D − mD′ − α): e^{αx}φ(y + mx)', topicId: 'u5-nonhom' },
      { cue: '"Classify" A u_xx + B u_xy + C u_yy …', method: 'Sign of B² − 4AC', topicId: 'u5-classify' },
      { cue: '"By separation of variables" with an exponential condition', method: 'u = X·T, constant k, compare exponents', topicId: 'u5-separation' },
      { cue: 'String, u_tt = c² u_xx', method: 'Fixed-end sine modes, A_n, B_n', topicId: 'u5-wave' },
      { cue: 'Rod temperature, u_t = c² u_xx, "steady state"', method: 'Linear steady state, then decaying sine series', topicId: 'u5-heat' },
      { cue: 'Plate, u_xx + u_yy = 0', method: 'sin in x, e^{−y}/sinh in y', topicId: 'u5-laplace' },
    ], topics: unit5Topics,
  },
];

export const allTopics: Topic[] = units.flatMap((u) => u.topics);
export const topicById = new Map(allTopics.map((t) => [t.id, t]));
export const unitById = new Map(units.map((u) => [u.id, u]));

export function unitOfTopic(topicId: string): Unit | undefined {
  const t = topicById.get(topicId);
  return t ? unitById.get(t.unit) : undefined;
}

export const practiceQuestions: Question[] = allTopics.flatMap((t) => t.practice);
export { paperQuestions };
export const allQuestions: Question[] = [...paperQuestions, ...practiceQuestions];
export const questionById = new Map(allQuestions.map((q) => [q.id, q]));

export const allFormulas: (Formula & { unit: UnitId; topicId: string; topicTitle: string })[] = allTopics.flatMap((t) =>
  t.formulas.map((f) => ({ ...f, unit: t.unit, topicId: t.id, topicTitle: t.title })),
);

/** How many uploaded past-paper question parts are classified under each topic. */
export const paperCountByTopic: Record<string, number> = Object.fromEntries(
  allTopics.map((t) => [t.id, paperQuestions.filter((q) => q.topic === t.id).length]),
);

/**
 * Study-priority RECOMMENDATION (not a prediction): derived only from how often the topic
 * appears in the 5 uploaded paper sets (2023).
 */
export function priorityOf(topicId: string): Priority {
  const n = paperCountByTopic[topicId] ?? 0;
  if (n >= 3) return 'core';
  if (n >= 1) return 'important';
  return 'supporting';
}

export const priorityLabel: Record<Priority, string> = {
  core: 'High priority',
  important: 'Medium priority',
  supporting: 'Lower priority',
};

export const priorityExplain =
  'Priority is a study recommendation computed from how many question parts of the 5 uploaded 2023 paper sets fall under the topic (≥3: high, 1–2: medium, 0: lower). It is not a prediction of your exam.';
