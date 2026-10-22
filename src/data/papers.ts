import type { Question, UnitId, Difficulty, VerificationStatus, Transcription } from '../types';

/**
 * Past-paper question bank.
 *
 * Every question below was transcribed from the page IMAGES of the two uploaded papers
 * (the PDFs' text layers mangle the maths fonts). sourcePage = page index inside the PDF.
 * Solutions are our own worked solutions, NOT official university answers.
 * "verified_symbolic" = the final answer is machine-checked in scripts/verify_papers.py
 * (or scripts/verify_math.py where noted).
 */

const r = String.raw;
export const JAN_FILE = 'MATHEMATICS-III-Jan-2023.pdf';
export const JUL_FILE = 'MATHEMATICS-III-july-2023.pdf';

interface P {
  file: 'jan' | 'jul';
  set: 1 | 2 | 3 | 4;
  qn: string;
  page: number;
  marks: number;
  unit: UnitId;
  topic: string;
  title: string;
  question: string;
  steps: string[];
  answer: string;
  difficulty?: Difficulty;
  status?: VerificationStatus;
  note?: string;
  transcription?: Transcription;
  tnote?: string;
  mistakes?: string[];
  group?: string;
  formulas?: string[];
  subtopic?: string;
}

function q(p: P): Question {
  const jan = p.file === 'jan';
  return {
    id: `${jan ? 'J23' : 'JUL23'}-S${p.set}-Q${p.qn.replace(/[()]/g, '')}`,
    unit: p.unit,
    topic: p.topic,
    subtopic: p.subtopic ?? null,
    title: p.title,
    question: p.question,
    sourceType: 'uploaded_past_paper',
    sourceFilename: jan ? JAN_FILE : JUL_FILE,
    sourcePage: p.page,
    sourceUrl: null,
    exam: {
      date: jan ? 'January 2023' : 'July 2023',
      year: 2023,
      type: jan ? 'Regular/Supplementary' : 'Supplementary',
      set: `Set ${p.set}`,
      questionNumber: p.qn,
      code: 'R2021011',
    },
    difficulty: p.difficulty ?? (p.marks >= 14 ? 'hard' : 'medium'),
    marks: p.marks,
    prerequisites: [],
    formulaReferences: p.formulas ?? [],
    solutionSteps: p.steps,
    finalAnswer: p.answer,
    verificationStatus: p.status ?? 'verified_symbolic',
    verificationNote: p.note ?? null,
    commonMistakes: p.mistakes ?? [],
    transcription: p.transcription ?? 'exact',
    transcriptionNote: p.tnote ?? null,
    groupKey: p.group ?? null,
  };
}

