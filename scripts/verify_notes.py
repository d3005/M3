"""Symbolic checks of the worked examples taken from the uploaded Unit 4 and Unit 5 notes
(M3_R20_-_UNIT-4_Ref-2.pdf, M3_R20_-_UNIT-5_ref-2.pdf). Page numbers are PDF page indices.

Run:  python3 scripts/verify_notes.py
"""
import sys
from sympy import (symbols, Function, diff, simplify, sqrt, Rational, sin, cos, tan, exp, log, asinh, acosh, I, N)

x, y, z, t, a, b, c = symbols('x y z t a b c', positive=True)
X, Y, Z = symbols('X Y Z', real=True)
A, B = symbols('A B', positive=True)
fails, count = [], 0


def check(name, expr):
    """expr must simplify to 0."""
    global count
    count += 1
    d = simplify(expr)
    ok = d == 0
    if not ok:
        try:
            import random
            ok = True
            for _ in range(3):
                sub = {v: Rational(random.randint(11, 29), 10) for v in d.free_symbols}
                if abs(complex(N(d.subs(sub)))) > 1e-8:
                    ok = False
        except Exception:
            ok = False
    print(("ok   " if ok else "FAIL ") + name)
    if not ok:
        fails.append(name)


P = lambda e: diff(e, x)
Q = lambda e: diff(e, y)
f, g = Function('f'), Function('g')

# ---- Unit 4: formation by eliminating constants (pp. 2-10)
e = A*x + B*y + A**2 + B**2; check("U4 p2 z=ax+by+a^2+b^2", P(e)*x + Q(e)*y + P(e)**2 + Q(e)**2 - e)
e = (x**2/A**2 + y**2/B**2)/2; check("U4 p2 2z=x^2/a^2+y^2/b^2", P(e)*x + Q(e)*y - 2*e)
e = c + sqrt(A**2 - x**2 - y**2); check("U4 p3 spheres centre on z-axis: yp-xq=0", y*P(e) - x*Q(e))
e = x*y + y*sqrt(x**2 - A**2) + B; check("U4 p6 px+qy=pq", P(e)*x + Q(e)*y - P(e)*Q(e))
e = A*x*exp(y) + A**2*exp(2*y)/2 + B; check("U4 p7 q=px+p^2", Q(e) - P(e)*x - P(e)**2)
e = (1 + exp(x + A*y + B))/A; check("U4 p8 p(1+q)=qz", P(e)*(1 + Q(e)) - Q(e)*e)
e = A*log(B*(y - 1)/(1 - x))
check("U4 p9 px+qy=p+q", (P(e)*x + Q(e)*y - P(e) - Q(e)).subs(x, Rational(1, 2)).subs(y, 3))
e = c + sqrt(64 - x**2 - (y - B)**2); check("U4 p10 x^2(p^2+q^2+1)=64p^2", x**2*(P(e)**2 + Q(e)**2 + 1) - 64*P(e)**2)
# ---- eliminating functions (pp. 11-18)
e = f(y/x); check("U4 p12 z=f(y/x): px+qy=0", P(e)*x + Q(e)*y)
gg = Function('G'); e = gg(x**2 + y**2) + x*y   # z - xy = G(x^2+y^2)
check("U4 p12-14 f(x^2+y^2, z-xy)=0: yp-xq=y^2-x^2", y*P(e) - x*Q(e) - (y**2 - x**2))
e = f(x) + exp(y)*g(x); check("U4 p13 q=t", Q(e) - diff(e, y, 2))
e = exp(a*x + b*y)*f(a*x - b*y); check("U4 p15-16 bp+aq=2abz", b*P(e) + a*Q(e) - 2*a*b*e)
e = f(x + I*y) + g(x - I*y); check("U4 p17 r+t=0", diff(e, x, 2) + diff(e, y, 2))
e = y*f(x) + x*g(y); check("U4 p18 px+qy=xys+z", P(e)*x + Q(e)*y - x*y*diff(e, x, y) - e)
# xyz = F(x^2+y^2+z^2) -> x(y^2-z^2)p + y(z^2-x^2)q = z(x^2-y^2) via Jacobians
u, v = X*Y*Z, X**2 + Y**2 + Z**2
Pj = diff(u, Y)*diff(v, Z) - diff(u, Z)*diff(v, Y); Qj = diff(u, Z)*diff(v, X) - diff(u, X)*diff(v, Z); Rj = diff(u, X)*diff(v, Y) - diff(u, Y)*diff(v, X)
check("U4 p14-15 xyz=f(...): P", Pj + 2*X*(Y**2 - Z**2)); check("U4 p14-15 Q", Qj + 2*Y*(Z**2 - X**2)); check("U4 p14-15 R", Rj + 2*Z*(X**2 - Y**2))

# ---- Lagrange (pp. 20-26): first integrals w satisfy P w_x + Q w_y + R w_z = 0
def fi(Pv, Qv, Rv, w): return Pv*diff(w, X) + Qv*diff(w, Y) + Rv*diff(w, Z)
Xp, Yp, Zp = symbols('Xp Yp Zp', positive=True)
def fip(Pv, Qv, Rv, w): return Pv*diff(w, Xp) + Qv*diff(w, Yp) + Rv*diff(w, Zp)
check("U4 p21 sqrt: u", fip(sqrt(Xp), sqrt(Yp), sqrt(Zp), sqrt(Xp) - sqrt(Yp)))
check("U4 p21 sqrt: v", fip(sqrt(Xp), sqrt(Yp), sqrt(Zp), sqrt(Yp) - sqrt(Zp)))
check("U4 p22 tan: u", fi(tan(X), tan(Y), tan(Z), sin(X)/sin(Y)))
check("U4 p22 tan: v", fi(tan(X), tan(Y), tan(Z), sin(Y)/sin(Z)))
check("U4 p23 y^2z/x: u", fi(Y**2*Z/X, X*Z, Y**2, X**3 - Y**3)); check("U4 p23 y^2z/x: v", fi(Y**2*Z/X, X*Z, Y**2, X**2 - Z**2))
check("U4 p23-24 x^2(y-z): u", fi(X**2*(Y - Z), Y**2*(Z - X), Z**2*(X - Y), X*Y*Z))
check("U4 p23-24 x^2(y-z): v", fi(X**2*(Y - Z), Y**2*(Z - X), Z**2*(X - Y), 1/X + 1/Y + 1/Z))
check("U4 p24-25 xp-yq=y^2-x^2: u", fi(X, -Y, Y**2 - X**2, X*Y)); check("U4 p25 v", fi(X, -Y, Y**2 - X**2, X**2 + Y**2 + 2*Z))
check("U4 p25 (y^2+z^2)p-xyq=-zx: u", fi(Y**2 + Z**2, -X*Y, -Z*X, Y/Z)); check("U4 p25-26 v", fi(Y**2 + Z**2, -X*Y, -Z*X, X**2 + Y**2 + Z**2))
check("U4 p26 (x^2-y^2-z^2)p+2xyq=2xz: u", fi(X**2 - Y**2 - Z**2, 2*X*Y, 2*X*Z, Y/Z))
check("U4 p26 v", fi(X**2 - Y**2 - Z**2, 2*X*Y, 2*X*Z, (X**2 + Y**2 + Z**2)/Z))