export const paperQuestions: Question[] = [
  // ======================= JANUARY 2023 — SET 1 (PDF pages 1–2) =======================
  q({
    file: 'jan', set: 1, qn: '1(a)', page: 1, marks: 7, unit: 1, topic: 'u1-stokes',
    title: "Stokes' theorem on a sphere–plane circle",
    question: r`Apply Stoke's theorem, to evaluate $\oint_C (y\,dx + z\,dy + x\,dz)$ where $C$ is the curve of intersection of the sphere $x^2+y^2+z^2=a^2$ and $x+z=a$.`,
    steps: [
      r`Stokes: $\oint_C \bar F\cdot d\bar r=\iint_S (\nabla\times\bar F)\cdot\hat n\,dS$ with $\bar F = y\,\bar i + z\,\bar j + x\,\bar k$.`,
      r`$\nabla\times\bar F=\begin{vmatrix}\bar i&\bar j&\bar k\\ \partial_x&\partial_y&\partial_z\\ y&z&x\end{vmatrix} = (0-1)\bar i-(1-0)\bar j+(0-1)\bar k = -\bar i-\bar j-\bar k.$`,
      r`Take $S$ = the flat disc cut from the plane $x+z=a$ (any surface bounded by $C$ works). Unit normal $\hat n=\dfrac{\bar i+\bar k}{\sqrt2}$.`,
      r`$(\nabla\times\bar F)\cdot\hat n = \dfrac{-1-1}{\sqrt2} = -\sqrt2$, a constant, so the integral is $-\sqrt2\times(\text{area of disc})$.`,
      r`Distance of the plane from the origin: $d=\dfrac{|0+0-a|}{\sqrt{1+1}}=\dfrac a{\sqrt2}$. Radius of the circle: $\rho^2=a^2-d^2=\dfrac{a^2}{2}$, so area $=\pi\rho^2=\dfrac{\pi a^2}{2}$.`,
      r`$\oint_C = -\sqrt2\cdot\dfrac{\pi a^2}{2} = -\dfrac{\pi a^2}{\sqrt2}$ (orientation of $C$ taken anticlockwise when viewed from the side the normal $\bar i+\bar k$ points to; the opposite orientation flips the sign).`,
      r`Check: parametrising the circle directly and integrating gives the same value (verified symbolically).`,
    ],
    answer: r`$\oint_C (y\,dx+z\,dy+x\,dz) = -\dfrac{\pi a^2}{\sqrt2}$`,
    mistakes: ['Using the sphere as S instead of the flat disc — legal but far harder.', 'Forgetting to normalise the normal vector.', 'Taking the sphere radius a as the circle radius.'],
    group: 'stokes',
  }),
  q({
    file: 'jan', set: 1, qn: '1(b)', page: 1, marks: 7, unit: 1, topic: 'u1-curl',
    title: 'Irrotational field and scalar potential',
    question: r`Show that the vector $(x^2-yz)\bar i+(y^2-zx)\bar j+(z^2-xy)\bar k$ is irrotational and find its scalar potential.`,
    steps: [
      r`$\nabla\times\bar F$: $\bar i$-component $=\partial_y(z^2-xy)-\partial_z(y^2-zx) = -x-(-x)=0$.`,
      r`$\bar j$-component $=\partial_z(x^2-yz)-\partial_x(z^2-xy) = -y-(-y)=0$; $\bar k$-component $=\partial_x(y^2-zx)-\partial_y(x^2-yz) = -z-(-z)=0$. Hence irrotational.`,
      r`Find $\phi$ with $\nabla\phi=\bar F$: $\phi_x = x^2-yz\Rightarrow \phi=\dfrac{x^3}{3}-xyz+g(y,z)$.`,
      r`$\phi_y=-xz+g_y = y^2-zx\Rightarrow g_y=y^2\Rightarrow g=\dfrac{y^3}{3}+h(z)$.`,
      r`$\phi_z=-xy+h'(z)=z^2-xy\Rightarrow h=\dfrac{z^3}{3}+C$.`,
    ],
    answer: r`$\nabla\times\bar F=\bar 0$ and $\phi=\dfrac{x^3+y^3+z^3}{3}-xyz+C$`,
    group: 'potential-x2-yz',
  }),
  q({
    file: 'jan', set: 1, qn: '2(a)', page: 1, marks: 7, unit: 1, topic: 'u1-surface',
    title: 'Flux through the plane x+y+z=1',
    question: r`Evaluate $\iint_S \bar F\cdot\bar n\,ds$ where $\bar F=12x^2y\,\bar i-3yz\,\bar j+2z\,\bar k$ and $S$ is the portion of the plane $x+y+z=1$ included in the first octant.`,
    steps: [
      r`Project $S$ onto the $xy$-plane: region $R: x\ge0,\ y\ge0,\ x+y\le1$. For $z=1-x-y$, $\bar n\,dS = (\bar i+\bar j+\bar k)\,dx\,dy$ (since $\hat n=\tfrac{1}{\sqrt3}(1,1,1)$ and $dS=\dfrac{dx\,dy}{|\hat n\cdot\bar k|}=\sqrt3\,dx\,dy$).`,
      r`$\bar F\cdot(1,1,1) = 12x^2y-3yz+2z$ with $z=1-x-y$.`,
      r`$I=\displaystyle\int_0^1\!\!\int_0^{1-x}\big[12x^2y-3y(1-x-y)+2(1-x-y)\big]dy\,dx$.`,
      r`Inner integrals: $\int_0^{1-x}12x^2y\,dy=6x^2(1-x)^2$; $\int_0^{1-x}3y(1-x-y)dy=\tfrac12(1-x)^3$; $\int_0^{1-x}2(1-x-y)dy=(1-x)^2$.`,
      r`$I=\int_0^1\big[6x^2(1-x)^2-\tfrac12(1-x)^3+(1-x)^2\big]dx = \tfrac{6}{30}-\tfrac18+\tfrac13 = \tfrac{49}{120}$.`,
    ],
    answer: r`$\iint_S\bar F\cdot\bar n\,ds=\dfrac{49}{120}$`,
    mistakes: ['Dividing by |n·k| but forgetting that the unnormalised normal (1,1,1) already absorbs it.', 'Not substituting z = 1 − x − y before integrating.'],
  }),
  q({
    file: 'jan', set: 1, qn: '2(b)', page: 1, marks: 7, unit: 1, topic: 'u1-div',
    title: 'Laplacian of rⁿ',
    question: r`Prove that $\nabla^2(r^n)=n(n+1)r^{n-2}$.`,
    steps: [
      r`$r^2=x^2+y^2+z^2\Rightarrow \dfrac{\partial r}{\partial x}=\dfrac{x}{r}$. Then $\dfrac{\partial}{\partial x}(r^n)=nr^{n-1}\dfrac{x}{r}=nr^{n-2}x$.`,
      r`$\dfrac{\partial^2}{\partial x^2}(r^n)=n\Big[r^{n-2}+x(n-2)r^{n-3}\dfrac{x}{r}\Big]=n\big[r^{n-2}+(n-2)r^{n-4}x^2\big]$.`,
      r`Add the three similar terms: $\nabla^2 r^n = n\big[3r^{n-2}+(n-2)r^{n-4}(x^2+y^2+z^2)\big]=n\big[3+(n-2)\big]r^{n-2}$.`,
      r`$=n(n+1)r^{n-2}$. $\blacksquare$`,
    ],
    answer: r`$\nabla^2(r^n)=n(n+1)r^{n-2}$ (proved)`,
    group: 'r-identities',
  }),
  q({
    file: 'jan', set: 1, qn: '3(a)', page: 1, marks: 9, unit: 2, topic: 'u2-ode',
    title: "x'' + 9x = sin t with a boundary value",
    question: r`Solve the differential equation $\dfrac{d^2x}{dt^2}+9x=\sin t$ using Laplace Transforms given that $x(0)=1,\ x'(0)=a,\ x(\pi/2)=1$.`,
    steps: [
      r`Take $L$: $s^2X-sx(0)-x'(0)+9X=\dfrac1{s^2+1}\Rightarrow (s^2+9)X = s+a+\dfrac{1}{s^2+1}$.`,
      r`$X=\dfrac{s}{s^2+9}+\dfrac{a}{s^2+9}+\dfrac{1}{(s^2+1)(s^2+9)}$, and $\dfrac{1}{(s^2+1)(s^2+9)}=\dfrac18\Big(\dfrac{1}{s^2+1}-\dfrac1{s^2+9}\Big)$.`,
      r`Invert: $x(t)=\cos3t+\dfrac a3\sin3t+\dfrac18\sin t-\dfrac1{24}\sin3t$.`,
      r`Use $x(\pi/2)=1$: $\cos\frac{3\pi}2=0,\ \sin\frac{3\pi}{2}=-1,\ \sin\frac\pi2=1$: $-\dfrac a3+\dfrac18+\dfrac1{24}=1\Rightarrow -\dfrac a3=\dfrac56\Rightarrow a=-\dfrac52$.`,
      r`Substitute: $x(t)=\cos3t-\dfrac56\sin3t-\dfrac1{24}\sin 3t+\dfrac18\sin t=\cos3t+\dfrac18\sin t-\dfrac78\sin3t$.`,
      r`Check: $x(0)=1$, $x(\pi/2)=0+\tfrac18+\tfrac78=1$ ✓, and $x''+9x=\sin t$ ✓.`,
    ],
    answer: r`$x(t)=\cos3t+\dfrac18(\sin t-7\sin3t)$, with $a=x'(0)=-\dfrac52$`,
    group: 'ode-x-9x-sint',
  }),
  q({
    file: 'jan', set: 1, qn: '3(b)', page: 1, marks: 5, unit: 2, topic: 'u2-step',
    title: 'Inverse transform with e^{-4s}',
    question: r`Find the inverse Laplace transform of $\dfrac{2+5s}{s^2e^{4s}}$.`,
    steps: [
      r`Rewrite: $\dfrac{2+5s}{s^2e^{4s}}=e^{-4s}\Big(\dfrac{2}{s^2}+\dfrac5s\Big)$.`,
      r`$L^{-1}\Big\{\dfrac2{s^2}+\dfrac5s\Big\}=2t+5=:g(t)$.`,
      r`Second shifting theorem: $L^{-1}\{e^{-as}G(s)\}=g(t-a)u(t-a)$ with $a=4$: $[2(t-4)+5]u(t-4)$.`,
    ],
    answer: r`$(2t-3)\,u(t-4)$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 1, qn: '4(a)', page: 1, marks: 7, unit: 2, topic: 'u2-ode',
    title: 'Fourth-order IVP y⁗ − 16y = 30 sin t',
    question: r`Solve using Laplace transforms $y^{(iv)}-16y=30\sin t$, given that $y(0)=0,\ y'(0)=-18,\ y''(\pi)=0,\ y'''(\pi)=-18$.`,
    transcription: 'exact_suspected_misprint',
    tnote: r`Transcribed exactly. The well-known textbook version of this problem has $y'(0)=2$ (giving the clean answer $2\sin2t-2\sin t$). With $y'(0)=-18$ as printed the answer is messy. Both are solved below; confirm with your teacher which was intended.`,
    steps: [
      r`Laplace transform with $y(0)=0$, $y'(0)=\alpha$, unknown $y''(0)=\beta$, $y'''(0)=\gamma$: $(s^4-16)Y=\alpha s^2+\beta s+\gamma+\dfrac{30}{s^2+1}$.`,
      r`$\dfrac{30}{(s^2+1)(s^4-16)}$ and the other terms invert to the general form $y=Ae^{2t}+Be^{-2t}+C\cos2t+D\sin2t-2\sin t$ (the particular part: $k\sin t$ gives $k-16k=30\Rightarrow k=-2$).`,
      r`**Standard reading** $y'(0)=2$: conditions $A+B+C=0$, $2A-2B+2D-2=2$, $4Ae^{2\pi}+4Be^{-2\pi}-4C=0$, $8Ae^{2\pi}-8Be^{-2\pi}-8D-2=-18$ give $A=B=C=0$, $D=2$.`,
      r`So $y=2\sin2t-2\sin t$. Check: $y(0)=0$, $y'(0)=4-2=2$, $y''(\pi)=0$, $y'''(\pi)=-16-2=-18$ ✓.`,
      r`**As printed** $y'(0)=-18$: solving the same four linear conditions gives $A=-\dfrac{5}{1+e^{2\pi}},\ B=\dfrac{5e^{2\pi}}{1+e^{2\pi}},\ C=-5\tanh\pi,\ D=-3$.`,
      r`i.e. $y=-\dfrac{5\sinh(2t-\pi)}{\cosh\pi}-5\tanh\pi\,\cos2t-3\sin2t-2\sin t$ (verified symbolically).`,
    ],
    answer: r`Standard reading ($y'(0)=2$): $y=2\sin2t-2\sin t$. As printed: $y=-\dfrac{5\sinh(2t-\pi)}{\cosh\pi}-5\tanh\pi\cos2t-3\sin2t-2\sin t$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 1, qn: '4(b)', page: 1, marks: 7, unit: 2, topic: 'u2-deriv-int',
    title: 'Transform of ∫(1−e^{−u})/u du',
    question: r`Find $L\Big\{\displaystyle\int_0^t\frac{1-e^{-u}}{u}\,du\Big\}$.`,
    steps: [
      r`$L\{1-e^{-t}\}=\dfrac1s-\dfrac1{s+1}$.`,
      r`Division by $t$: $L\Big\{\dfrac{f(t)}{t}\Big\}=\displaystyle\int_s^\infty F(u)\,du$: $\displaystyle\int_s^\infty\Big(\frac1u-\frac1{u+1}\Big)du=\Big[\log\frac{u}{u+1}\Big]_s^\infty=0-\log\frac{s}{s+1}=\log\frac{s+1}{s}$.`,
      r`Integral theorem: $L\Big\{\displaystyle\int_0^t g(u)du\Big\}=\dfrac{G(s)}{s}$.`,
    ],
    answer: r`$\dfrac1s\log\dfrac{s+1}{s}$`,
  }),
  q({
    file: 'jan', set: 1, qn: '5(a)', page: 1, marks: 7, unit: 3, topic: 'u3-euler',
    title: 'Triangular wave on (0, 2π)',
    question: r`Obtain the Fourier series for the function $f(x)=\begin{cases}x,&0\le x\le\pi\\ 2\pi-x,&\pi\le x\le2\pi\end{cases}$ and show that $\dfrac{\pi^2}{8}=\displaystyle\sum_{n=1}^{\infty}\frac{1}{(2n-1)^2}$.`,
    steps: [
      r`Euler's formulae on $(0,2\pi)$: $a_0=\frac1\pi\int_0^{2\pi}f,\ a_n=\frac1\pi\int_0^{2\pi}f\cos nx,\ b_n=\frac1\pi\int_0^{2\pi}f\sin nx$.`,
      r`$a_0=\frac1\pi\Big[\frac{\pi^2}2+\frac{\pi^2}2\Big]=\pi$.`,
      r`$a_n=\frac1\pi\Big[\int_0^\pi x\cos nx\,dx+\int_\pi^{2\pi}(2\pi-x)\cos nx\,dx\Big]=\frac1\pi\Big[\frac{(-1)^n-1}{n^2}+\frac{(-1)^n-1}{n^2}\Big]=\frac{2((-1)^n-1)}{\pi n^2}$, i.e. $-\frac{4}{\pi n^2}$ for odd $n$, $0$ for even $n$.`,
      r`$b_n=0$ (the two halves cancel; the function is symmetric about $x=\pi$).`,
      r`$f(x)=\dfrac\pi2-\dfrac4\pi\Big[\dfrac{\cos x}{1^2}+\dfrac{\cos3x}{3^2}+\dfrac{\cos5x}{5^2}+\cdots\Big]$.`,
      r`Put $x=0$ (continuous point, $f(0)=0$): $0=\dfrac\pi2-\dfrac4\pi\sum\dfrac1{(2n-1)^2}\Rightarrow\sum\dfrac{1}{(2n-1)^2}=\dfrac{\pi^2}{8}$.`,
    ],
    answer: r`$f(x)=\dfrac\pi2-\dfrac4\pi\displaystyle\sum_{n=1}^\infty\frac{\cos(2n-1)x}{(2n-1)^2}$; at $x=0$ this gives $\sum\frac1{(2n-1)^2}=\frac{\pi^2}8$`,
    group: 'pi2-over-8',
  }),
  q({
    file: 'jan', set: 1, qn: '5(b)', page: 1, marks: 7, unit: 3, topic: 'u3-integral',
    title: 'Fourier sine integral of e^{−ax} − e^{−bx}',
    question: r`Using Fourier integral show that $e^{-ax}-e^{-bx}=\dfrac{2(b^2-a^2)}{\pi}\displaystyle\int_0^\infty\frac{\lambda\sin\lambda x}{(\lambda^2+a^2)(\lambda^2+b^2)}\,d\lambda,\ (a,b>0)$.`,
    steps: [
      r`The right side contains $\sin\lambda x$, so use the Fourier sine integral: $f(x)=\dfrac2\pi\displaystyle\int_0^\infty\sin\lambda x\int_0^\infty f(t)\sin\lambda t\,dt\,d\lambda$ (for $x>0$).`,
      r`Standard integral: $\displaystyle\int_0^\infty e^{-at}\sin\lambda t\,dt=\frac{\lambda}{\lambda^2+a^2}$.`,
      r`So $\displaystyle\int_0^\infty(e^{-at}-e^{-bt})\sin\lambda t\,dt=\frac{\lambda}{\lambda^2+a^2}-\frac\lambda{\lambda^2+b^2}=\frac{\lambda(b^2-a^2)}{(\lambda^2+a^2)(\lambda^2+b^2)}$.`,
      r`Substitute: $e^{-ax}-e^{-bx}=\dfrac{2(b^2-a^2)}{\pi}\displaystyle\int_0^\infty\frac{\lambda\sin\lambda x}{(\lambda^2+a^2)(\lambda^2+b^2)}d\lambda$. $\blacksquare$`,
    ],
    answer: r`Identity established via the Fourier sine integral (valid for $x>0$)`,
  }),
  q({
    file: 'jan', set: 1, qn: '6(a)', page: 2, marks: 7, unit: 3, topic: 'u3-interval',
    title: 'Fourier series on (−1, 1), deduce Leibniz series',
    question: r`Find the Fourier series of the function $f(x)=\begin{cases}x,&-1<x<0\\x+2,&0<x<1\end{cases}$. And hence deduce that $1-\frac13+\frac15-\frac17+\cdots=\frac\pi4$.`,
    steps: [
      r`Interval $(-l,l)$ with $l=1$: $f(x)=\frac{a_0}2+\sum(a_n\cos n\pi x+b_n\sin n\pi x)$, $a_0=\int_{-1}^1f,\ a_n=\int_{-1}^1f\cos n\pi x,\ b_n=\int_{-1}^1f\sin n\pi x$.`,
      r`Write $f=x+2H$ where $H=1$ on $(0,1)$, $0$ on $(-1,0)$.`,
      r`$a_0=\int_{-1}^1x\,dx+2\int_0^1dx=0+2=2$.`,
      r`$a_n=\int_{-1}^1x\cos n\pi x\,dx+2\int_0^1\cos n\pi x\,dx=0+0=0$.`,
      r`$b_n=\int_{-1}^1x\sin n\pi x\,dx+2\int_0^1\sin n\pi x\,dx=\frac{2(-1)^{n+1}}{n\pi}+\frac{2(1-(-1)^n)}{n\pi}=\frac{2(1-2(-1)^n)}{n\pi}$.`,
      r`$f(x)=1+\dfrac2\pi\displaystyle\sum_{n=1}^\infty\frac{1-2(-1)^n}{n}\sin n\pi x$ (odd $n$: coefficient $\frac{6}{n\pi}$; even $n$: $-\frac{2}{n\pi}$).`,
      r`Put $x=\tfrac12$: $f=\tfrac52$; even-$n$ terms vanish since $\sin\frac{n\pi}2=0$. $\tfrac52=1+\dfrac6\pi\Big(1-\tfrac13+\tfrac15-\cdots\Big)\Rightarrow 1-\tfrac13+\tfrac15-\cdots=\dfrac\pi4$.`,
    ],
    answer: r`$f(x)=1+\dfrac{2}{\pi}\displaystyle\sum_{n\ge1}\frac{1-2(-1)^n}{n}\sin n\pi x$; at $x=\tfrac12$: $1-\tfrac13+\tfrac15-\cdots=\tfrac\pi4$`,
  }),
  q({
    file: 'jan', set: 1, qn: '6(b)', page: 2, marks: 7, unit: 3, topic: 'u3-integral',
    title: 'Fourier sine integral of a pulse',
    question: r`Express $f(x)=\begin{cases}1&\text{for }0\le x\le\pi\\0&\text{for }x>\pi\end{cases}$ as a Fourier sine integral and hence evaluate $\displaystyle\int_0^\infty\frac{1-\cos(\pi\lambda)}{\lambda}\sin x\lambda\,d\lambda$.`,
    steps: [
      r`Fourier sine integral: $f(x)=\dfrac2\pi\displaystyle\int_0^\infty\sin\lambda x\Big[\int_0^\infty f(t)\sin\lambda t\,dt\Big]d\lambda$.`,
      r`$\displaystyle\int_0^\pi\sin\lambda t\,dt=\frac{1-\cos\pi\lambda}{\lambda}$.`,
      r`So $f(x)=\dfrac2\pi\displaystyle\int_0^\infty\frac{1-\cos\pi\lambda}{\lambda}\sin x\lambda\,d\lambda$.`,
      r`Hence $\displaystyle\int_0^\infty\frac{1-\cos\pi\lambda}\lambda\sin x\lambda\,d\lambda=\frac\pi2f(x)$. At the jump $x=\pi$ the integral converges to the average $\frac12(1+0)$.`,
    ],
    answer: r`$\displaystyle\int_0^\infty\frac{1-\cos\pi\lambda}{\lambda}\sin x\lambda\,d\lambda=\begin{cases}\pi/2,&0<x<\pi\\ \pi/4,&x=\pi\\0,&x>\pi\end{cases}$`,
    group: 'fourier-integral-pulse',
  }),
  q({
    file: 'jan', set: 1, qn: '7(a)', page: 2, marks: 7, unit: 4, topic: 'u4-func',
    title: 'Eliminate f from f(xyz, x+y) = 0',
    question: r`Form the Partial differential equation from $f(xyz,\,x+y)=0$ by elimination of arbitrary function.`,
    steps: [
      r`For $f(u,v)=0$ the PDE is $Pp+Qq=R$ with $P=\dfrac{\partial(u,v)}{\partial(y,z)},\ Q=\dfrac{\partial(u,v)}{\partial(z,x)},\ R=\dfrac{\partial(u,v)}{\partial(x,y)}$. (Equivalently: differentiate $f(u,v)=0$ w.r.t. $x$ and $y$ and eliminate $f_u/f_v$.)`,
      r`$u=xyz$: $u_x=yz,\ u_y=xz,\ u_z=xy$. $v=x+y$: $v_x=1,\ v_y=1,\ v_z=0$.`,
      r`$P=u_yv_z-u_zv_y=0-xy=-xy$; $Q=u_zv_x-u_xv_z=xy-0=xy$; $R=u_xv_y-u_yv_x=yz-xz$.`,
      r`$-xy\,p+xy\,q=z(y-x)\Rightarrow xy(p-q)=z(x-y)$.`,
      r`Check: with $xyz=g(x+y)$, i.e. $z=g(x+y)/(xy)$, the PDE is satisfied (verified symbolically).`,
    ],
    answer: r`$xy(p-q)=z(x-y)$`,
  }),
  q({
    file: 'jan', set: 1, qn: '7(b)', page: 2, marks: 7, unit: 4, topic: 'u4-reducible',
    title: 'z²(p² + q²) = x² + y²',
    question: r`Solve $z^2(p^2+q^2)=x^2+y^2$.`,
    steps: [
      r`Rewrite: $(zp)^2-x^2=y^2-(zq)^2$. Put $Z=z^2$: $P=Z_x=2zp,\ Q=Z_y=2zq$, so $zp=\tfrac P2,\ zq=\tfrac Q2$.`,
      r`$\dfrac{P^2}{4}-x^2=y^2-\dfrac{Q^2}{4}$, i.e. $P^2-4x^2=4y^2-Q^2$: standard form $f(x,P)=g(y,Q)$.`,
      r`Set each side $=4a^2$: $P=2\sqrt{x^2+a^2},\ Q=2\sqrt{y^2-a^2}$.`,
      r`$dZ=P\,dx+Q\,dy\Rightarrow Z=2\int\sqrt{x^2+a^2}\,dx+2\int\sqrt{y^2-a^2}\,dy$.`,
      r`$z^2=x\sqrt{x^2+a^2}+a^2\sinh^{-1}\frac xa+y\sqrt{y^2-a^2}-a^2\cosh^{-1}\frac ya+c$.`,
    ],
    answer: r`$z^2=x\sqrt{x^2+a^2}+y\sqrt{y^2-a^2}+a^2\Big[\sinh^{-1}\dfrac xa-\cosh^{-1}\dfrac ya\Big]+c$`,
    note: 'Same problem is worked in the Unit 4 notes (PDF p. 40) with the same result.',
    group: 'z2p2q2',
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 1, qn: '8(a)', page: 2, marks: 7, unit: 4, topic: 'u4-func',
    title: 'Eliminate f from f(x+y+z, x²+y²+z²) = 0',
    question: r`Form the Partial differential equation from $f(x+y+z,\,x^2+y^2+z^2)=0$ by elimination of arbitrary function.`,
    steps: [
      r`$u=x+y+z,\ v=x^2+y^2+z^2$; $u_x=u_y=u_z=1$; $v_x=2x,v_y=2y,v_z=2z$.`,
      r`$P=u_yv_z-u_zv_y=2z-2y,\ Q=u_zv_x-u_xv_z=2x-2z,\ R=u_xv_y-u_yv_x=2y-2x$.`,
      r`$(z-y)p+(x-z)q=y-x$, i.e. $(y-z)p+(z-x)q=x-y$.`,
    ],
    answer: r`$(y-z)p+(z-x)q=x-y$`,
    group: 'f-sum-sumsq',
  }),
  q({
    file: 'jan', set: 1, qn: '8(b)', page: 2, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: '(xz)p − (yz)q = y² − x²',
    question: r`Solve $(xz)p-(yz)q=(y^2-x^2)$.`,
    steps: [
      r`Lagrange form $Pp+Qq=R$ with $P=xz,\ Q=-yz,\ R=y^2-x^2$. Auxiliary equations: $\dfrac{dx}{xz}=\dfrac{dy}{-yz}=\dfrac{dz}{y^2-x^2}$.`,
      r`First two: $\dfrac{dx}{x}=-\dfrac{dy}{y}\Rightarrow\log x+\log y=\log c_1\Rightarrow xy=c_1$.`,
      r`Multipliers $x,y,z$: $x(xz)+y(-yz)+z(y^2-x^2)=0$, so $x\,dx+y\,dy+z\,dz=0\Rightarrow x^2+y^2+z^2=c_2$.`,
      r`General solution $\phi(u,v)=0$.`,
    ],
    answer: r`$\phi\big(xy,\ x^2+y^2+z^2\big)=0$`,
  }),
  q({
    file: 'jan', set: 1, qn: '9(a)', page: 2, marks: 7, unit: 5, topic: 'u5-pi-exp',
    title: 'Third-order homogeneous PDE with sin(3x+2y)',
    question: r`Solve $\dfrac{\partial^3z}{\partial x^3}-4\dfrac{\partial^3z}{\partial z^2\partial y}+4\dfrac{\partial^3 z}{\partial x\partial y^2}=2\sin(3x+2y)$.`,
    transcription: 'exact_suspected_misprint',
    tnote: r`Printed as $\partial^3z/\partial z^2\partial y$, which is not meaningful; it is almost certainly $\partial^3z/\partial x^2\partial y$. The Unit 5 notes (PDF p. 9) solve the same left side with right side $6\sin(3x+2y)$.`,
    steps: [
      r`Symbolic form (reading $\partial x^2\partial y$): $(D^3-4D^2D'+4DD'^2)z=2\sin(3x+2y)$.`,
      r`A.E. ($D\to m$, $D'\to1$): $m^3-4m^2+4m=m(m-2)^2=0\Rightarrow m=0,2,2$.`,
      r`C.F. $=f_1(y)+f_2(y+2x)+x\,f_3(y+2x)$.`,
      r`P.I. (notes' method): $\dfrac{1}{f(D,D')}\phi(ax+by)=\dfrac1{f(a,b)}\displaystyle\iiint\phi(u)\,du\,du\,du$, $u=3x+2y$, $f(3,2)=27-72+48=3\ne0$.`,
      r`$\iiint\sin u = \int\!\!\int(-\cos u)=\int(-\sin u)=\cos u$. So P.I. $=\dfrac23\cos(3x+2y)$.`,
      r`Check: applying the operator to $\frac23\cos(3x+2y)$ returns $2\sin(3x+2y)$ ✓.`,
    ],
    answer: r`$z=f_1(y)+f_2(y+2x)+x f_3(y+2x)+\dfrac23\cos(3x+2y)$`,
  }),
  q({
    file: 'jan', set: 1, qn: '9(b)', page: 2, marks: 7, unit: 5, topic: 'u5-separation',
    title: 'Separation: 2u_t + 3u_x = 3u',
    question: r`By the method of separation of variables, find the solution of the P.D.E $2\dfrac{\partial u}{\partial t}+3\dfrac{\partial u}{\partial x}=3u,\ u(x,0)=4e^{-x}$.`,
    steps: [
      r`Assume $u=X(x)T(t)$: $2XT'+3X'T=3XT$. Divide by $XT$: $\dfrac{3X'}{X}=3-\dfrac{2T'}{T}=k$ (separation constant).`,
      r`$X'=\dfrac k3X\Rightarrow X=c_1e^{kx/3}$; $\dfrac{T'}{T}=\dfrac{3-k}{2}\Rightarrow T=c_2e^{(3-k)t/2}$.`,
      r`$u=Ce^{kx/3}e^{(3-k)t/2}$. At $t=0$: $Ce^{kx/3}=4e^{-x}\Rightarrow C=4,\ k=-3$.`,
      r`$u=4e^{-x}e^{3t}$. Check: $2u_t=6u$, $3u_x=-3u$, sum $=3u$ ✓.`,
    ],
    answer: r`$u(x,t)=4e^{-x+3t}$`,
    group: 'sep-first-order',
  }),
  q({
    file: 'jan', set: 1, qn: '10(a)', page: 2, marks: 7, unit: 5, topic: 'u5-separation',
    title: 'Separation: u_y + 2u = u_xx',
    question: r`Solve, using method of separation of variables, the P D E $\dfrac{\partial u}{\partial y}+2u=\dfrac{\partial^2u}{\partial x^2}$, given conditions are $u=0$ and $\dfrac{\partial u}{\partial x}=1+e^{-3y}$ when $x=0$ for all values of $y$.`,
    steps: [
      r`$u=X(x)Y(y)$: $XY'+2XY=X''Y\Rightarrow\dfrac{X''}{X}=\dfrac{Y'}{Y}+2=k$.`,
      r`$Y=e^{(k-2)y}$. The condition $u_x(0,y)=1+e^{-3y}$ needs two modes: $e^{0\cdot y}$ ($k=2$) and $e^{-3y}$ ($k=-1$). Superpose them.`,
      r`$k=2$: $X''=2X$, $X(0)=0\Rightarrow X=A\sinh\sqrt2x$; $X'(0)=\sqrt2A=1\Rightarrow A=\frac1{\sqrt2}$.`,
      r`$k=-1$: $X''=-X$, $X(0)=0\Rightarrow X=B\sin x$; $X'(0)=B=1$.`,
      r`$u=\dfrac{1}{\sqrt2}\sinh(\sqrt2x)+e^{-3y}\sin x$. Check: $u(0,y)=0$, $u_x(0,y)=\cosh0+e^{-3y}\cos0=1+e^{-3y}$ ✓; PDE ✓.`,
    ],
    answer: r`$u(x,y)=\dfrac{1}{\sqrt2}\sinh(\sqrt2\,x)+e^{-3y}\sin x$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 1, qn: '10(b)', page: 2, marks: 7, unit: 5, topic: 'u5-pi-exp',
    title: '(D − D′)² z = sin(2x+2y): double failure',
    question: r`Solve $\dfrac{\partial^2z}{\partial x^2}-2\dfrac{\partial^2z}{\partial x\partial y}+\dfrac{\partial^2z}{\partial y^2}=\sin(2x+2y)$.`,
    steps: [
      r`$(D^2-2DD'+D'^2)z=\sin(2x+2y)$. A.E. $(m-1)^2=0\Rightarrow m=1,1$; C.F. $=f_1(y+x)+xf_2(y+x)$.`,
      r`P.I.: $f(a,b)=f(2,2)=4-8+4=0$ — case of failure.`,
      r`Failure rule (notes): multiply by $x$ and differentiate the denominator w.r.t. $D$: $x\cdot\dfrac{1}{2D-2D'}\sin(2x+2y)$; again $2a-2b=0$, fail again.`,
      r`Second time: $x^2\cdot\dfrac{1}{2}\sin(2x+2y)$.`,
      r`P.I. $=\dfrac{x^2}{2}\sin(2x+2y)$ (check: substituting gives $\sin(2x+2y)$ ✓).`,
    ],
    answer: r`$z=f_1(y+x)+xf_2(y+x)+\dfrac{x^2}{2}\sin(2x+2y)$`,
  }),

  // ======================= JANUARY 2023 — SET 2 (PDF pages 3–4) =======================
  q({
    file: 'jan', set: 2, qn: '1(a)', page: 3, marks: 7, unit: 1, topic: 'u1-stokes',
    title: "Verify Stokes' theorem on the upper hemisphere",
    question: r`State Stoke's theorem and Verify Stoke's theorem for $\bar F=(2x-y)\bar i-yz^2\bar j-y^2z\bar k$ over the upper half surface of the sphere $x^2+y^2+z^2=1$ bounded by the projection of the $xy$ plane.`,
    steps: [
      r`Statement: if $S$ is an open orientable surface bounded by a simple closed curve $C$, then $\oint_C\bar F\cdot d\bar r=\iint_S(\nabla\times\bar F)\cdot\hat n\,dS$, with $C$ traversed anticlockwise relative to $\hat n$.`,
      r`Line side: $C$ is $x=\cos t,\ y=\sin t,\ z=0$, $0\le t\le2\pi$. On $C$, $z=0$ so $\bar F\cdot d\bar r=(2x-y)dx=(2\cos t-\sin t)(-\sin t)dt$.`,
      r`$\displaystyle\int_0^{2\pi}(-2\sin t\cos t+\sin^2t)dt=0+\pi=\pi$.`,
      r`Surface side: $\nabla\times\bar F=\begin{vmatrix}\bar i&\bar j&\bar k\\\partial_x&\partial_y&\partial_z\\2x-y&-yz^2&-y^2z\end{vmatrix}=(-2yz+2yz)\bar i-(0-0)\bar j+(0+1)\bar k=\bar k$.`,
      r`$\iint_S\bar k\cdot\hat n\,dS=\iint_R dx\,dy$ (projection on $xy$-plane) $=\pi(1)^2=\pi$.`,
      r`Both sides equal $\pi$, so the theorem is verified.`,
    ],
    answer: r`Both sides $=\pi$; Stokes' theorem verified`,
    note: 'Verified in scripts/verify_math.py (U1 Stokes checks).',
    group: 'stokes',
  }),
  q({
    file: 'jan', set: 2, qn: '1(b)', page: 3, marks: 7, unit: 1, topic: 'u1-line',
    title: 'Work done along a straight line',
    question: r`Find the work done in moving a particle in the force field $\bar F=3x^2\bar i+(2xz-y)\bar j+z\bar k$ along the straight line from (0,0,0) to (2,1,3).`,
    steps: [
      r`Line: $x=2t,\ y=t,\ z=3t$, $0\le t\le1$; $dx=2dt,\ dy=dt,\ dz=3dt$.`,
      r`$\bar F\cdot d\bar r=3(2t)^2(2dt)+(2\cdot2t\cdot3t-t)dt+3t(3dt)=(24t^2+12t^2-t+9t)dt=(36t^2+8t)dt$.`,
      r`$W=\int_0^1(36t^2+8t)dt=12+4=16$.`,
    ],
    answer: r`$W=16$ units`,
    note: 'Verified in scripts/verify_math.py ("U1 work straight line = 16").',
    group: 'work-3x2',
  }),
  q({
    file: 'jan', set: 2, qn: '2(a)', page: 3, marks: 7, unit: 1, topic: 'u1-green',
    title: "Green's theorem between y = x and y = x²",
    question: r`Evaluate by using Green's theorem for $\int_c[(xy+y^2)dx+x^2dy]$, where $C$ is bounded by $y=x$ and $y=x^2$.`,
    steps: [
      r`Green: $\oint_C(M\,dx+N\,dy)=\iint_R\Big(\dfrac{\partial N}{\partial x}-\dfrac{\partial M}{\partial y}\Big)dx\,dy$ with $M=xy+y^2,\ N=x^2$.`,
      r`$N_x-M_y=2x-(x+2y)=x-2y$.`,
      r`Region: $0\le x\le1$, $x^2\le y\le x$ (the curves meet at $(0,0),(1,1)$).`,
      r`$\displaystyle\int_0^1\int_{x^2}^x(x-2y)dy\,dx=\int_0^1\big[xy-y^2\big]_{x^2}^{x}dx=\int_0^1(x^4-x^3)dx=\frac15-\frac14=-\frac1{20}$.`,
      r`Direct line-integral evaluation along both arcs also gives $-\frac1{20}$ (verified).`,
    ],
    answer: r`$-\dfrac{1}{20}$`,
    note: 'Verified in scripts/verify_math.py ("U1 Green -1/20").',
  }),
  q({
    file: 'jan', set: 2, qn: '2(b)', page: 3, marks: 7, unit: 1, topic: 'u1-div',
    title: '∇[∇·(r/r)] = −2r/r³',
    question: r`Prove that $\nabla\Big[\nabla\cdot\dfrac{\bar r}{r}\Big]=\dfrac{-2}{r^3}\bar r$ where $\bar r=x\bar i+y\bar j+z\bar k$.`,
    steps: [
      r`$\nabla\cdot(\phi\bar r)=\nabla\phi\cdot\bar r+\phi\,\nabla\cdot\bar r$ with $\phi=r^{-1}$: $\nabla r^{-1}=-r^{-3}\bar r$ and $\nabla\cdot\bar r=3$.`,
      r`$\nabla\cdot\dfrac{\bar r}{r}=-\dfrac{\bar r\cdot\bar r}{r^3}+\dfrac3r=-\dfrac1r+\dfrac3r=\dfrac2r$.`,
      r`$\nabla\Big(\dfrac2r\Big)=2\Big(-\dfrac{1}{r^2}\Big)\nabla r=-\dfrac2{r^2}\cdot\dfrac{\bar r}{r}=-\dfrac{2}{r^3}\bar r$. $\blacksquare$`,
    ],
    answer: r`$\nabla\big[\nabla\cdot(\bar r/r)\big]=-\dfrac{2\bar r}{r^3}$ (proved)`,
    group: 'r-identities',
  }),
  q({
    file: 'jan', set: 2, qn: '3(a)', page: 3, marks: 7, unit: 2, topic: 'u2-ode',
    title: "y'' + y = 2eᵗ",
    question: r`Solve using the Laplace transform technique $y''+y=2e^t,\ y(0)=0,\ y'(0)=2$.`,
    steps: [
      r`$s^2Y-sy(0)-y'(0)+Y=\dfrac{2}{s-1}\Rightarrow(s^2+1)Y=2+\dfrac2{s-1}$.`,
      r`$Y=\dfrac{2}{s^2+1}+\dfrac{2}{(s-1)(s^2+1)}$, and $\dfrac{2}{(s-1)(s^2+1)}=\dfrac1{s-1}-\dfrac{s+1}{s^2+1}$.`,
      r`$Y=\dfrac1{s-1}-\dfrac{s}{s^2+1}+\dfrac{1}{s^2+1}$.`,
      r`$y=e^t-\cos t+\sin t$. Check: $y(0)=0$, $y'(0)=1+1=2$ ✓.`,
    ],
    answer: r`$y=e^t-\cos t+\sin t$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 2, qn: '3(b)', page: 3, marks: 7, unit: 2, topic: 'u2-tmul',
    title: 'L{t ∫₀ᵗ e^{−u} sin 2u du}',
    question: r`Evaluate $L\Big\{t\displaystyle\int_0^te^{-u}\sin2u\,du\Big\}$.`,
    steps: [
      r`$L\{\sin2t\}=\dfrac{2}{s^2+4}$; first shift: $L\{e^{-t}\sin2t\}=\dfrac{2}{(s+1)^2+4}=\dfrac2{s^2+2s+5}$.`,
      r`Integral: $L\Big\{\int_0^te^{-u}\sin2u\,du\Big\}=\dfrac{2}{s(s^2+2s+5)}=\dfrac{2}{s^3+2s^2+5s}$.`,
      r`Multiply by $t$: $L\{tg(t)\}=-\dfrac{d}{ds}G(s)=\dfrac{2(3s^2+4s+5)}{(s^3+2s^2+5s)^2}$.`,
    ],
    answer: r`$\dfrac{2(3s^2+4s+5)}{s^2(s^2+2s+5)^2}$`,
  }),
  q({
    file: 'jan', set: 2, qn: '4(a)', page: 3, marks: 7, unit: 2, topic: 'u2-ode',
    title: '(D² + 3D + 2)y = 3',
    question: r`Using Laplace transform solve $(D^2+3D+2)y=3,\ y(0)=y'(0)=1$.`,
    steps: [
      r`$(s^2Y-s-1)+3(sY-1)+2Y=\dfrac3s\Rightarrow(s^2+3s+2)Y=s+4+\dfrac3s=\dfrac{s^2+4s+3}{s}$.`,
      r`$s^2+4s+3=(s+1)(s+3)$ and $s^2+3s+2=(s+1)(s+2)$, so $Y=\dfrac{s+3}{s(s+2)}=\dfrac{3/2}{s}-\dfrac{1/2}{s+2}$.`,
      r`$y=\dfrac32-\dfrac12e^{-2t}$. Check: $y(0)=1$, $y'(0)=1$, $y''+3y'+2y=-2e^{-2t}+3e^{-2t}+3-e^{-2t}=3$ ✓.`,
    ],
    answer: r`$y=\dfrac32-\dfrac12e^{-2t}$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 2, qn: '4(b)', page: 3, marks: 7, unit: 2, topic: 'u2-tmul',
    title: '∫₀^∞ e^{−at} sin²t / t dt',
    question: r`Using Laplace transform evaluate $\displaystyle\int_0^\infty\frac{e^{-at}\sin^2t}{t}\,dt$.`,
    steps: [
      r`$\sin^2t=\frac12(1-\cos2t)\Rightarrow L\{\sin^2t\}=\dfrac12\Big(\dfrac1s-\dfrac{s}{s^2+4}\Big)$.`,
      r`$L\Big\{\dfrac{\sin^2t}{t}\Big\}=\displaystyle\int_s^\infty\frac12\Big(\frac1u-\frac{u}{u^2+4}\Big)du=\frac12\Big[\log\frac{u}{\sqrt{u^2+4}}\Big]_s^\infty=\frac14\log\frac{s^2+4}{s^2}$.`,
      r`The required integral is this transform at $s=a$.`,
    ],
    answer: r`$\dfrac14\log\Big(\dfrac{a^2+4}{a^2}\Big)$`,
  }),
  q({
    file: 'jan', set: 2, qn: '5(a)', page: 3, marks: 7, unit: 3, topic: 'u3-evenodd',
    title: 'Odd function x ± π',
    question: r`Is the function defined as $f(x)=\begin{cases}x+\pi,&0\le x\le\pi\\x-\pi,&-\pi<x\le0\end{cases}$ even or odd? If $f(x+2\pi)=f(x)$, find its Fourier series expansion.`,
    steps: [
      r`For $0<x<\pi$: $f(-x)=-x-\pi=-(x+\pi)=-f(x)$. So $f$ is **odd** (away from the jump at 0).`,
      r`Hence $a_0=a_n=0$ and $b_n=\dfrac2\pi\displaystyle\int_0^\pi(x+\pi)\sin nx\,dx$.`,
      r`$\int_0^\pi x\sin nx\,dx=\dfrac{\pi(-1)^{n+1}}{n}$, $\int_0^\pi\pi\sin nx\,dx=\dfrac{\pi(1-(-1)^n)}{n}$.`,
      r`$b_n=\dfrac2\pi\cdot\dfrac{\pi}{n}\big[(-1)^{n+1}+1-(-1)^n\big]=\dfrac{2(1-2(-1)^n)}{n}$.`,
      r`$f(x)=\displaystyle\sum_{n=1}^\infty\frac{2(1-2(-1)^n)}{n}\sin nx=6\sin x-\sin2x+2\sin3x-\tfrac12\sin4x+\cdots$`,
    ],
    answer: r`Odd; $f(x)=\displaystyle\sum_{n\ge1}\frac{2\big(1-2(-1)^n\big)}{n}\sin nx$`,
  }),
  q({
    file: 'jan', set: 2, qn: '5(b)', page: 3, marks: 7, unit: 3, topic: 'u3-ft',
    title: 'Fourier transform of 1 − x² and a deduced integral',
    question: r`Find the Fourier transform of $f(x)=\begin{cases}1-x^2,&|x|\le1\\0,&|x|>1\end{cases}$ and hence evaluate $\displaystyle\int_0^\infty\frac{x\cos x-\sin x}{x^3}\cos\frac x2\,dx$.`,
    steps: [
      r`Convention (as defined in the Unit 3 notes, p. 26): $F(p)=\int_{-\infty}^\infty f(x)e^{ipx}dx$, $f(x)=\frac1{2\pi}\int F(p)e^{-ipx}dp$.`,
      r`$f$ is even, so $F(p)=2\int_0^1(1-x^2)\cos px\,dx$. Integrating by parts: $=\dfrac{4(\sin p-p\cos p)}{p^3}$.`,
      r`Inversion: $f(x)=\dfrac1{2\pi}\displaystyle\int_{-\infty}^\infty\frac{4(\sin p-p\cos p)}{p^3}e^{-ipx}dp=\frac{4}{\pi}\int_0^\infty\frac{\sin p-p\cos p}{p^3}\cos px\,dp$.`,
      r`Put $x=\tfrac12$: $f(\tfrac12)=\tfrac34$, so $\displaystyle\int_0^\infty\frac{\sin p-p\cos p}{p^3}\cos\frac p2dp=\frac{3\pi}{16}$.`,
      r`The asked integrand has the opposite sign: $\displaystyle\int_0^\infty\frac{x\cos x-\sin x}{x^3}\cos\frac x2dx=-\frac{3\pi}{16}$.`,
    ],
    answer: r`$F(p)=\dfrac{4(\sin p-p\cos p)}{p^3}$; integral $=-\dfrac{3\pi}{16}$`,
    note: 'Verified in scripts/verify_math.py (FT 1−x² and numeric check of −3π/16).',
    group: 'ft-1-x2',
  }),
  q({
    file: 'jan', set: 2, qn: '6(a)', page: 4, marks: 7, unit: 3, topic: 'u3-halfrange',
    title: 'Half-range cosine series of x(2 − x)',
    question: r`Find the half range cosine series of $f(x)=x(2-x)$ in $0\le x\le2$.`,
    steps: [
      r`Half-range cosine on $(0,l)$, $l=2$: $a_0=\frac2l\int_0^lf=\int_0^2(2x-x^2)dx=4-\frac83=\frac43$.`,
      r`$a_n=\int_0^2(2x-x^2)\cos\frac{n\pi x}{2}dx=-\dfrac{8(1+(-1)^n)}{n^2\pi^2}$: zero for odd $n$, $-\dfrac{16}{n^2\pi^2}$ for even $n$.`,
      r`With $n=2m$: $a_{2m}=-\dfrac{4}{m^2\pi^2}$.`,
      r`$f(x)=\dfrac23-\dfrac4{\pi^2}\displaystyle\sum_{m=1}^\infty\frac{\cos m\pi x}{m^2}$.`,
    ],
    answer: r`$x(2-x)=\dfrac23-\dfrac{4}{\pi^2}\displaystyle\sum_{m=1}^\infty\frac{\cos m\pi x}{m^2},\ 0\le x\le2$`,
  }),
  q({
    file: 'jan', set: 2, qn: '6(b)', page: 4, marks: 7, unit: 3, topic: 'u3-ft',
    title: 'Fourier transform of e^{−x²/2}',
    question: r`Find the Fourier transform of $f(x)=e^{-x^2/2},\ -\infty<x<\infty$.`,
    steps: [
      r`$F(p)=\int_{-\infty}^\infty e^{-x^2/2}e^{ipx}dx$ (notes' convention). Complete the square: $-\tfrac12x^2+ipx=-\tfrac12(x-ip)^2-\tfrac{p^2}2$.`,
      r`$F(p)=e^{-p^2/2}\int_{-\infty}^\infty e^{-(x-ip)^2/2}dx=e^{-p^2/2}\sqrt{2\pi}$ (Gaussian integral; the shift of contour is justified for this entire function).`,
      r`With the symmetric convention $\frac1{\sqrt{2\pi}}\int f e^{ipx}dx$ the transform is $e^{-p^2/2}$: the function is its own transform ("self-reciprocal"), as stated in the notes (p. 30).`,
    ],
    answer: r`$F(p)=\sqrt{2\pi}\,e^{-p^2/2}$ (or $e^{-p^2/2}$ with the $1/\sqrt{2\pi}$ convention)`,
  }),
  q({
    file: 'jan', set: 2, qn: '7(a)', page: 4, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: '(x² − y² − yz)p + (x² − y² − zx)q = z(x − y)',
    question: r`Solve $(x^2-y^2-yz)p+(x^2-y^2-zx)q=z(x-y)$.`,
    steps: [
      r`A.E.: $\dfrac{dx}{x^2-y^2-yz}=\dfrac{dy}{x^2-y^2-zx}=\dfrac{dz}{z(x-y)}$.`,
      r`Multipliers $1,-1,0$: denominator $(x^2-y^2-yz)-(x^2-y^2-zx)=z(x-y)$. So $\dfrac{dx-dy}{z(x-y)}=\dfrac{dz}{z(x-y)}\Rightarrow dx-dy=dz\Rightarrow x-y-z=c_1$.`,
      r`Multipliers $x,-y,0$: denominator $=x^3-xy^2-x^2y+y^3=(x-y)^2(x+y)$. So $\dfrac{x\,dx-y\,dy}{(x-y)^2(x+y)}=\dfrac{dz}{z(x-y)}$.`,
      r`Multiply by $(x-y)$: $\dfrac{x\,dx-y\,dy}{x^2-y^2}=\dfrac{dz}{z}\Rightarrow\tfrac12\log(x^2-y^2)=\log z+\text{const}\Rightarrow\dfrac{x^2-y^2}{z^2}=c_2$.`,
    ],
    answer: r`$\phi\Big(x-y-z,\ \dfrac{x^2-y^2}{z^2}\Big)=0$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 2, qn: '7(b)', page: 4, marks: 7, unit: 4, topic: 'u4-func',
    title: 'Eliminate f, g from z = y f(x) + x g(y)',
    question: r`Form partial differential equation by eliminating the arbitrary function $f(x)$ and $g(x)$ from $z=yf(x)+xg(y)$.`,
    tnote: r`Printed "$g(x)$" in the instruction but $g(y)$ in the equation; the equation is used as written.`,
    steps: [
      r`$p=yf'(x)+g(y)$, $q=f(x)+xg'(y)$, $s=\dfrac{\partial^2z}{\partial x\partial y}=f'(x)+g'(y)$.`,
      r`$px+qy=xyf'(x)+xg(y)+yf(x)+xyg'(y)=xy\big(f'(x)+g'(y)\big)+\big(yf(x)+xg(y)\big)$.`,
      r`$=xys+z$.`,
    ],
    answer: r`$px+qy=xy\,s+z$, i.e. $x\dfrac{\partial z}{\partial x}+y\dfrac{\partial z}{\partial y}=xy\dfrac{\partial^2z}{\partial x\partial y}+z$`,
    note: 'Same example is worked in the Unit 4 notes (PDF p. 18).',
  }),
  q({
    file: 'jan', set: 2, qn: '8(a)', page: 4, marks: 7, unit: 4, topic: 'u4-reducible',
    title: 'q²y² = z(z − px)',
    question: r`Solve $q^2y^2=z(z-px)$.`,
    steps: [
      r`Put $X=\log x,\ Y=\log y$: $px=\dfrac{\partial z}{\partial X}=P,\ qy=\dfrac{\partial z}{\partial Y}=Q$. Equation: $Q^2=z(z-P)$, of type $f(z,P,Q)=0$.`,
      r`Let $z=F(u)$, $u=X+aY$: $P=z',\ Q=az'$. Then $a^2z'^2+zz'-z^2=0$.`,
      r`Quadratic in $z'$: $z'=kz$ with $a^2k^2+k-1=0$, i.e. $k=\dfrac{-1\pm\sqrt{1+4a^2}}{2a^2}$.`,
      r`$\dfrac{dz}{z}=k\,du\Rightarrow\log z=k(X+aY)+c=k(\log x+a\log y)+c$.`,
    ],
    answer: r`$\log z=\dfrac{-1\pm\sqrt{1+4a^2}}{2a^2}\,(\log x+a\log y)+c$, i.e. $z=C\,x^{k}y^{ak}$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 2, qn: '8(b)', page: 4, marks: 7, unit: 4, topic: 'u4-func',
    title: 'Eliminate f from f(x+y+z, x²+y²+z²) = 0',
    question: r`Form the Partial differential equation from $f(x+y+z,\,x^2+y^2+z^2)=0$.`,
    steps: [
      r`Identical to January 2023 Set 1 Q8(a): $P=2(z-y),\ Q=2(x-z),\ R=2(y-x)$.`,
      r`$(y-z)p+(z-x)q=x-y$.`,
    ],
    answer: r`$(y-z)p+(z-x)q=x-y$`,
    group: 'f-sum-sumsq',
  }),
  q({
    file: 'jan', set: 2, qn: '9(a)', page: 4, marks: 14, unit: 5, topic: 'u5-wave',
    title: 'Wave equation: triangular deflection',
    question: r`Find the solution of the wave equation $\dfrac{\partial^2u}{\partial t^2}=c^2\dfrac{\partial^2u}{\partial x^2}$ corresponding to the triangular initial deflection $f(x)=\begin{cases}\frac{2k}{l}x,&0<x<\frac l2\\\frac{2k}{l}(l-x),&\frac l2<x<l\end{cases}$ and zero initial velocity.`,
    tnote: 'End conditions u(0,t) = u(l,t) = 0 (string fixed at both ends) are implied, not printed.',
    steps: [
      r`Boundary conditions $u(0,t)=u(l,t)=0$; initial $u(x,0)=f(x)$, $u_t(x,0)=0$.`,
      r`Separation $u=XT$ with $X''/X=T''/(c^2T)=-\lambda^2$ (the negative constant is the only one giving non-trivial solutions vanishing at both ends): $X=\sin\frac{n\pi x}{l}$, $T=A_n\cos\frac{n\pi ct}{l}+B_n\sin\frac{n\pi ct}{l}$.`,
      r`$u_t(x,0)=0\Rightarrow B_n=0$. So $u=\sum A_n\sin\frac{n\pi x}{l}\cos\frac{n\pi ct}{l}$ with $A_n=\frac2l\int_0^lf(x)\sin\frac{n\pi x}{l}dx$.`,
      r`$A_n=\dfrac2l\Big[\displaystyle\int_0^{l/2}\frac{2kx}{l}\sin\frac{n\pi x}{l}dx+\int_{l/2}^l\frac{2k(l-x)}{l}\sin\frac{n\pi x}ldx\Big]=\dfrac{8k}{n^2\pi^2}\sin\dfrac{n\pi}2$.`,
      r`Even $n$ vanish; odd $n=2m-1$: $\sin\frac{(2m-1)\pi}{2}=(-1)^{m+1}$.`,
    ],
    answer: r`$u(x,t)=\dfrac{8k}{\pi^2}\displaystyle\sum_{m=1}^\infty\frac{(-1)^{m+1}}{(2m-1)^2}\sin\frac{(2m-1)\pi x}{l}\cos\frac{(2m-1)\pi ct}{l}$`,
    note: 'Not covered in the uploaded Unit 5 notes; standard method shown. Coefficient A_n verified symbolically.',
    group: 'triangular-string',
  }),
  q({
    file: 'jan', set: 2, qn: '10(a)', page: 4, marks: 14, unit: 5, topic: 'u5-heat',
    title: 'Heat equation with triangular initial temperature',
    question: r`Solve the partial differential equation $\dfrac{\partial u}{\partial t}=a^2\dfrac{\partial^2u}{\partial x^2},\ 0<x<l$, which satisfies the conditions, $u(0,t)=0,\ u(l,t)=0$ for $t>0$, $u(x,0)=\begin{cases}x,&0<x<\frac l2\\l-x,&\frac l2<x<l\end{cases}$`,
    steps: [
      r`Separation with decaying time factor: $u=\sum b_n\sin\frac{n\pi x}{l}e^{-a^2n^2\pi^2t/l^2}$ (satisfies both end conditions).`,
      r`$t=0$: $\sum b_n\sin\frac{n\pi x}{l}=f(x)$ ⇒ half-range sine coefficients $b_n=\frac2l\int_0^lf\sin\frac{n\pi x}{l}dx$.`,
      r`$b_n=\frac2l\Big[\int_0^{l/2}x\sin\frac{n\pi x}ldx+\int_{l/2}^l(l-x)\sin\frac{n\pi x}ldx\Big]=\dfrac{4l}{n^2\pi^2}\sin\dfrac{n\pi}{2}$.`,
    ],
    answer: r`$u(x,t)=\dfrac{4l}{\pi^2}\displaystyle\sum_{n=1}^\infty\frac{\sin(n\pi/2)}{n^2}\sin\frac{n\pi x}{l}\,e^{-a^2n^2\pi^2t/l^2}$`,
    note: 'Not covered in the uploaded Unit 5 notes; standard method shown. b_n verified symbolically.',
  }),

  // ======================= JANUARY 2023 — SET 3 (PDF pages 5–6) =======================
  q({
    file: 'jan', set: 3, qn: '1(a)', page: 5, marks: 7, unit: 1, topic: 'u1-grad',
    title: 'Directional derivative along PQ',
    question: r`Find the directional derivative of the function $f=x^2-y^2+2z^2$ at the point $P=(1,2,3)$ in the direction of the line $PQ$ where $Q=(5,0,4)$.`,
    steps: [
      r`$\nabla f=2x\,\bar i-2y\,\bar j+4z\,\bar k$; at $P$: $2\bar i-4\bar j+12\bar k$.`,
      r`$\overline{PQ}=Q-P=(4,-2,1)$, $|\overline{PQ}|=\sqrt{21}$, unit vector $\hat a=\frac{1}{\sqrt{21}}(4,-2,1)$.`,
      r`D.D. $=\nabla f\cdot\hat a=\dfrac{8+8+12}{\sqrt{21}}=\dfrac{28}{\sqrt{21}}=\dfrac{4\sqrt{21}}{3}$.`,
    ],
    answer: r`$\dfrac{28}{\sqrt{21}}=\dfrac{4\sqrt{21}}3\approx6.11$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 3, qn: '1(b)', page: 5, marks: 7, unit: 1, topic: 'u1-gauss',
    title: 'Closed cylinder via divergence theorem',
    question: r`By transforming into triple integral, evaluate $\iint x^3dydz+x^2y\,dzdx+x^2z\,dxdy$ where $S$ is the closed surface consisting of the cylinder $x^2+y^2=a^2$ and the circular discs $z=0,\ z=b$.`,
    steps: [
      r`This is $\iint_S\bar F\cdot\hat n\,dS$ with $\bar F=(x^3,\ x^2y,\ x^2z)$. Gauss: $=\iiint_V\nabla\cdot\bar F\,dV$.`,
      r`$\nabla\cdot\bar F=3x^2+x^2+x^2=5x^2$.`,
      r`Cylindrical coordinates: $\iiint5x^2dV=5\int_0^b\!\!\int_0^{2\pi}\!\!\int_0^a\rho^2\cos^2\theta\,\rho\,d\rho\,d\theta\,dz=5\cdot b\cdot\pi\cdot\frac{a^4}4$.`,
    ],
    answer: r`$\dfrac54\pi a^4b$`,
  }),
  q({
    file: 'jan', set: 3, qn: '2(a)', page: 5, marks: 7, unit: 1, topic: 'u1-surface',
    title: 'Flux through a quarter cylinder',
    question: r`Evaluate $\int\bar F\cdot\bar n\,ds$ where $\bar F=z\bar i+x\bar j-3y^2z\bar k$ and $S$ is the surface $x^2+y^2=16$ included in the first octant between $z=0$ and $z=5$.`,
    steps: [
      r`On the cylinder $\hat n=\dfrac{x\bar i+y\bar j}{4}$, so $\bar F\cdot\hat n=\dfrac{xz+xy}{4}$ (the $\bar k$-part does not contribute).`,
      r`Parametrise $x=4\cos\theta,\ y=4\sin\theta$, $dS=4\,d\theta\,dz$, $0\le\theta\le\frac\pi2$, $0\le z\le5$.`,
      r`$\iint\frac{xz+xy}{4}dS=\int_0^5\!\!\int_0^{\pi/2}(4z\cos\theta+16\sin\theta\cos\theta)\,d\theta\,dz=\int_0^5(4z+8)dz=50+40$.`,
    ],
    answer: r`$90$`,
    note: 'Verified in scripts/verify_math.py ("U1 flux cylinder = 90").',
  }),
  q({
    file: 'jan', set: 3, qn: '2(b)', page: 5, marks: 7, unit: 1, topic: 'u1-green',
    title: "Green's theorem over a triangle",
    question: r`State Green's theorem. Evaluate by Green's theorem $\oint_c(y-\sin x)dx+\cos x\,dy$ where $C$ is the triangle enclosed by the lines $y=0,\ x=\frac\pi2,\ \pi y=2x$.`,
    steps: [
      r`Green: if $M,N$ and their partials are continuous on a region $R$ bounded by a closed curve $C$ (anticlockwise), $\oint_C M\,dx+N\,dy=\iint_R(N_x-M_y)\,dx\,dy$.`,
      r`$M=y-\sin x,\ N=\cos x$: $N_x-M_y=-\sin x-1$.`,
      r`Region: $0\le x\le\frac\pi2$, $0\le y\le\frac{2x}\pi$.`,
      r`$\displaystyle\int_0^{\pi/2}(-\sin x-1)\frac{2x}{\pi}dx=-\frac2\pi\Big[\int_0^{\pi/2}x\sin x\,dx+\int_0^{\pi/2}x\,dx\Big]=-\frac2\pi\Big[1+\frac{\pi^2}8\Big]$.`,
    ],
    answer: r`$-\Big(\dfrac2\pi+\dfrac\pi4\Big)$`,
  }),
  q({
    file: 'jan', set: 3, qn: '3(a)', page: 5, marks: 7, unit: 2, topic: 'u2-conv',
    title: 'Convolution: 1/((s²+4)(s+1)²)',
    question: r`Use convolution theorem to find inverse LaPlace transform of $\dfrac{1}{(s^2+4)(s+1)^2}$.`,
    steps: [
      r`$F=\dfrac1{s^2+4}\leftrightarrow f=\dfrac12\sin2t$; $G=\dfrac1{(s+1)^2}\leftrightarrow g=te^{-t}$.`,
      r`$L^{-1}\{FG\}=\displaystyle\int_0^t\frac12\sin2u\,(t-u)e^{-(t-u)}du$.`,
      r`Evaluating (integration by parts twice) gives $\dfrac{2}{25}e^{-t}+\dfrac15te^{-t}-\dfrac{2}{25}\cos2t-\dfrac{3}{50}\sin2t$.`,
      r`Check by partial fractions: $\dfrac{1}{(s^2+4)(s+1)^2}=\dfrac{2/25}{s+1}+\dfrac{1/5}{(s+1)^2}+\dfrac{-\frac{2}{25}s-\frac{3}{25}}{s^2+4}$ — same result.`,
    ],
    answer: r`$\dfrac{2}{25}e^{-t}+\dfrac{t}{5}e^{-t}-\dfrac{2}{25}\cos2t-\dfrac{3}{50}\sin2t$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 3, qn: '3(b)', page: 5, marks: 7, unit: 2, topic: 'u2-step',
    title: 'Inverse transform with e^{−s}, e^{−3s}',
    question: r`Find the inverse Laplace transform of $\dfrac3s-\dfrac{4e^{-s}}{s^2}+\dfrac{4e^{-3s}}{s^2}$.`,
    steps: [
      r`$L^{-1}\{3/s\}=3$; $L^{-1}\{1/s^2\}=t$.`,
      r`Second shifting: $L^{-1}\{e^{-as}/s^2\}=(t-a)u(t-a)$.`,
      r`$f(t)=3-4(t-1)u(t-1)+4(t-3)u(t-3)$; piecewise: $3$ on $[0,1)$, $7-4t$ on $[1,3)$, $-5$ for $t\ge3$.`,
    ],
    answer: r`$3-4(t-1)u(t-1)+4(t-3)u(t-3)$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 3, qn: '4(a)', page: 5, marks: 7, unit: 2, topic: 'u2-step',
    title: 'Piecewise sin / cos with a switch at π',
    question: r`Find the Laplace transform of $f(t)=\begin{cases}\sin t,&t>\pi\\\cos t,&t<\pi\end{cases}$`,
    steps: [
      r`Write with unit step: $f(t)=\cos t+(\sin t-\cos t)u(t-\pi)$.`,
      r`Shift: with $t=\tau+\pi$, $\sin t-\cos t=-\sin\tau+\cos\tau$. So $L\{(\sin t-\cos t)u(t-\pi)\}=e^{-\pi s}L\{\cos\tau-\sin\tau\}=e^{-\pi s}\dfrac{s-1}{s^2+1}$.`,
      r`$F(s)=\dfrac{s}{s^2+1}+e^{-\pi s}\dfrac{s-1}{s^2+1}$.`,
    ],
    answer: r`$\dfrac{s+(s-1)e^{-\pi s}}{s^2+1}$`,
  }),
  q({
    file: 'jan', set: 3, qn: '4(b)', page: 5, marks: 7, unit: 2, topic: 'u2-ode',
    title: "y'' − 8y' + 15y = 9te^{2t}",
    question: r`Solve $y''-8y'+15y=9te^{2t},\ y(0)=5,\ y'(0)=10$ using the Laplace transform technique.`,
    steps: [
      r`$(s^2Y-5s-10)-8(sY-5)+15Y=\dfrac{9}{(s-2)^2}\Rightarrow(s-3)(s-5)Y=5s-30+\dfrac{9}{(s-2)^2}$.`,
      r`$Y=\dfrac{5s-30}{(s-3)(s-5)}+\dfrac{9}{(s-2)^2(s-3)(s-5)}$.`,
      r`Partial fractions: $\dfrac{5s-30}{(s-3)(s-5)}=\dfrac{15/2}{s-3}-\dfrac{5/2}{s-5}$; $\dfrac{9}{(s-2)^2(s-3)(s-5)}=\dfrac{4}{s-2}+\dfrac{3}{(s-2)^2}-\dfrac{9/2}{s-3}+\dfrac{1/2}{s-5}$.`,
      r`$Y=\dfrac4{s-2}+\dfrac3{(s-2)^2}+\dfrac3{s-3}-\dfrac2{s-5}$.`,
      r`$y=4e^{2t}+3te^{2t}+3e^{3t}-2e^{5t}$. Check: $y(0)=5$, $y'(0)=8+3+9-10=10$ ✓.`,
    ],
    answer: r`$y=(4+3t)e^{2t}+3e^{3t}-2e^{5t}$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 3, qn: '5(a)', page: 5, marks: 7, unit: 3, topic: 'u3-evenodd',
    title: 'Fourier series of x sin x',
    question: r`Find the Fourier series to represent the function $f(x)=x\sin x,\ -\pi<x<\pi$. Hence deduce that $\frac1{1\cdot3}-\frac1{3\cdot5}+\frac1{5\cdot7}-\frac1{7\cdot9}+\cdots=\frac14(\pi-2)$.`,
    steps: [
      r`$x\sin x$ is even ⇒ $b_n=0$, $a_n=\frac2\pi\int_0^\pi x\sin x\cos nx\,dx$.`,
      r`$a_0=\frac2\pi\int_0^\pi x\sin x\,dx=\frac2\pi\cdot\pi=2$.`,
      r`$n=1$: $a_1=\frac1\pi\int_0^\pi x\sin2x\,dx=\frac1\pi\cdot\big(-\frac\pi2\big)=-\frac12$.`,
      r`$n\ge2$: $2\sin x\cos nx=\sin(n+1)x-\sin(n-1)x$ ⇒ $a_n=\frac1\pi\Big[\frac{\pi(-1)^{n}}{n+1}\cdot(-1)-\frac{\pi(-1)^{n}}{n-1}\cdot(-1)\Big]=\dfrac{2(-1)^{n+1}}{n^2-1}$.`,
      r`$x\sin x=1-\dfrac12\cos x-2\displaystyle\sum_{n=2}^\infty\frac{(-1)^n}{n^2-1}\cos nx$.`,
      r`Put $x=\frac\pi2$: LHS $=\frac\pi2$; only even $n=2k$ survive with $\cos k\pi=(-1)^k$: $\frac\pi2=1-2\sum_k\frac{(-1)^k}{4k^2-1}=1+2\Big[\frac1{1\cdot3}-\frac1{3\cdot5}+\cdots\Big]$.`,
      r`Hence $\frac1{1\cdot3}-\frac1{3\cdot5}+\cdots=\dfrac{\pi-2}{4}$.`,
    ],
    answer: r`$x\sin x=1-\tfrac12\cos x+2\displaystyle\sum_{n\ge2}\frac{(-1)^{n+1}}{n^2-1}\cos nx$; series $=\tfrac14(\pi-2)$`,
    difficulty: 'hard',
    note: 'a₀ and a₁ verified symbolically; general aₙ verified at n = 3 and n = 4.',
  }),
  q({
    file: 'jan', set: 3, qn: '5(b)', page: 5, marks: 7, unit: 3, topic: 'u3-integral',
    title: 'Fourier sine integral of x on |x| < 1',
    question: r`Find the Fourier sin integral of $f(x)=\begin{cases}x,&|x|<1\\0,&|x|>1\end{cases}$`,
    steps: [
      r`$f$ is odd, so it has a pure sine integral: $f(x)=\displaystyle\int_0^\infty B(\lambda)\sin\lambda x\,d\lambda$, $B(\lambda)=\frac2\pi\int_0^\infty f(t)\sin\lambda t\,dt$.`,
      r`$B(\lambda)=\frac2\pi\int_0^1t\sin\lambda t\,dt=\frac2\pi\Big[\frac{-t\cos\lambda t}{\lambda}+\frac{\sin\lambda t}{\lambda^2}\Big]_0^1=\frac2\pi\cdot\frac{\sin\lambda-\lambda\cos\lambda}{\lambda^2}$.`,
    ],
    answer: r`$f(x)=\dfrac2\pi\displaystyle\int_0^\infty\frac{\sin\lambda-\lambda\cos\lambda}{\lambda^2}\sin\lambda x\,d\lambda$`,
  }),
  q({
    file: 'jan', set: 3, qn: '6(a)', page: 6, marks: 7, unit: 3, topic: 'u3-interval',
    title: 'Period-2 triangular wave πx / π(2 − x)',
    question: r`If $f(x)=\begin{cases}\pi x,&0<x<1\\\pi(2-x),&1<x<2\end{cases}$ and $f(x+2)=f(x)$ for all $x$. Obtain Fourier series of $f(x)$.`,
    steps: [
      r`Period $2l=2$ ⇒ $l=1$, interval $(0,2)$: $a_0=\int_0^2f,\ a_n=\int_0^2f\cos n\pi x,\ b_n=\int_0^2f\sin n\pi x$.`,
      r`$a_0=\int_0^1\pi x\,dx+\int_1^2\pi(2-x)dx=\frac\pi2+\frac\pi2=\pi$.`,
      r`$a_n=\dfrac{2((-1)^n-1)}{n^2\pi}$: $-\dfrac{4}{n^2\pi}$ for odd $n$, 0 for even $n$. $b_n=0$ (symmetric about $x=1$).`,
      r`$f(x)=\dfrac\pi2-\dfrac4\pi\displaystyle\sum_{n\text{ odd}}\frac{\cos n\pi x}{n^2}$.`,
    ],
    answer: r`$f(x)=\dfrac\pi2-\dfrac4\pi\Big[\cos\pi x+\dfrac{\cos3\pi x}{3^2}+\dfrac{\cos5\pi x}{5^2}+\cdots\Big]$`,
  }),
  q({
    file: 'jan', set: 3, qn: '6(b)', page: 6, marks: 7, unit: 3, topic: 'u3-sincos',
    title: 'Integral equation via inverse sine transform',
    question: r`Solve for $f(x)$ the integral equation $\displaystyle\int_0^\infty f(x)\sin xt\,dx=\begin{cases}1,&0\le t<1\\2,&1\le t<2\\0,&t\ge2\end{cases}$`,
    steps: [
      r`The left side is the Fourier sine transform $F_s(t)$. Inverse: $f(x)=\dfrac2\pi\displaystyle\int_0^\infty F_s(t)\sin xt\,dt$.`,
      r`$f(x)=\dfrac2\pi\Big[\int_0^1\sin xt\,dt+2\int_1^2\sin xt\,dt\Big]=\dfrac2\pi\Big[\dfrac{1-\cos x}{x}+\dfrac{2(\cos x-\cos2x)}{x}\Big]$.`,
    ],
    answer: r`$f(x)=\dfrac{2}{\pi x}\big(1+\cos x-2\cos2x\big)$`,
  }),
  q({
    file: 'jan', set: 3, qn: '7(a)', page: 6, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: '(mz − ny)p + (nx − lz)q = ly − mx',
    question: r`Solve $(mz-ny)p+(nx-lz)q=(ly-mx)$.`,
    steps: [
      r`A.E.: $\dfrac{dx}{mz-ny}=\dfrac{dy}{nx-lz}=\dfrac{dz}{ly-mx}$.`,
      r`Multipliers $x,y,z$: $x(mz-ny)+y(nx-lz)+z(ly-mx)=0$ ⇒ $x\,dx+y\,dy+z\,dz=0$ ⇒ $x^2+y^2+z^2=c_1$.`,
      r`Multipliers $l,m,n$: $l(mz-ny)+m(nx-lz)+n(ly-mx)=0$ ⇒ $l\,dx+m\,dy+n\,dz=0$ ⇒ $lx+my+nz=c_2$.`,
    ],
    answer: r`$\phi\big(x^2+y^2+z^2,\ lx+my+nz\big)=0$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 3, qn: '7(b)', page: 6, marks: 7, unit: 4, topic: 'u4-func',
    title: 'z = f(2x + y) + g(3x − y)',
    question: r`Obtain partial differential equation from $z=f(2x+y)+g(3x-y)$.`,
    steps: [
      r`$p=2f'+3g'$, $q=f'-g'$, $r=4f''+9g''$, $s=2f''-3g''$, $t=f''+g''$.`,
      r`Eliminate $f'',g''$: from $t$ and $s$: $f''=\frac{3t+s}{5},\ g''=\frac{2t-s}{5}$. Then $r=\frac{4(3t+s)+9(2t-s)}{5}=6t-s$.`,
      r`$r+s-6t=0$, i.e. $(D^2+DD'-6D'^2)z=0$ — consistent with the C.F. rule ($f(y+2x)$: $m=2$; $g(3x-y)$ is a function of $y-3x$: $m=-3$; $(m-2)(m+3)=m^2+m-6$).`,
    ],
    answer: r`$\dfrac{\partial^2z}{\partial x^2}+\dfrac{\partial^2z}{\partial x\partial y}-6\dfrac{\partial^2z}{\partial y^2}=0$`,
  }),
  q({
    file: 'jan', set: 3, qn: '8(a)', page: 6, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: 'x²(y² − z²)p + y²(z² − x²)q = z²(x² − y²) (as printed)',
    question: r`Solve $\big((x^2)(y^2-z^2)\big)p+\big((y^2)(z^2-x^2)\big)q=\big((z^2)(x^2-y^2)\big)$.`,
    transcription: 'exact_suspected_misprint',
    tnote: r`Transcribed exactly. As printed only one independent integral is obtainable by the standard multipliers. Two standard textbook versions exist: (A) $x(y^2-z^2)p+y(z^2-x^2)q=z(x^2-y^2)$ and (B) $x^2(y-z)p+y^2(z-x)q=z^2(x-y)$ — version (B) is worked in the Unit 4 notes (PDF p. 23). Both are solved.`,
    steps: [
      r`**As printed.** Multipliers $\frac1{x^2},\frac1{y^2},\frac1{z^2}$: $(y^2-z^2)+(z^2-x^2)+(x^2-y^2)=0$ ⇒ $\frac{dx}{x^2}+\frac{dy}{y^2}+\frac{dz}{z^2}=0$ ⇒ $\frac1x+\frac1y+\frac1z=c_1$. A second independent integral is not available by the usual multipliers — report this to your teacher.`,
      r`**Reading (A)** $x(y^2-z^2)p+\cdots$: multipliers $\frac1x,\frac1y,\frac1z$ give $xyz=c_1$; multipliers $x,y,z$ give $x^2+y^2+z^2=c_2$.`,
      r`**Reading (B)** $x^2(y-z)p+\cdots$: multipliers $\frac1x,\frac1y,\frac1z$ give $xyz=c_1$; multipliers $\frac1{x^2},\frac1{y^2},\frac1{z^2}$ give $\frac1x+\frac1y+\frac1z=c_2$.`,
    ],
    answer: r`As printed: one integral $\frac1x+\frac1y+\frac1z=c_1$. (A): $\phi(xyz,\,x^2+y^2+z^2)=0$. (B): $\phi\big(xyz,\,\frac1x+\frac1y+\frac1z\big)=0$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 3, qn: '8(b)', page: 6, marks: 7, unit: 4, topic: 'u4-const',
    title: 'Eliminate a, b from z = ax + by + a/b − b',
    question: r`Form the partial differential equation by eliminating the arbitrary constants $a$ and $b$ from $z=ax+by+\big(\frac ab\big)-b$.`,
    steps: [
      r`$p=a$, $q=b$.`,
      r`Substitute: $z=px+qy+\dfrac pq-q$ (a Clairaut-type equation).`,
    ],
    answer: r`$z=px+qy+\dfrac{p}{q}-q$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 3, qn: '9(a)', page: 6, marks: 7, unit: 5, topic: 'u5-separation',
    title: 'Separation: u_x = 2u_t + u',
    question: r`Solve by method of separation of variables the partial differential equation $u_x=2u_t+u$, where $u(x,0)=6e^{-3x}$.`,
    steps: [
      r`$u=X(x)T(t)$: $X'T=2XT'+XT\Rightarrow\dfrac{X'}{X}=\dfrac{2T'+T}{T}=\lambda$.`,
      r`$X=c_1e^{\lambda x}$; $2T'=(\lambda-1)T\Rightarrow T=c_2e^{(\lambda-1)t/2}$.`,
      r`$u=Ce^{\lambda x+(\lambda-1)t/2}$; $u(x,0)=Ce^{\lambda x}=6e^{-3x}\Rightarrow C=6,\ \lambda=-3$.`,
    ],
    answer: r`$u(x,t)=6e^{-3x-2t}$`,
    note: 'The same problem is solved in the Unit 5 notes (PDF pp. 48–49) with the same answer.',
    group: 'sep-first-order',
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 3, qn: '9(b)', page: 6, marks: 7, unit: 5, topic: 'u5-heat',
    title: 'Bar with ends 300 °C and 80 °C suddenly cooled',
    question: r`The ends A and B of a bar 20 cm long have the temperatures 300°C and 80°C until steady prevails. If the temperatures at A and B are suddenly reduced to 0°C and maintained at 0°C. Find the temperature in a bar.`,
    steps: [
      r`Steady state ($u_{xx}=0$): linear, $u_s(x)=300+\frac{80-300}{20}x=300-11x$. This is the initial temperature.`,
      r`New problem: $u_t=c^2u_{xx}$, $u(0,t)=u(20,t)=0$, $u(x,0)=300-11x$. Solution $u=\sum b_n\sin\frac{n\pi x}{20}e^{-c^2n^2\pi^2t/400}$.`,
      r`$b_n=\frac{2}{20}\int_0^{20}(300-11x)\sin\frac{n\pi x}{20}dx=\dfrac{2}{n\pi}\big(300-80(-1)^n\big)$.`,
    ],
    answer: r`$u(x,t)=\displaystyle\sum_{n=1}^\infty\frac{2\big(300-80(-1)^n\big)}{n\pi}\sin\frac{n\pi x}{20}\,e^{-c^2n^2\pi^2t/400}$`,
    note: 'Not covered in the uploaded Unit 5 notes; standard method. b_n verified symbolically.',
    group: 'heat-steady-then-zero',
  }),
  q({
    file: 'jan', set: 3, qn: '10(a)', page: 6, marks: 7, unit: 5, topic: 'u5-separation',
    title: 'All solutions of z_uu − 2z_u + z_v = 0',
    question: r`Solve by Variables separable method, find all possible solutions of $\dfrac{\partial^2z}{\partial u^2}-2\dfrac{\partial z}{\partial u}+\dfrac{\partial z}{\partial v}=0$`,
    steps: [
      r`$z=U(u)V(v)$: $U''V-2U'V+UV'=0\Rightarrow\dfrac{U''-2U'}{U}=-\dfrac{V'}{V}=k$.`,
      r`$V=c_3e^{-kv}$; $U''-2U'-kU=0$ with A.E. $m^2-2m-k=0$, $m=1\pm\sqrt{1+k}$.`,
      r`Case $k>-1$: $z=\big(c_1e^{(1+\sqrt{1+k})u}+c_2e^{(1-\sqrt{1+k})u}\big)c_3e^{-kv}$.`,
      r`Case $k=-1$: repeated root 1: $z=(c_1+c_2u)e^{u}\,c_3e^{v}$.`,
      r`Case $k<-1$: $z=e^{u}\big(c_1\cos\sqrt{-1-k}\,u+c_2\sin\sqrt{-1-k}\,u\big)c_3e^{-kv}$.`,
    ],
    answer: r`$z=U(u)\,e^{-kv}$ with $U$ given by the three cases $k>-1,\ k=-1,\ k<-1$ above`,
    note: 'Each of the three cases checked symbolically on a sample value of k.',
    group: 'sep-zxx-2zx-zy',
  }),
  q({
    file: 'jan', set: 3, qn: '10(b)', page: 6, marks: 7, unit: 5, topic: 'u5-pi-general',
    title: '(D² + DD′ − 6D′²)z = y cos x',
    question: r`Solve $\dfrac{\partial^2z}{\partial x^2}+\dfrac{\partial^2z}{\partial x\partial y}-6\dfrac{\partial^2z}{\partial y^2}=y\cos x$.`,
    steps: [
      r`A.E. $m^2+m-6=0\Rightarrow m=2,-3$. C.F. $=f_1(y+2x)+f_2(y-3x)$.`,
      r`P.I. $=\dfrac1{(D-2D')(D+3D')}y\cos x$. General rule: $\dfrac1{D-mD'}\phi(x,y)=\int\phi(x,c-mx)dx$, then $c\to y+mx$.`,
      r`$\dfrac{1}{D+3D'}y\cos x$ ($m=-3$, $y=c+3x$): $\int(c+3x)\cos x\,dx=(c+3x)\sin x+3\cos x$; with $c=y-3x$: $y\sin x+3\cos x$.`,
      r`$\dfrac1{D-2D'}(y\sin x+3\cos x)$ ($m=2$, $y=c-2x$): $\int\big[(c-2x)\sin x+3\cos x\big]dx=-(c-2x)\cos x-2\sin x+3\sin x$; with $c=y+2x$: $-y\cos x+\sin x$.`,
    ],
    answer: r`$z=f_1(y+2x)+f_2(y-3x)+\sin x-y\cos x$`,
    note: 'The Unit 5 notes (PDF p. 30) work the same example and obtain the same P.I.',
    group: 'ycosx',
  }),

  // ======================= JANUARY 2023 — SET 4 (PDF pages 7–8) =======================
  q({
    file: 'jan', set: 4, qn: '1(a)', page: 7, marks: 7, unit: 1, topic: 'u1-gauss',
    title: 'Verify divergence theorem on a quarter cylinder',
    question: r`Verify Divergence theorem for $\bar F=2x^2y\,i-y^2j+4xz^2k$ taken over the region of first octant of the cylinder $y^2+z^2=9$ and $x=0,\ x=2$.`,
    steps: [
      r`Volume side: $\nabla\cdot\bar F=4xy-2y+8xz$. In the quarter disc ($y,z\ge0$, $y^2+z^2\le9$): $\iint y\,dA=\iint z\,dA=9$.`,
      r`$\iiint=\int_0^2(4x\cdot9-2\cdot9+8x\cdot9)dx=\int_0^2(108x-18)dx=216-36=180$.`,
      r`Surface side, five faces. $x=0$: $\bar F\cdot(-\bar i)=-2x^2y=0$. $y=0$: $\bar F\cdot(-\bar j)=y^2=0$. $z=0$: $\bar F\cdot(-\bar k)=-4xz^2=0$.`,
      r`$x=2$: $\bar F\cdot\bar i=8y$, $\iint8y\,dA=72$.`,
      r`Curved face $\hat n=\frac{y\bar j+z\bar k}{3}$, $y=3\cos\theta,\ z=3\sin\theta$, $dS=3\,d\theta\,dx$: $\int_0^2\int_0^{\pi/2}(-27\cos^3\theta+108x\sin^3\theta)\,d\theta\,dx=\int_0^2(-18+72x)dx=108$.`,
      r`Total surface integral $=72+108=180$ = volume integral. Verified.`,
    ],
    answer: r`Both sides $=180$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 4, qn: '1(b)', page: 7, marks: 7, unit: 1, topic: 'u1-grad',
    title: 'Angle between normals to xy = z²',
    question: r`Find the angle between the normals to the surface $xy=z^2$ at the points $(4,1,2)$ and $(3,3,-3)$.`,
    steps: [
      r`$\phi=xy-z^2$, $\nabla\phi=y\,\bar i+x\,\bar j-2z\,\bar k$.`,
      r`At $(4,1,2)$: $\bar n_1=(1,4,-4)$, $|\bar n_1|=\sqrt{33}$. At $(3,3,-3)$: $\bar n_2=(3,3,6)$, $|\bar n_2|=\sqrt{54}$.`,
      r`$\cos\theta=\dfrac{3+12-24}{\sqrt{33}\sqrt{54}}=\dfrac{-9}{\sqrt{1782}}=-\dfrac{1}{\sqrt{22}}$.`,
    ],
    answer: r`$\theta=\cos^{-1}\Big(-\dfrac1{\sqrt{22}}\Big)$ (acute angle between the lines: $\cos^{-1}\frac1{\sqrt{22}}\approx77.7^\circ$)`,
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 4, qn: '2(a)', page: 7, marks: 7, unit: 1, topic: 'u1-grad',
    title: 'Orthogonal intersection of two surfaces',
    question: r`Find the values of $a$ and $b$ so that the surfaces $ax^2-byz=(a+2)x$ and $4x^2y+z^3=4$ may intersect orthogonally at the point $(1,-1,2)$.`,
    steps: [
      r`Point on the first surface: $a+2b=a+2\Rightarrow b=1$.`,
      r`$\nabla\big(ax^2-byz-(a+2)x\big)=(2ax-a-2,\ -bz,\ -by)$; at $P$: $(a-2,-2b,b)$.`,
      r`$\nabla(4x^2y+z^3)=(8xy,4x^2,3z^2)$; at $P$: $(-8,4,12)$.`,
      r`Orthogonal ⇔ normals perpendicular: $-8(a-2)-8b+12b=0\Rightarrow-8a+16+4b=0$. With $b=1$: $a=\frac52$.`,
    ],
    answer: r`$a=\dfrac52,\ b=1$`,
  }),
  q({
    file: 'jan', set: 4, qn: '2(b)', page: 7, marks: 7, unit: 1, topic: 'u1-div',
    title: 'r/rⁿ solenoidal and irrotational',
    question: r`Find for what values of $n$, $\dfrac{\bar r}{r^n}$ is solenoidal and irrotational.`,
    steps: [
      r`$\nabla\cdot(r^{-n}\bar r)=\nabla(r^{-n})\cdot\bar r+r^{-n}\nabla\cdot\bar r=-nr^{-n-2}r^2+3r^{-n}=(3-n)r^{-n}$. Solenoidal ⇔ $n=3$.`,
      r`$\nabla\times(\phi(r)\bar r)=\nabla\phi\times\bar r+\phi\,\nabla\times\bar r=\phi'(r)\frac{\bar r}{r}\times\bar r+\bar0=\bar0$ for every $n$.`,
    ],
    answer: r`Solenoidal only for $n=3$; irrotational for all $n$ (so both when $n=3$)`,
    group: 'r-identities',
  }),
  q({
    file: 'jan', set: 4, qn: '3(a)', page: 7, marks: 7, unit: 2, topic: 'u2-standard',
    title: 'L{(sin t − cos t)³}',
    question: r`Find the Laplace transforms of $(\sin t-\cos t)^3$.`,
    steps: [
      r`$(\sin t-\cos t)^2=1-\sin2t$, so $(\sin t-\cos t)^3=(\sin t-\cos t)-\sin2t\sin t+\sin2t\cos t$.`,
      r`$\sin2t\sin t=\tfrac12(\cos t-\cos3t)$, $\sin2t\cos t=\tfrac12(\sin3t+\sin t)$.`,
      r`$(\sin t-\cos t)^3=\tfrac32\sin t-\tfrac32\cos t+\tfrac12\sin3t+\tfrac12\cos3t$.`,
      r`$L=\dfrac32\cdot\dfrac{1-s}{s^2+1}+\dfrac12\cdot\dfrac{3+s}{s^2+9}$.`,
    ],
    answer: r`$\dfrac{3(1-s)}{2(s^2+1)}+\dfrac{s+3}{2(s^2+9)}$`,
  }),
  q({
    file: 'jan', set: 4, qn: '3(b)', page: 7, marks: 7, unit: 2, topic: 'u2-ode',
    title: "x'' + 9x = sin t with x(0) = 1, x(π/2) = 1",
    question: r`Solve the Initial value problem $\dfrac{d^2x}{dt^2}+9x=\sin t,\ x(0)=1,\ x\big(\frac\pi2\big)=1$.`,
    steps: [
      r`Let $x'(0)=a$ (unknown). Same transform as January 2023 Set 1 Q3(a): $x=\cos3t+\frac a3\sin3t+\frac18\sin t-\frac1{24}\sin3t$.`,
      r`$x(\pi/2)=1\Rightarrow a=-\frac52$.`,
    ],
    answer: r`$x(t)=\cos3t+\dfrac18(\sin t-7\sin3t)$`,
    group: 'ode-x-9x-sint',
  }),
  q({
    file: 'jan', set: 4, qn: '4(a)', page: 7, marks: 7, unit: 2, topic: 'u2-tmul',
    title: '∫₀^∞ t³ e^{−t} sin t dt',
    question: r`Evaluate $\displaystyle\int_0^\infty t^3e^{-t}\sin t\,dt$ using the Laplace transforms.`,
    steps: [
      r`$\displaystyle\int_0^\infty e^{-st}t^3\sin t\,dt=L\{t^3\sin t\}=(-1)^3\frac{d^3}{ds^3}\frac{1}{s^2+1}$.`,
      r`$\dfrac{d}{ds}\dfrac1{s^2+1}=\dfrac{-2s}{(s^2+1)^2}$, $\dfrac{d^2}{ds^2}=\dfrac{6s^2-2}{(s^2+1)^3}$, $\dfrac{d^3}{ds^3}=\dfrac{-24s(s^2-1)}{(s^2+1)^4}$.`,
      r`$L\{t^3\sin t\}=\dfrac{24s(s^2-1)}{(s^2+1)^4}$; at $s=1$ this is $0$.`,
    ],
    answer: r`$0$`,
  }),
  q({
    file: 'jan', set: 4, qn: '4(b)', page: 7, marks: 7, unit: 2, topic: 'u2-ode',
    title: "Resonance: y'' + n²y = a sin(nt + θ)",
    question: r`Solve the Initial value problem $y''+n^2y=a\sin(nt+\theta),\ y(0)=y'(0)=0$.`,
    steps: [
      r`$a\sin(nt+\theta)=a\cos\theta\sin nt+a\sin\theta\cos nt$ ⇒ RHS transform $a\dfrac{n\cos\theta+s\sin\theta}{s^2+n^2}$.`,
      r`$(s^2+n^2)Y=a\dfrac{n\cos\theta+s\sin\theta}{s^2+n^2}\Rightarrow Y=an\cos\theta\dfrac1{(s^2+n^2)^2}+a\sin\theta\dfrac{s}{(s^2+n^2)^2}$.`,
      r`Use $L^{-1}\Big\{\dfrac1{(s^2+n^2)^2}\Big\}=\dfrac{\sin nt-nt\cos nt}{2n^3}$ and $L^{-1}\Big\{\dfrac{s}{(s^2+n^2)^2}\Big\}=\dfrac{t\sin nt}{2n}$ (convolution).`,
      r`$y=\dfrac{a\cos\theta}{2n^2}(\sin nt-nt\cos nt)+\dfrac{a\sin\theta}{2n}t\sin nt=\dfrac{a}{2n^2}\big[\sin nt\cos\theta-nt\cos(nt+\theta)\big]$.`,
    ],
    answer: r`$y=\dfrac{a}{2n^2}\big[\sin nt\cos\theta-nt\cos(nt+\theta)\big]$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 4, qn: '5(a)', page: 7, marks: 7, unit: 3, topic: 'u3-interval',
    title: 'Fourier series of 1 + t² / 3 − t, period 2',
    question: r`Find the Fourier series of $f(t)=\begin{cases}1+t^2,&0\le t\le1\\3-t,&1\le t\le2\end{cases}$, $f(t+2)=f(t)$ for all $t$.`,
    steps: [
      r`Period 2, $l=1$, interval $(0,2)$: $a_0=\int_0^2f$, $a_n=\int_0^2f\cos n\pi t$, $b_n=\int_0^2f\sin n\pi t$.`,
      r`$a_0=\int_0^1(1+t^2)dt+\int_1^2(3-t)dt=\frac43+\frac32=\frac{17}6$.`,
      r`$a_n=\dfrac{3(-1)^n-1}{n^2\pi^2}$ (integration by parts on each piece).`,
      r`$b_n=\dfrac{2\big((-1)^n-1\big)}{n^3\pi^3}$ (the $\frac1{n\pi}$ terms from the two pieces cancel because $f$ is continuous at $t=1$ and $f(0)=f(2)$).`,
    ],
    answer: r`$f(t)=\dfrac{17}{12}+\displaystyle\sum_{n=1}^\infty\Big[\frac{3(-1)^n-1}{n^2\pi^2}\cos n\pi t+\frac{2((-1)^n-1)}{n^3\pi^3}\sin n\pi t\Big]$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 4, qn: '5(b)', page: 7, marks: 7, unit: 3, topic: 'u3-finite',
    title: 'Finite sine and cosine transforms of 2x on (0, 4)',
    question: r`Find the finite Fourier sine transform and finite Fourier cosine transform of $f(x)=2x$ in $0<x<4$.`,
    steps: [
      r`Definitions on $(0,l)$: $F_s(n)=\int_0^lf\sin\frac{n\pi x}{l}dx$, $F_c(n)=\int_0^lf\cos\frac{n\pi x}ldx$, here $l=4$.`,
      r`$F_s(n)=\int_0^42x\sin\frac{n\pi x}4dx=\dfrac{32(-1)^{n+1}}{n\pi}$.`,
      r`$F_c(n)=\int_0^42x\cos\frac{n\pi x}4dx=\dfrac{32\big((-1)^n-1\big)}{n^2\pi^2}$ for $n\ge1$; $F_c(0)=\int_0^42x\,dx=16$.`,
    ],
    answer: r`$F_s(n)=\dfrac{32(-1)^{n+1}}{n\pi}$; $F_c(n)=\dfrac{32((-1)^n-1)}{n^2\pi^2}\ (n\ge1)$, $F_c(0)=16$`,
    note: 'The Unit 3 notes work this example (PDF p. 41).',
  }),
  q({
    file: 'jan', set: 4, qn: '6(a)', page: 8, marks: 7, unit: 3, topic: 'u3-halfrange',
    title: 'Half-range sine series: sin x / cos x pieces',
    question: r`Find the half range sine series of $f(x)=\begin{cases}\sin x&\text{for }0\le x\le\frac\pi2\\\cos x&\text{for }\frac\pi2\le x\le\pi\end{cases}$`,
    steps: [
      r`$b_n=\frac2\pi\Big[\int_0^{\pi/2}\sin x\sin nx\,dx+\int_{\pi/2}^\pi\cos x\sin nx\,dx\Big]$.`,
      r`$n=1$: $\frac2\pi\big[\frac\pi4+\big(-\frac12\big)\big]=\frac12-\frac1\pi$.`,
      r`$n\ge2$ (product-to-sum, then evaluate): $b_n=\dfrac{2\big[n(-1)^n-n\cos\frac{n\pi}2+\sin\frac{n\pi}2\big]}{\pi(n^2-1)}$.`,
      r`e.g. $b_2=\frac{8}{3\pi},\ b_3=-\frac1\pi,\ b_4=0,\ b_5=-\frac1{3\pi},\ b_6=\frac{24}{35\pi}$.`,
    ],
    answer: r`$f(x)=\Big(\tfrac12-\tfrac1\pi\Big)\sin x+\displaystyle\sum_{n\ge2}\frac{2\big[n(-1)^n-n\cos\frac{n\pi}{2}+\sin\frac{n\pi}{2}\big]}{\pi(n^2-1)}\sin nx$`,
    note: 'b₁ and b₂–b₇ checked symbolically against the general formula (not a full symbolic proof for all n).',
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 4, qn: '6(b)', page: 8, marks: 7, unit: 3, topic: 'u3-integral',
    title: '∫ sin s cos xs / s ds',
    question: r`Using Fourier integral representation, show that $\displaystyle\int_0^\infty\frac{\sin s\cdot\cos xs}{s}ds=\begin{cases}\frac\pi2,&\text{if }0\le x<1\\\frac\pi4,&\text{if }x=1\\0,&\text{if }x>1\end{cases}$`,
    steps: [
      r`Take $f(x)=1$ for $|x|<1$, $0$ for $|x|>1$ (even). Fourier cosine integral: $f(x)=\frac2\pi\int_0^\infty\cos sx\int_0^\infty f(t)\cos st\,dt\,ds$.`,
      r`$\int_0^1\cos st\,dt=\dfrac{\sin s}{s}$ ⇒ $f(x)=\dfrac2\pi\displaystyle\int_0^\infty\frac{\sin s\cos xs}{s}ds$.`,
      r`Hence the integral $=\frac\pi2f(x)$: $\frac\pi2$ for $0\le x<1$, $0$ for $x>1$; at the jump $x=1$ it converges to $\frac\pi2\cdot\frac{1+0}2=\frac\pi4$.`,
    ],
    answer: r`Shown: $\frac\pi2,\ \frac\pi4,\ 0$ on the three ranges`,
    group: 'fourier-integral-pulse',
  }),
  q({
    file: 'jan', set: 4, qn: '7(a)', page: 8, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: '(x³ + 3xy²)p + (y³ + 3x²y)q = 2(x² + y²)z',
    question: r`Find the general solution of $(x^3+3xy^2)p+(y^3+3x^2y)q=2(x^2+y^2)z$.`,
    steps: [
      r`A.E.: $\dfrac{dx}{x^3+3xy^2}=\dfrac{dy}{y^3+3x^2y}=\dfrac{dz}{2(x^2+y^2)z}$.`,
      r`Multipliers $\frac1x,\frac1y,0$: $\dfrac{dx/x+dy/y}{x^2+3y^2+y^2+3x^2}=\dfrac{dx/x+dy/y}{4(x^2+y^2)}$. Equate with the third ratio: $\dfrac{dx}{x}+\dfrac{dy}{y}=\dfrac{2dz}{z}\Rightarrow\dfrac{xy}{z^2}=c_1$.`,
      r`Multipliers $1,\pm1$: $\dfrac{dx+dy}{(x+y)^3}=\dfrac{dx-dy}{(x-y)^3}\Rightarrow\dfrac{1}{(x-y)^2}-\dfrac1{(x+y)^2}=c$, i.e. $\dfrac{xy}{(x^2-y^2)^2}=c_2$.`,
    ],
    answer: r`$\phi\Big(\dfrac{xy}{z^2},\ \dfrac{xy}{(x^2-y^2)^2}\Big)=0$`,
    tnote: 'Printed as "(x³+3xy²)p+(y³+3x²y)q=2(x²+y²)z" — read clearly.',
    difficulty: 'hard',
  }),
  q({
    file: 'jan', set: 4, qn: '7(b)', page: 8, marks: 7, unit: 4, topic: 'u4-const',
    title: 'Eliminate a, b from z = (x² + a)(y² + b)',
    question: r`Form the P.D.E by eliminating the arbitrary constants from $z=(x^2+a)(y^2+b)$.`,
    steps: [
      r`$p=2x(y^2+b)\Rightarrow y^2+b=\dfrac{p}{2x}$; $q=2y(x^2+a)\Rightarrow x^2+a=\dfrac q{2y}$.`,
      r`$z=\dfrac{q}{2y}\cdot\dfrac{p}{2x}\Rightarrow pq=4xyz$.`,
    ],
    answer: r`$pq=4xyz$`,
    note: 'Same example in the Unit 4 notes (PDF p. 4). Verified in scripts/verify_math.py.',
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 4, qn: '8(a)', page: 8, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: 'dx/(y²(x−y)) = dy/(−x²(x−y)) = dz/(z(x²+y²))',
    question: r`Solve $\dfrac{dx}{y^2(x-y)}=\dfrac{dy}{-x^2(x-y)}=\dfrac{dz}{z(x^2+y^2)}$`,
    steps: [
      r`First two: $x^2dx=-y^2dy\Rightarrow x^3+y^3=c_1$.`,
      r`Multipliers $1,-1,0$: $\dfrac{dx-dy}{y^2(x-y)+x^2(x-y)}=\dfrac{dx-dy}{(x-y)(x^2+y^2)}$. Equate with the third: $\dfrac{dx-dy}{x-y}=\dfrac{dz}z\Rightarrow\dfrac{x-y}{z}=c_2$.`,
    ],
    answer: r`$\phi\Big(x^3+y^3,\ \dfrac{x-y}{z}\Big)=0$`,
  }),
  q({
    file: 'jan', set: 4, qn: '8(b)', page: 8, marks: 7, unit: 4, topic: 'u4-form1',
    title: 'p² + q² = npq',
    question: r`Solve $p^2+q^2=npq$.`,
    steps: [
      r`Standard form I, $f(p,q)=0$. Trial $z=ax+by+c$: $p=a,\ q=b$, so $a^2+b^2=nab$.`,
      r`Solve for $b$: $b^2-nab+a^2=0\Rightarrow b=\dfrac{a}{2}\big(n\pm\sqrt{n^2-4}\big)$.`,
    ],
    answer: r`$z=ax+\dfrac a2\big(n\pm\sqrt{n^2-4}\big)y+c$`,
    note: 'Worked in the Unit 4 notes (PDF p. 29) with the roles of a and b swapped.',
    difficulty: 'easy',
  }),
  q({
    file: 'jan', set: 4, qn: '9(a)', page: 8, marks: 7, unit: 5, topic: 'u5-wave',
    title: 'All forms of solution of the wave equation',
    question: r`Solve by the method of separation of variables for all forms of solution to $\dfrac{\partial^2u}{\partial t^2}=c^2\dfrac{\partial^2u}{\partial x^2}$`,
    steps: [
      r`$u=X(x)T(t)$: $XT''=c^2X''T\Rightarrow\dfrac{X''}{X}=\dfrac{T''}{c^2T}=k$.`,
      r`$k=p^2>0$: $u=(c_1e^{px}+c_2e^{-px})(c_3e^{cpt}+c_4e^{-cpt})$.`,
      r`$k=-p^2<0$: $u=(c_1\cos px+c_2\sin px)(c_3\cos cpt+c_4\sin cpt)$ — the physically relevant form for a vibrating string (periodic in $t$, can vanish at two ends).`,
      r`$k=0$: $u=(c_1x+c_2)(c_3t+c_4)$.`,
    ],
    answer: r`Three forms (exponential, trigonometric, linear) as above; the trigonometric form is used for strings fixed at both ends`,
    status: 'checked_by_hand',
    group: 'all-forms',
  }),
  q({
    file: 'jan', set: 4, qn: '9(b)', page: 8, marks: 7, unit: 5, topic: 'u5-heat',
    title: 'Insulated rod: ends 0 °C and 100 °C, then B cooled',
    question: r`An insulated rod of length $l$ has its ends A and B maintained at 0°C and 100°C respectively until steady state conditions prevail. If B is suddenly reduced to 0°C and maintained at 0°C, find the temperature at a distance $x$ from A at time $t$.`,
    steps: [
      r`Steady state: $u_s=\dfrac{100x}{l}$ — becomes the initial condition.`,
      r`Then $u(0,t)=u(l,t)=0$: $u=\sum b_n\sin\frac{n\pi x}{l}e^{-c^2n^2\pi^2t/l^2}$.`,
      r`$b_n=\frac2l\int_0^l\frac{100x}{l}\sin\frac{n\pi x}{l}dx=\dfrac{200(-1)^{n+1}}{n\pi}$.`,
    ],
    answer: r`$u(x,t)=\dfrac{200}{\pi}\displaystyle\sum_{n=1}^\infty\frac{(-1)^{n+1}}{n}\sin\frac{n\pi x}{l}e^{-c^2n^2\pi^2t/l^2}$`,
    note: 'Not covered in the uploaded Unit 5 notes; standard method. b_n verified symbolically.',
    group: 'heat-steady-then-zero',
  }),
  q({
    file: 'jan', set: 4, qn: '10(a)', page: 8, marks: 7, unit: 5, topic: 'u5-wave',
    title: 'Plucked string, midpoint raised to height H',
    question: r`A tightly stretched string of length L is fixed at its both the ends. The midpoint of the rod is taken to a height of H and then released from rest in that position. Find the displacement of any point of the string at a position $x$ measured from one end of the rod and at any time $t$.`,
    tnote: '"rod" in the printed question means the string.',
    steps: [
      r`Initial shape: $f(x)=\frac{2H}{L}x$ on $[0,\frac L2]$, $\frac{2H}{L}(L-x)$ on $[\frac L2,L]$; released from rest ⇒ $u_t(x,0)=0$.`,
      r`Same structure as Set 2 Q9(a) with $k=H$, $l=L$: $A_n=\dfrac{8H}{n^2\pi^2}\sin\dfrac{n\pi}{2}$.`,
    ],
    answer: r`$u(x,t)=\dfrac{8H}{\pi^2}\displaystyle\sum_{n=1}^\infty\frac{\sin(n\pi/2)}{n^2}\sin\frac{n\pi x}{L}\cos\frac{n\pi ct}{L}$`,
    group: 'triangular-string',
  }),
  q({
    file: 'jan', set: 4, qn: '10(b)', page: 8, marks: 7, unit: 5, topic: 'u5-pi-exp',
    title: 'Cubic operator with e^{x+y}: case of failure',
    question: r`Solve $\dfrac{\partial^3z}{\partial x^3}-2\dfrac{\partial^3z}{\partial x^2\partial y}-\dfrac{\partial^3z}{\partial x\partial y^2}+2\dfrac{\partial^3z}{\partial y^3}=e^{x+y}$`,
    steps: [
      r`A.E. $m^3-2m^2-m+2=(m-1)(m+1)(m-2)=0$. C.F. $=f_1(y+x)+f_2(y-x)+f_3(y+2x)$.`,
      r`P.I.: $f(1,1)=1-2-1+2=0$ — failure. Rule: $x\cdot\dfrac{1}{\partial f/\partial D}e^{x+y}$ with $\dfrac{\partial f}{\partial D}=3D^2-4DD'-D'^2$.`,
      r`At $(1,1)$: $3-4-1=-2\ne0$. P.I. $=-\dfrac x2e^{x+y}$.`,
    ],
    answer: r`$z=f_1(y+x)+f_2(y-x)+f_3(y+2x)-\dfrac{x}{2}e^{x+y}$`,
  }),

  // ======================= JULY 2023 — SET 1 (PDF pages 1–2) =======================
  q({
    file: 'jul', set: 1, qn: '1(a)', page: 1, marks: 7, unit: 1, topic: 'u1-grad',
    title: 'Box product of three gradients',
    question: r`If $a=x+y+z,\ b=x^2+y^2+z^2,\ c=xy+yz+zx$ prove that $[\operatorname{grad}a\ \operatorname{grad}b\ \operatorname{grad}c]=0$.`,
    steps: [
      r`$\nabla a=(1,1,1)$, $\nabla b=(2x,2y,2z)$, $\nabla c=(y+z,\ z+x,\ x+y)$.`,
      r`Box product = determinant $\begin{vmatrix}1&1&1\\2x&2y&2z\\y+z&z+x&x+y\end{vmatrix}$.`,
      r`$R_3\to R_3+\tfrac12R_2$: row 3 becomes $(x+y+z)(1,1,1)$, proportional to row 1 ⇒ determinant $=0$. (Geometrically, $a,b,c$ are functionally related: $a^2=b+2c$.)`,
    ],
    answer: r`$[\nabla a\ \nabla b\ \nabla c]=0$ (proved)`,
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '1(b)', page: 1, marks: 7, unit: 1, topic: 'u1-line',
    title: 'Work done along x = 2t³, y = t, z = 4t² − t',
    question: r`Find work done in moving particle in the force field $\bar F=3x^2\bar i+(2xz-y)\bar j+z\bar k$ along the space curve $x=2t^3,\ y=t,\ z=4t^2-t$ from $t=0$ to $t=1$.`,
    steps: [
      r`$dx=6t^2dt,\ dy=dt,\ dz=(8t-1)dt$.`,
      r`$3x^2\,dx=12t^6\cdot6t^2dt=72t^8dt$.`,
      r`$(2xz-y)dy=\big(4t^3(4t^2-t)-t\big)dt=(16t^5-4t^4-t)dt$.`,
      r`$z\,dz=(4t^2-t)(8t-1)dt=(32t^3-12t^2+t)dt$.`,
      r`$W=\int_0^1(72t^8+16t^5-4t^4+32t^3-12t^2)dt=8+\frac83-\frac45+8-4=\frac{208}{15}$.`,
    ],
    answer: r`$W=\dfrac{208}{15}$`,
    note: 'Machine-checked. (A different curve, x=2t², y=t, z=t³, is common in textbooks — do not mix them up.)',
    group: 'work-3x2',
  }),
  q({
    file: 'jul', set: 1, qn: '2(a)', page: 1, marks: 7, unit: 1, topic: 'u1-curl',
    title: 'Irrotational field and scalar potential (repeat)',
    question: r`Show that the vector $(x^2-yz)\bar i+(y^2-zx)\bar j+(z^2-xy)\bar k$ is irrotational and find its scalar potential`,
    steps: [r`Identical to January 2023 Set 1 Q1(b): curl $=\bar0$; integrate component-wise.`],
    answer: r`$\phi=\dfrac{x^3+y^3+z^3}{3}-xyz+C$`,
    group: 'potential-x2-yz',
  }),
  q({
    file: 'jul', set: 1, qn: '2(b)', page: 1, marks: 7, unit: 1, topic: 'u1-stokes',
    title: 'Flux of curl over a hemisphere (Stokes)',
    question: r`Evaluate $\iint_s(\operatorname{Curl}\bar A\cdot\bar n)ds$ where $\bar A=y\bar i+(x-2z)\bar j-xy\bar k$ and $s$ is the surface of the sphere $x^2+y^2+z^2=4$ above $xy$ plane by stoke's theorem.`,
    tnote: r`The $\bar j$-component prints as $(x-2z)$ in the image (some textbooks have $(x-2xz)$). Either way it does not matter: on the boundary $z=0$.`,
    steps: [
      r`Stokes: $\iint_S(\nabla\times\bar A)\cdot\hat n\,dS=\oint_C\bar A\cdot d\bar r$, $C$: $x^2+y^2=4,\ z=0$.`,
      r`On $C$: $z=0,\ dz=0$, so $\bar A\cdot d\bar r=y\,dx+x\,dy=d(xy)$, an exact differential.`,
      r`$\oint_Cd(xy)=0$ around a closed curve. (With $x=2\cos t,y=2\sin t$: $\int_0^{2\pi}4\cos2t\,dt=0$.)`,
    ],
    answer: r`$0$`,
    group: 'stokes',
  }),
  q({
    file: 'jul', set: 1, qn: '3(a)', page: 1, marks: 7, unit: 2, topic: 'u2-tmul',
    title: 'Change of scale',
    question: r`If $L\{f(t)\}=\log\Big(\dfrac{s+3}{s+1}\Big)$ then find $L\{f(2t)\}$ using change of scale property`,
    steps: [
      r`Change of scale: $L\{f(at)\}=\dfrac1aF\Big(\dfrac sa\Big)$.`,
      r`$a=2$: $\dfrac12\log\dfrac{s/2+3}{s/2+1}=\dfrac12\log\dfrac{s+6}{s+2}$.`,
    ],
    answer: r`$\dfrac12\log\dfrac{s+6}{s+2}$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '3(b)', page: 1, marks: 7, unit: 2, topic: 'u2-tmul',
    title: 'L{(e^{−at} − e^{−bt})/t}',
    question: r`Find $L\Big\{\dfrac{e^{-at}-e^{-bt}}{t}\Big\}$`,
    steps: [
      r`$L\{e^{-at}-e^{-bt}\}=\dfrac1{s+a}-\dfrac1{s+b}$.`,
      r`Division by $t$: $\displaystyle\int_s^\infty\Big(\frac1{u+a}-\frac1{u+b}\Big)du=\Big[\log\frac{u+a}{u+b}\Big]_s^\infty=\log\frac{s+b}{s+a}$.`,
    ],
    answer: r`$\log\dfrac{s+b}{s+a}$`,
    note: 'Verified in scripts/verify_math.py.',
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '4(a)', page: 1, marks: 7, unit: 2, topic: 'u2-shift1',
    title: 'L{e^{−3t}(cos 4t + 3 sin 4t)}',
    question: r`Find Laplace transform of $e^{-3t}(\cos4t+3\sin4t)$`,
    steps: [
      r`$L\{\cos4t+3\sin4t\}=\dfrac{s}{s^2+16}+\dfrac{12}{s^2+16}=\dfrac{s+12}{s^2+16}$.`,
      r`First shifting ($s\to s+3$): $\dfrac{s+3+12}{(s+3)^2+16}=\dfrac{s+15}{s^2+6s+25}$.`,
    ],
    answer: r`$\dfrac{s+15}{s^2+6s+25}$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '4(b)', page: 1, marks: 7, unit: 2, topic: 'u2-inverse',
    title: 'L⁻¹{(s+5)/((s−1)²(s+2))}',
    question: r`Find inverse Laplace transform of $\dfrac{s+5}{(s-1)^2(s+2)}$`,
    steps: [
      r`$\dfrac{s+5}{(s-1)^2(s+2)}=\dfrac{A}{s-1}+\dfrac{B}{(s-1)^2}+\dfrac C{s+2}$.`,
      r`$s=1$: $6=3B\Rightarrow B=2$. $s=-2$: $3=9C\Rightarrow C=\frac13$. Compare $s^2$: $0=A+C\Rightarrow A=-\frac13$.`,
      r`$f(t)=-\frac13e^t+2te^t+\frac13e^{-2t}$.`,
    ],
    answer: r`$-\dfrac13e^t+2te^t+\dfrac13e^{-2t}$`,
  }),
  q({
    file: 'jul', set: 1, qn: '5(a)', page: 1, marks: 7, unit: 3, topic: 'u3-euler',
    title: '(π − x)²/4 on (0, 2π); deduce Σ1/n² = π²/6',
    question: r`Find the Fourier series of $f(x)=\frac14(\pi-x)^2,\ 0<x<2\pi$. Hence deduce that $\frac1{1^2}+\frac1{2^2}+\frac1{3^2}+\cdots=\frac{\pi^2}6$`,
    steps: [
      r`$a_0=\frac1\pi\int_0^{2\pi}\frac{(\pi-x)^2}4dx=\frac1{4\pi}\cdot\frac{2\pi^3}{3}=\frac{\pi^2}{6}$.`,
      r`$a_n=\frac1{4\pi}\int_0^{2\pi}(\pi-x)^2\cos nx\,dx=\dfrac1{n^2}$; $b_n=0$ (by symmetry about $x=\pi$).`,
      r`$f(x)=\dfrac{\pi^2}{12}+\displaystyle\sum_{n=1}^\infty\frac{\cos nx}{n^2}$.`,
      r`At $x=0$ the periodic extension is continuous with value $\frac{\pi^2}4$: $\frac{\pi^2}4=\frac{\pi^2}{12}+\sum\frac1{n^2}\Rightarrow\sum\frac1{n^2}=\frac{\pi^2}6$.`,
    ],
    answer: r`$\dfrac{(\pi-x)^2}{4}=\dfrac{\pi^2}{12}+\displaystyle\sum_{n\ge1}\frac{\cos nx}{n^2}$; $\sum\frac1{n^2}=\frac{\pi^2}{6}$`,
  }),
  q({
    file: 'jul', set: 1, qn: '5(b)', page: 1, marks: 7, unit: 3, topic: 'u3-halfrange',
    title: 'Half-range cosine series of a ±1 step on [0, 2]',
    question: r`Find the Half range cosine series of $f(x)=\begin{cases}1&0<x<1\\-1&1<x<2\end{cases}$ in $[0,2]$`,
    steps: [
      r`$l=2$: $a_0=\int_0^1dx-\int_1^2dx=0$.`,
      r`$a_n=\int_0^1\cos\frac{n\pi x}2dx-\int_1^2\cos\frac{n\pi x}{2}dx=\frac{2}{n\pi}\sin\frac{n\pi}2+\frac2{n\pi}\sin\frac{n\pi}{2}=\frac{4}{n\pi}\sin\frac{n\pi}2$.`,
    ],
    answer: r`$f(x)=\dfrac4\pi\displaystyle\sum_{n=1}^\infty\frac{\sin(n\pi/2)}{n}\cos\frac{n\pi x}{2}=\frac4\pi\Big[\cos\frac{\pi x}2-\frac13\cos\frac{3\pi x}2+\cdots\Big]$`,
  }),
  q({
    file: 'jul', set: 1, qn: '6(a)', page: 2, marks: 7, unit: 3, topic: 'u3-ft',
    title: 'Fourier transform of a triangular pulse',
    question: r`Find the Fourier transform of $f(x)$ defend by $f(x)=\begin{cases}x&\text{if }0<x<1\\1-x&\text{if }1<x<2\\0&\text{if }x>2\end{cases}$`,
    transcription: 'exact_suspected_misprint',
    tnote: r`Transcribed exactly. With "$1-x$" the function jumps from 1 to 0 at $x=1$; the standard problem has $2-x$ (a continuous triangle). Both answers given. Also $f=0$ for $x<0$ is assumed.`,
    steps: [
      r`Convention: $F(p)=\int f(x)e^{ipx}dx$ (Unit 3 notes, p. 26).`,
      r`**Intended triangle** ($2-x$ on $(1,2)$): $F(p)=\int_0^1xe^{ipx}dx+\int_1^2(2-x)e^{ipx}dx=-\dfrac{(e^{ip}-1)^2}{p^2}=\dfrac{2e^{ip}(1-\cos p)}{p^2}$.`,
      r`**As printed** ($1-x$ on $(1,2)$): $F(p)=\dfrac{(2-ip)e^{ip}+(ip-1)e^{2ip}-1}{p^2}$.`,
    ],
    answer: r`Triangle ($2-x$): $F(p)=\dfrac{2e^{ip}(1-\cos p)}{p^2}=\dfrac{4e^{ip}\sin^2(p/2)}{p^2}$. As printed: $\dfrac{(2-ip)e^{ip}+(ip-1)e^{2ip}-1}{p^2}$`,
    difficulty: 'hard',
  }),
  q({
    file: 'jul', set: 1, qn: '6(b)', page: 2, marks: 7, unit: 3, topic: 'u3-sincos',
    title: 'Fourier cosine transform of 1/(1 + x²)',
    question: r`Find the Fourier cosine transform of $\dfrac{1}{1+x^2}$`,
    steps: [
      r`$F_c(p)=\displaystyle\int_0^\infty\frac{\cos px}{1+x^2}dx$.`,
      r`From the cosine transform of $e^{-x}$: $\int_0^\infty e^{-x}\cos px\,dx=\frac1{1+p^2}$. Inverting: $e^{-x}=\frac2\pi\int_0^\infty\frac{\cos px}{1+p^2}dp$.`,
      r`Swap the names $x\leftrightarrow p$: $\displaystyle\int_0^\infty\frac{\cos px}{1+x^2}dx=\frac\pi2e^{-p}$ for $p\ge0$.`,
    ],
    answer: r`$F_c(p)=\dfrac\pi2e^{-p}\ (p\ge0)$`,
  }),
  q({
    file: 'jul', set: 1, qn: '7(a)', page: 2, marks: 7, unit: 4, topic: 'u4-func',
    title: 'z = f(x² − y) + g(x² + y)',
    question: r`Find the partial differential equation by eliminating arbitrary function from $z=f(x^2-y)+g(x^2+y)$`,
    steps: [
      r`$p=2x(f'+g')$, $q=-f'+g'$; $r=2(f'+g')+4x^2(f''+g'')$, $t=f''+g''$.`,
      r`From $p$: $f'+g'=\frac{p}{2x}$. So $r=\frac px+4x^2t$.`,
      r`$xr-p-4x^3t=0$.`,
    ],
    answer: r`$x\dfrac{\partial^2z}{\partial x^2}-\dfrac{\partial z}{\partial x}-4x^3\dfrac{\partial^2z}{\partial y^2}=0$`,
  }),
  q({
    file: 'jul', set: 1, qn: '7(b)', page: 2, marks: 7, unit: 4, topic: 'u4-form1',
    title: 'p²q³ = 1',
    question: r`Solve the P.D.E $p^2q^3=1$`,
    steps: [
      r`Form I. $z=ax+by+c$: $a^2b^3=1\Rightarrow b=a^{-2/3}$.`,
    ],
    answer: r`$z=ax+a^{-2/3}y+c$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '8(a)', page: 2, marks: 7, unit: 4, topic: 'u4-const',
    title: 'Eliminate constants from x² + y² = (z − c)² cot²α',
    question: r`Find the partial differential equation by eliminating arbitrary constants from $x^2+y^2=(z-c)^2\cot^2\alpha$`,
    steps: [
      r`Two constants $c,\alpha$, two independent variables ⇒ first-order PDE.`,
      r`$\partial_x$: $2x=2(z-c)p\cot^2\alpha$; $\partial_y$: $2y=2(z-c)q\cot^2\alpha$.`,
      r`Divide: $\dfrac xy=\dfrac pq\Rightarrow yp-xq=0$.`,
    ],
    answer: r`$yp=xq$`,
    difficulty: 'easy',
  }),
  q({
    file: 'jul', set: 1, qn: '8(b)', page: 2, marks: 7, unit: 4, topic: 'u4-lagrange',
    title: '(x + 2z)p + (4z − y)q = 2x + y',
    question: r`Solve the P.D.E $(x+2z)p+(4z-y)q=2x+y$`,
    steps: [
      r`A.E.: $\dfrac{dx}{x+2z}=\dfrac{dy}{4z-y}=\dfrac{dz}{2x+y}$.`,
      r`Multipliers $2,-1,-1$: $2(x+2z)-(4z-y)-(2x+y)=0$ ⇒ $2dx-dy-dz=0$ ⇒ $2x-y-z=c_1$.`,
      r`Multipliers $y,x,-2z$: $y(x+2z)+x(4z-y)-2z(2x+y)=0$ ⇒ $y\,dx+x\,dy-2z\,dz=0$ ⇒ $xy-z^2=c_2$.`,
    ],
    answer: r`$\phi\big(2x-y-z,\ xy-z^2\big)=0$`,
  }),
  q({
    file: 'jul', set: 1, qn: '9', page: 2, marks: 14, unit: 5, topic: 'u5-laplace',
    title: 'Laplace equation in a semi-infinite strip',
    question: r`Solve $\dfrac{\partial^2u}{\partial x^2}+\dfrac{\partial^2u}{\partial y^2}=0$ subject to the following conditions (i) $u(0,y)=0$ for all $y$ (ii) $u(a,y)=0$ for all $y$ (iii) $u(x,\infty)=0,\ 0\le x\le a$ (iv) $u(x,0)=kx,\ 0\le x\le a$`,
    steps: [
      r`$u=X(x)Y(y)$: $\dfrac{X''}{X}=-\dfrac{Y''}{Y}=-\lambda^2$ (chosen so $X$ can vanish at $x=0$ and $x=a$).`,
      r`$X=\sin\frac{n\pi x}{a}$; $Y=Ae^{n\pi y/a}+Be^{-n\pi y/a}$; condition (iii) ⇒ $A=0$.`,
      r`$u=\sum b_n\sin\frac{n\pi x}ae^{-n\pi y/a}$; (iv): $b_n=\frac2a\int_0^akx\sin\frac{n\pi x}adx=\dfrac{2ka(-1)^{n+1}}{n\pi}$.`,
    ],
    answer: r`$u(x,y)=\dfrac{2ka}{\pi}\displaystyle\sum_{n=1}^\infty\frac{(-1)^{n+1}}{n}\sin\frac{n\pi x}{a}e^{-n\pi y/a}$`,
    note: 'Not covered in the uploaded Unit 5 notes; standard method. b_n verified symbolically.',
  }),
  q({
    file: 'jul', set: 1, qn: '10(a)', page: 2, marks: 7, unit: 5, topic: 'u5-separation',
    title: 'Separation: z_xx − 2z_x + z_y = 0',
    question: r`Solve the P.D.E $\dfrac{\partial^2z}{\partial x^2}-2\dfrac{\partial z}{\partial x}+\dfrac{\partial z}{\partial y}=0$ using method of separation of variables`,
    steps: [
      r`Identical structure to January 2023 Set 3 Q10(a) with $(u,v)\to(x,y)$: $z=X(x)Y(y)$, $\dfrac{X''-2X'}{X}=-\dfrac{Y'}{Y}=k$.`,
      r`$Y=ce^{-ky}$; $X''-2X'-kX=0$, $m=1\pm\sqrt{1+k}$.`,
      r`Typical answer: $z=\big(c_1e^{(1+\sqrt{1+k})x}+c_2e^{(1-\sqrt{1+k})x}\big)e^{-ky}$ (with the $k=-1$ and $k<-1$ forms as in J23 S3 Q10(a)).`,
    ],
    answer: r`$z=\big(c_1e^{(1+\sqrt{1+k})x}+c_2e^{(1-\sqrt{1+k})x}\big)e^{-ky}$ (plus the repeated/complex-root forms)`,
    note: 'Same structure as J23 S3 Q10(a); cases checked on sample values of k.',
    group: 'sep-zxx-2zx-zy',
  }),
  q({
    file: 'jul', set: 1, qn: '10(b)', page: 2, marks: 7, unit: 5, topic: 'u5-pi-exp',
    title: '(D³ − 4D²D′ + 5DD′² − 2D′³)z = e^{2x+y} + e^{x+y}',
    question: r`Solve the P.D.E $\big(D^3-4D^2D'+5DD'^2-2D'^3\big)z=e^{2x+y}+e^{x+y}$`,
    steps: [
      r`A.E. $m^3-4m^2+5m-2=(m-1)^2(m-2)$. C.F. $=f_1(y+x)+xf_2(y+x)+f_3(y+2x)$.`,
      r`Factor: $f(D,D')=(D-D')^2(D-2D')$.`,
      r`$e^{2x+y}$: $\dfrac{1}{(D-D')^2}e^{2x+y}=\dfrac{e^{2x+y}}{(2-1)^2}=e^{2x+y}$; then $\dfrac1{D-2D'}e^{2x+y}$ fails ($2-2=0$) ⇒ $xe^{2x+y}$.`,
      r`$e^{x+y}$: $\dfrac{1}{D-2D'}e^{x+y}=\dfrac{e^{x+y}}{1-2}=-e^{x+y}$; then $\dfrac{1}{(D-D')^2}(-e^{x+y})$ fails twice ⇒ $-\dfrac{x^2}{2}e^{x+y}$.`,
    ],
    answer: r`$z=f_1(y+x)+xf_2(y+x)+f_3(y+2x)+xe^{2x+y}-\dfrac{x^2}{2}e^{x+y}$`,
    difficulty: 'hard',
  }),
];