# ---- Non-linear standard forms (pp. 27-40)
e = A*x + sqrt(1 - A**2)*y + c; check("U4 p27-28 p^2+q^2=1", P(e)**2 + Q(e)**2 - 1)
e = A*x - A/(A + 1)*y + c; check("U4 p28 pq+p+q=0", P(e)*Q(e) + P(e) + Q(e))
e = A*log(x) + sqrt(1 - A**2)*log(y) + c; check("U4 p31-32 x^2p^2+y^2q^2=1", x**2*P(e)**2 + y**2*Q(e)**2 - 1)
e = ((x + A*y)/sqrt(1 + A**2) + c)**2/4; check("U4 p32-33 z=p^2+q^2", e - P(e)**2 - Q(e)**2)
e = sqrt((x + A*y + c)**2 + A**2); check("U4 p33-34 q^2=z^2p^2(1-p^2)", Q(e)**2 - e**2*P(e)**2*(1 - P(e)**2))
e = exp((log(x) + A*log(y))/sqrt(1 + A**2) + c); check("U4 p34-35 x^2p^2+y^2q^2=z^2", x**2*P(e)**2 + y**2*Q(e)**2 - e**2)
e = x**2/(2*A) - y**2/(2*(1 + A)) + c; check("U4 p35-36 yp+xq+pq=0", y*P(e) + x*Q(e) + P(e)*Q(e))
e = x*sqrt(x**2 + A**2)/2 + A**2*asinh(x/A)/2 + y*sqrt(y**2 - A**2)/2 - A**2*acosh(y/A)/2 + c
check("U4 p36 p^2+q^2=x^2+y^2", P(e)**2 + Q(e)**2 - x**2 - y**2)
e = A*x + B*y - 2*sqrt(A*B); check("U4 p37 Clairaut z=px+qy-2sqrt(pq)", P(e)*x + Q(e)*y - 2*sqrt(P(e)*Q(e)) - e)
e = A*x + B*y + 1/(A + B); check("U4 p37-38 (p+q)(z-px-qy)=1", (P(e) + Q(e))*(e - P(e)*x - Q(e)*y) - 1)
e = A*x + B*y + A**3/B + B**3/A; check("U4 p38 pqz=p^2(qx+p^2)+q^2(py+q^2)", P(e)*Q(e)*e - P(e)**2*(Q(e)*x + P(e)**2) - Q(e)**2*(P(e)*y + Q(e)**2))
e = sqrt(2*((A + 1)/(3*A)*(x**3 + A*y**3) + c)); check("U4 p39 x^2/p+y^2/q=z", x**2/P(e) + y**2/Q(e) - e)

# ---- Unit 5: homogeneous linear PDE (pp. 2-33)
F1, F2, F3, F4 = (Function(n) for n in ('f1', 'f2', 'f3', 'f4'))
def dxy(e, i, j):
    out = e
    if i: out = diff(out, x, i)
    if j: out = diff(out, y, j)
    return out
def L(coeffs, e): return sum(cf*dxy(e, i, j) for (i, j), cf in coeffs.items())
check("U5 p3 2r+5s+2t=0", L({(2, 0): 2, (1, 1): 5, (0, 2): 2}, F1(y - x/2) + F2(y - 2*x)))
check("U5 p3-4 4r+12s+9t=0", L({(2, 0): 4, (1, 1): 12, (0, 2): 9}, F1(2*y - 3*x) + x*F2(2*y - 3*x)))
check("U5 p4 D^3-4D^2D'+4DD'^2", L({(3, 0): 1, (2, 1): -4, (1, 2): 4}, F1(y) + F2(y + 2*x) + x*F3(y + 2*x)))
check("U5 p5 D^3+2D^2D'-DD'^2-2D'^3", L({(3, 0): 1, (2, 1): 2, (1, 2): -1, (0, 3): -2}, F1(y + x) + F2(y - x) + F3(y - 2*x)))
check("U5 p5 D^4-D'^4", L({(4, 0): 1, (0, 4): -1}, F1(y + x) + F2(y - x) + F3(y + I*x) + F4(y - I*x)))
check("U5 p6 D^3-4D^2D'+3DD'^2", L({(3, 0): 1, (2, 1): -4, (1, 2): 3}, F1(y) + F2(y + x) + F3(y + 3*x)))
check("U5 p8-9 PI e^{x+2y}/27", L({(3, 0): 1, (2, 1): -3, (0, 3): 4}, exp(x + 2*y)/27) - exp(x + 2*y))
check("U5 p8-9 CF", L({(3, 0): 1, (2, 1): -3, (0, 3): 4}, F1(y - x) + F2(y + 2*x) + x*F3(y + 2*x)))
check("U5 p9 PI 2cos(3x+2y)", L({(3, 0): 1, (2, 1): -4, (1, 2): 4}, 2*cos(3*x + 2*y)) - 6*sin(3*x + 2*y))
check("U5 p10-11 PI (2x+y)^{5/2}/15", L({(2, 0): 1, (1, 1): 1, (0, 2): -2}, (2*x + y)**Rational(5, 2)/15) - sqrt(2*x + y))
check("U5 p11-12 sin x cos 2y", L({(2, 0): 1, (1, 1): -1}, sin(x + 2*y)/2 - sin(x - 2*y)/6) - sin(x)*cos(2*y))
check("U5 p13 (D-D')^2 e^{x+y}", L({(2, 0): 1, (1, 1): -2, (0, 2): 1}, x**2/2*exp(x + y)) - exp(x + y))
check("U5 p14 cos(2x+y)", L({(2, 0): 1, (1, 1): 1, (0, 2): -6}, x*sin(2*x + y)/5) - cos(2*x + y))
check("U5 p15 1/(y-2x)", L({(2, 0): 1, (1, 1): 5, (0, 2): 6}, x*log(y - 2*x)) - 1/(y - 2*x))
check("U5 p16 16 log(x+2y)", L({(2, 0): 4, (1, 1): -4, (0, 2): 1}, 2*x**2*log(x + 2*y)) - 16*log(x + 2*y))
check("U5 p17 (D-2D')(D-D')^2 e^{x+y}", L({(3, 0): 1, (2, 1): -4, (1, 2): 5, (0, 3): -2}, -x**2/2*exp(x + y)) - exp(x + y))
check("U5 p18-20 x^m y^n", L({(3, 0): 1, (2, 1): -2}, exp(2*x)/4 + x**5*y/20 + x**6/60) - (2*exp(2*x) + 3*x**2*y))
check("U5 p21-22 12x^2+36xy", L({(2, 0): 1, (1, 1): -6, (0, 2): 9}, 10*x**4 + 6*x**3*y) - (12*x**2 + 36*x*y))
check("U5 p27-29 (y-1)e^x", L({(2, 0): 1, (1, 1): -1, (0, 2): -2}, y*exp(x)) - (y - 1)*exp(x))
check("U5 p29-30 y cos x", L({(2, 0): 1, (1, 1): 1, (0, 2): -6}, sin(x) - y*cos(x)) - y*cos(x))
# ---- non-homogeneous (pp. 34-45)
check("U5 p36 CF", L({(2, 0): 1, (1, 1): -2, (0, 2): 1, (1, 0): -3, (0, 1): 3, (0, 0): 2}, exp(x)*F1(y + x) + exp(2*x)*F2(y + x)))
check("U5 p36-37 D^2-DD'+D'-1 CF", L({(2, 0): 1, (1, 1): -1, (0, 1): 1, (0, 0): -1}, exp(x)*F1(y) + exp(-x)*F2(y + x)))
check("U5 p37 PI sin(x+2y)/2", L({(2, 0): 1, (1, 1): -1, (0, 1): 1, (0, 0): -1}, sin(x + 2*y)/2) - cos(x + 2*y))
check("U5 p39-40 (D-3D'-2)^2", L({(2, 0): 1, (1, 1): -6, (0, 2): 9, (1, 0): -4, (0, 1): 12, (0, 0): 4}, x**2*exp(2*x)*tan(y + 3*x)) - 2*exp(2*x)*tan(y + 3*x))
check("U5 p40-41 D^2-DD'-2D", L({(2, 0): 1, (1, 1): -1, (1, 0): -2}, (sin(3*x + 4*y) + 2*cos(3*x + 4*y))/15) - sin(3*x + 4*y))
check("U5 p40 CF D(D-D'-2)", L({(2, 0): 1, (1, 1): -1, (1, 0): -2}, F1(y) + exp(2*x)*F2(y + x)))
check("U5 p41-42 r-s+p=1", L({(2, 0): 1, (1, 1): -1, (1, 0): 1}, F1(y) + exp(-x)*F2(y + x) + x) - 1)
check("U5 p42-44 (D+D'-1)(D+2D'-3)", L({(2, 0): 1, (1, 1): 3, (0, 2): 2, (1, 0): -4, (0, 1): -5, (0, 0): 3}, x + 2*y + 6) - (4 + 3*x + 6*y))
check("U5 p42-44 CF", L({(2, 0): 1, (1, 1): 3, (0, 2): 2, (1, 0): -4, (0, 1): -5, (0, 0): 3}, exp(x)*F1(y - x) + exp(3*x)*F2(y - 2*x)))
op3 = {(3, 0): 1, (2, 1): -9, (1, 2): 27, (0, 3): -27, (2, 0): -6, (1, 1): 36, (0, 2): -54, (1, 0): 12, (0, 1): -36, (0, 0): -8}
check("U5 p45 (D-3D'-2)^3", L(op3, x**3*exp(2*x)*sin(3*x + y)) - 6*exp(2*x)*sin(3*x + y))
# ---- separation of variables (pp. 47-50)
lam = symbols('lam')
e = exp(lam*(x**3/3 - y**4/4)); check("U5 p47-48 y^3 z_x + x^2 z_y = 0", y**3*P(e) + x**2*Q(e))
e = sin(x)*(1 - exp(-t)); check("U5 p49-50 u_xt = e^-t cos x", diff(e, x, t) - exp(-t)*cos(x))
check("U5 p50 u(x,0)=0", e.subs(t, 0)); check("U5 p50 u(0,t)=0", e.subs(x, 0))