/** Papers that were actually examined (only uploaded files — web copies could not be opened). */
export const examinedPapers = [
  {
    id: 'J23-S1', file: JAN_FILE, pages: '1–2', exam: 'January 2023', type: 'Regular/Supplementary', set: 'Set 1',
    code: 'R2021011', regulation: 'R20', duration: '3 hours', maxMarks: 70, branches: 'Com to all branches, Except EEE & FE',
  },
  { id: 'J23-S2', file: JAN_FILE, pages: '3–4', exam: 'January 2023', type: 'Regular/Supplementary', set: 'Set 2', code: 'R2021011', regulation: 'R20', duration: '3 hours', maxMarks: 70, branches: 'Com to all branches, Except EEE & FE' },
  { id: 'J23-S3', file: JAN_FILE, pages: '5–6', exam: 'January 2023', type: 'Regular/Supplementary', set: 'Set 3', code: 'R2021011', regulation: 'R20', duration: '3 hours', maxMarks: 70, branches: 'Com to all branches, Except EEE & FE' },
  { id: 'J23-S4', file: JAN_FILE, pages: '7–8', exam: 'January 2023', type: 'Regular/Supplementary', set: 'Set 4', code: 'R2021011', regulation: 'R20', duration: '3 hours', maxMarks: 70, branches: 'Com to all branches, Except EEE & FE' },
  { id: 'JUL23-S1', file: JUL_FILE, pages: '1–2', exam: 'July 2023', type: 'Supplementary', set: 'Set 1', code: 'R2021011', regulation: 'R20', duration: '3 hours', maxMarks: 70, branches: 'Com to all branches' },
] as const;

export type PaperId = (typeof examinedPapers)[number]['id'];

export function paperIdOf(q: Question): PaperId | null {
  if (q.sourceType !== 'uploaded_past_paper' || !q.exam) return null;
  const prefix = q.exam.date.startsWith('January') ? 'J23' : 'JUL23';
  return `${prefix}-S${q.exam.set.replace('Set ', '')}` as PaperId;
}

/** Main question number ("1(a)" → 1). Papers pair Q(2k−1) OR Q(2k) for unit k. */
export function mainNumber(q: Question): number {
  return parseInt(q.exam?.questionNumber ?? '0', 10);
}