# ---- Unit 3 notes (M3_R20_-_UNIT-3.pdf, typed)
from sympy import integrate, pi, oo, atan
n = symbols('n', integer=True, positive=True)
pp_, l_ = symbols('pp l_', positive=True)
check("U3 p2-3 x on (-pi,pi): b_n", integrate(x*sin(n*x), (x, -pi, pi))/pi - 2*(-1)**(n + 1)/n)
from sympy import Sum, oo as OO
k = symbols('k', integer=True, nonnegative=True)
check("U3 p16 sum (-1)^k/(2k+1)^3 = pi^3/32", Sum((-1)**k/(2*k + 1)**3, (k, 0, OO)).doit() - pi**3/32)
check("U3 p20 x+x^2 on (0,3): a0", Rational(2, 3)*integrate(x + x**2, (x, 0, 3)) - 9)
check("U3 p20 a_n", Rational(2, 3)*integrate((x + x**2)*cos(2*n*pi*x/3), (x, 0, 3)) - 9/(n**2*pi**2))
check("U3 p20 b_n", Rational(2, 3)*integrate((x + x**2)*sin(2*n*pi*x/3), (x, 0, 3)) + 12/(n*pi))
check("U3 p20 x^3 on [-1,1]: b_n", 2*integrate(x**3*sin(n*pi*x), (x, 0, 1)) - 2*(-1)**(n + 1)*(n**2*pi**2 - 6)/(n**3*pi**3))
check("U3 p22 HR cosine of sin(pi x/l): a0", 2/l_*integrate(sin(pi*x/l_), (x, 0, l_)) - 4/pi)
check("U3 p22 a_2", 2/l_*integrate(sin(pi*x/l_)*cos(2*pi*x/l_), (x, 0, l_)) + 4/(3*pi))
check("U3 p32 Fc of 2e^-3x + 3e^-2x", integrate((2*exp(-3*x) + 3*exp(-2*x))*cos(pp_*x), (x, 0, oo)) - (6/(pp_**2 + 9) + 6/(pp_**2 + 4)))
check("U3 p34 Fs of e^-x", integrate(exp(-x)*sin(pp_*x), (x, 0, oo)) - pp_/(1 + pp_**2))
check("U3 p34 Fs triangle", integrate(x*sin(pp_*x), (x, 0, 1)) + integrate((2 - x)*sin(pp_*x), (x, 1, 2)) - 2*sin(pp_)*(1 - cos(pp_))/pp_**2)
check("U3 p40 Fc 1/(x^2+a^2)", integrate(cos(pp_*x)/(x**2 + a**2), (x, 0, oo)) - pi/(2*a)*exp(-a*pp_))
check("U3 p40 finite Fs of 2x on (0,2pi)", integrate(2*x*sin(n*x/2), (x, 0, 2*pi)) - 8*pi*(-1)**(n + 1)/n)
check("U3 p40 finite Fc of 2x on (0,2pi)", integrate(2*x*cos(n*x/2), (x, 0, 2*pi)) - 8*((-1)**n - 1)/n**2)
check("U3 p26 cosine integral of 1 on [0,pi]", 2/pi*integrate(cos(pp_*x), (x, 0, pi)) - 2*sin(pi*pp_)/(pi*pp_))

print(f"\n{count - len(fails)}/{count} checks passed")
sys.exit(1 if fails else 0)
