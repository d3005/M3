"""Symbolic verification of the worked solutions to the uploaded past-paper questions
(January 2023 Sets 1-4 and July 2023 Set 1, code R2021011).

Run:  python3 scripts/verify_papers.py      (requires sympy)
"""
import sys
from sympy import (symbols, Function, diff, integrate, simplify, sqrt, Rational, pi, sin, cos, exp, log,
                   sinh, cosh, asinh, acosh, oo, Matrix, laplace_transform, inverse_laplace_transform,
                   Heaviside, N, solve, expand, trigsimp, atan, tan)

x, y, z, t, s, u, a, b, c, k, l, lam, p = symbols('x y z t s u a b c k l lam p', positive=True)
X, Y, Z = symbols('X Y Z', real=True)
n = symbols('n', integer=True, positive=True)
fails, count = [], 0


def _numeric_zero(d):
    """Fallback: evaluate at a few positive sample points (n -> integer samples)."""
    import random
    syms = sorted(d.free_symbols, key=str)
    for trial in range(3):
        sub = {}
        for v in syms:
            sub[v] = random.randint(1, 5) if v.is_integer else Rational(random.randint(11, 29), 10)
        val = complex(N(d.subs(sub)))
        if abs(val) > 1e-8:
            return False
    return True


def check(name, got, expected):
    global count
    count += 1
    d = simplify(got - expected)
    zero = d.is_zero_matrix if hasattr(d, 'is_zero_matrix') else d == 0
    if not zero:
        try:
            zero = all(_numeric_zero(e) for e in d) if hasattr(d, 'is_zero_matrix') else _numeric_zero(d)
        except Exception:
            zero = False
    if zero:
        print(f"ok   {name}")
    else:
        fails.append(name); print(f"FAIL {name}: got {simplify(got)} expected {expected}")


def grad(f): return Matrix([diff(f, v) for v in (X, Y, Z)])
def div(F): return sum(diff(F[i], v) for i, v in enumerate((X, Y, Z)))
def curl(F):
    P, Q, R = F
    return Matrix([diff(R, Y) - diff(Q, Z), diff(P, Z) - diff(R, X), diff(Q, X) - diff(P, Y)])
def line(F, rr, t0, t1):
    Fv = F.subs({X: rr[0], Y: rr[1], Z: rr[2]})
    return integrate(sum(Fv[i]*diff(rr[i], t) for i in range(3)), (t, t0, t1))
LT = lambda f: laplace_transform(f, t, s, noconds=True)
ILT = lambda F: inverse_laplace_transform(F, s, t)
def dxy(e, i, j):
    r = e
    if i: r = diff(r, x, i)
    if j: r = diff(r, y, j)
    return r
def apply(coeffs, e): return simplify(sum(cf*dxy(e, i, j) for (i, j), cf in coeffs.items()))
def ode_residual(eq, sol): return simplify(eq(sol))
def first_integral(P, Q, R, w): return simplify(P*diff(w, X) + Q*diff(w, Y) + R*diff(w, Z))
th = symbols('th')

# ===== January 2023 SET 1 =====
# 1a Stokes: curl(y,z,x) = (-1,-1,-1); plane x+z=a, n=(1,0,1)/sqrt2; circle radius a/sqrt2
check("J1-1a curl", curl(Matrix([Y, Z, X])), Matrix([-1, -1, -1]))
check("J1-1a value", (Matrix([-1, -1, -1]).T*Matrix([1, 0, 1]))[0]/sqrt(2)*pi*a**2/2, -pi*a**2/sqrt(2))
# direct line-integral check of 1a: centre (a/2,0,a/2), radius a/sqrt2, e1=(1,0,-1)/sqrt2, e2=(0,1,0)
R0 = a/sqrt(2)
rr = (a/2 + R0*cos(t)/sqrt(2), R0*sin(t), a/2 - R0*cos(t)/sqrt(2))
check("J1-1a on sphere", simplify(rr[0]**2 + rr[1]**2 + rr[2]**2), a**2)
check("J1-1a line integral (orientation e1->e2)", line(Matrix([Y, Z, X]), rr, 0, 2*pi), -pi*a**2/sqrt(2))
F = Matrix([X**2 - Y*Z, Y**2 - Z*X, Z**2 - X*Y])
check("J1-1b curl 0", curl(F), Matrix([0, 0, 0]))
check("J1-1b potential", grad((X**3 + Y**3 + Z**3)/3 - X*Y*Z) - F, Matrix([0, 0, 0]))
Fp = Matrix([12*X**2*Y, -3*Y*Z, 2*Z]).subs(Z, 1 - X - Y)
check("J1-2a flux plane", integrate(integrate(Fp[0] + Fp[1] + Fp[2], (Y, 0, 1 - X)), (X, 0, 1)), Rational(49, 120))
r = sqrt(X**2 + Y**2 + Z**2); m = symbols('m')
check("J1-2b laplacian r^n", simplify(sum(diff(r**m, v, 2) for v in (X, Y, Z)) - m*(m + 1)*r**(m - 2)), 0)
xs = 1*cos(3*t) + sin(t)/8 - Rational(7, 8)*sin(3*t)
check("J1-3a ODE", ode_residual(lambda f: diff(f, t, 2) + 9*f - sin(t), xs), 0)
check("J1-3a x(0)", xs.subs(t, 0), 1); check("J1-3a x(pi/2)", xs.subs(t, pi/2), 1)
check("J1-3a a = x'(0)", diff(xs, t).subs(t, 0), Rational(-5, 2))
check("J1-3b", ILT((2 + 5*s)*exp(-4*s)/s**2), (2*t - 3)*Heaviside(t - 4))
ys = 2*sin(2*t) - 2*sin(t)
check("J1-4a (y'(0)=2 reading) ODE", ode_residual(lambda f: diff(f, t, 4) - 16*f - 30*sin(t), ys), 0)
check("J1-4a y(0)", ys.subs(t, 0), 0); check("J1-4a y'(0)", diff(ys, t).subs(t, 0), 2)
check("J1-4a y''(pi)", diff(ys, t, 2).subs(t, pi), 0); check("J1-4a y'''(pi)", diff(ys, t, 3).subs(t, pi), -18)
A_, B_, C_, D_ = symbols('A B C D')
yg = A_*exp(2*t) + B_*exp(-2*t) + C_*cos(2*t) + D_*sin(2*t) - 2*sin(t)
sol = solve([yg.subs(t, 0), diff(yg, t).subs(t, 0) + 18, diff(yg, t, 2).subs(t, pi), diff(yg, t, 3).subs(t, pi) + 18], [A_, B_, C_, D_], dict=True)[0]
print("     J1-4a as-printed constants:", {kk: simplify(v) for kk, v in sol.items()})
yp = yg.subs(sol)
check("J1-4a as printed ODE", ode_residual(lambda f: diff(f, t, 4) - 16*f - 30*sin(t), yp), 0)
check("J1-4a as printed y'(0)", diff(yp, t).subs(t, 0), -18)
check("J1-4b", integrate(1/u - 1/(u + 1), (u, s, oo))/s, log((s + 1)/s)/s)
# 5a
a0 = (integrate(x, (x, 0, pi)) + integrate(2*pi - x, (x, pi, 2*pi)))/pi
an = simplify((integrate(x*cos(n*x), (x, 0, pi)) + integrate((2*pi - x)*cos(n*x), (x, pi, 2*pi)))/pi)
bn = simplify((integrate(x*sin(n*x), (x, 0, pi)) + integrate((2*pi - x)*sin(n*x), (x, pi, 2*pi)))/pi)
check("J1-5a a0", a0, pi); check("J1-5a an", an, 2*((-1)**n - 1)/(pi*n**2)); check("J1-5a bn", bn, 0)
check("J1-5b sine coefficient", 2/pi*integrate((exp(-a*t) - exp(-b*t))*sin(lam*t), (t, 0, oo)),
      2/pi*(b**2 - a**2)*lam/((lam**2 + a**2)*(lam**2 + b**2)))
a0 = integrate(x, (x, -1, 0)) + integrate(x + 2, (x, 0, 1))
an = simplify(integrate(x*cos(n*pi*x), (x, -1, 0)) + integrate((x + 2)*cos(n*pi*x), (x, 0, 1)))
bn = simplify(integrate(x*sin(n*pi*x), (x, -1, 0)) + integrate((x + 2)*sin(n*pi*x), (x, 0, 1)))
check("J1-6a a0", a0, 2); check("J1-6a an", an, 0); check("J1-6a bn", bn, 2*(1 - 2*(-1)**n)/(n*pi))
check("J1-6b sine-integral coefficient", 2/pi*integrate(sin(lam*t), (t, 0, pi)), 2/pi*(1 - cos(pi*lam))/lam)
# 7a: f(xyz, x+y)=0  -> xy(p-q) = z(x-y); test with xyz = g(x+y)
g = Function('g')
zz = g(x + y)/(x*y)
check("J1-7a", simplify(x*y*(diff(zz, x) - diff(zz, y)) - zz*(x - y)), 0)
A = symbols('A', positive=True)
Zsq = x*sqrt(x**2 + A**2) + A**2*asinh(x/A) + y*sqrt(y**2 - A**2) - A**2*acosh(y/A)
zz = sqrt(Zsq)
check("J1-7b z^2(p^2+q^2)=x^2+y^2", simplify(zz**2*(diff(zz, x)**2 + diff(zz, y)**2) - x**2 - y**2), 0)
uu, vv = X + Y + Z, X**2 + Y**2 + Z**2
P = diff(uu, Y)*diff(vv, Z) - diff(uu, Z)*diff(vv, Y); Q = diff(uu, Z)*diff(vv, X) - diff(uu, X)*diff(vv, Z); R = diff(uu, X)*diff(vv, Y) - diff(uu, Y)*diff(vv, X)
check("J1-8a P", P/2, Z - Y); check("J1-8a Q", Q/2, X - Z); check("J1-8a R", R/2, Y - X)
check("J1-8b u", first_integral(X*Z, -Y*Z, Y**2 - X**2, X*Y), 0)
check("J1-8b v", first_integral(X*Z, -Y*Z, Y**2 - X**2, X**2 + Y**2 + Z**2), 0)
F1, F2, F3 = Function('f1'), Function('f2'), Function('f3')
L = {(3, 0): 1, (2, 1): -4, (1, 2): 4}
check("J1-9a CF", apply(L, F1(y) + F2(y + 2*x) + x*F3(y + 2*x)), 0)
check("J1-9a PI", apply(L, Rational(2, 3)*cos(3*x + 2*y)), 2*sin(3*x + 2*y))
check("J1-9a notes example (6 sin)", apply(L, 2*cos(3*x + 2*y)), 6*sin(3*x + 2*y))
U = 4*exp(-x + 3*t)
check("J1-9b PDE", simplify(2*diff(U, t) + 3*diff(U, x) - 3*U), 0); check("J1-9b IC", U.subs(t, 0), 4*exp(-x))
U = sinh(sqrt(2)*x)/sqrt(2) + exp(-3*y)*sin(x)
check("J1-10a PDE", simplify(diff(U, y) + 2*U - diff(U, x, 2)), 0)
check("J1-10a u(0,y)", U.subs(x, 0), 0); check("J1-10a u_x(0,y)", simplify(diff(U, x).subs(x, 0)), 1 + exp(-3*y))
L = {(2, 0): 1, (1, 1): -2, (0, 2): 1}
check("J1-10b CF", apply(L, F1(y + x) + x*F2(y + x)), 0)
check("J1-10b PI", apply(L, x**2/2*sin(2*x + 2*y)), sin(2*x + 2*y))

# ===== January 2023 SET 2 =====
check("J2-2b", simplify(grad(div(Matrix([X, Y, Z])/r)) + 2*Matrix([X, Y, Z])/r**3), Matrix([0, 0, 0]))
ys = exp(t) - cos(t) + sin(t)
check("J2-3a ODE", ode_residual(lambda f: diff(f, t, 2) + f - 2*exp(t), ys), 0)
check("J2-3a y(0)", ys.subs(t, 0), 0); check("J2-3a y'(0)", diff(ys, t).subs(t, 0), 2)
check("J2-3b", LT(t*integrate(exp(-u)*sin(2*u), (u, 0, t))), 2*(3*s**2 + 4*s + 5)/(s**2*(s**2 + 2*s + 5)**2))
ys = Rational(3, 2) - exp(-2*t)/2
check("J2-4a ODE", ode_residual(lambda f: diff(f, t, 2) + 3*diff(f, t) + 2*f - 3, ys), 0)
check("J2-4a y(0)", ys.subs(t, 0), 1); check("J2-4a y'(0)", diff(ys, t).subs(t, 0), 1)
check("J2-4b", integrate(2/(u*(u**2 + 4)), (u, a, oo)), log((a**2 + 4)/a**2)/4)
check("J2-5a bn", simplify(2/pi*integrate((x + pi)*sin(n*x), (x, 0, pi))), 2*(1 - 2*(-1)**n)/n)
check("J2-6a a0", integrate(x*(2 - x), (x, 0, 2)), Rational(4, 3))
check("J2-6a an", simplify(integrate(x*(2 - x)*cos(n*pi*x/2), (x, 0, 2))), -8*(1 + (-1)**n)/(n**2*pi**2))
xr = symbols('xr', real=True)
check("J2-6b", integrate(exp(-xr**2/2)*cos(p*xr), (xr, -oo, oo)), sqrt(2*pi)*exp(-p**2/2))
check("J2-7a u", first_integral(X**2 - Y**2 - Y*Z, X**2 - Y**2 - Z*X, Z*(X - Y), X - Y - Z), 0)
check("J2-7a v", first_integral(X**2 - Y**2 - Y*Z, X**2 - Y**2 - Z*X, Z*(X - Y), (X**2 - Y**2)/Z**2), 0)
f, g = Function('f'), Function('g')
zz = y*f(x) + x*g(y)
check("J2-7b", simplify(x*diff(zz, x) + y*diff(zz, y) - x*y*diff(zz, x, y) - zz), 0)
aa = Rational(3, 2); kk = (-1 + sqrt(1 + 4*aa**2))/(2*aa**2)
zz = x**kk*y**(aa*kk)
check("J2-8a q^2y^2 = z(z-px)", simplify(diff(zz, y)**2*y**2 - zz*(zz - diff(zz, x)*x)), 0)
An = 2/l*(integrate(2*k*x/l*sin(n*pi*x/l), (x, 0, l/2)) + integrate(2*k*(l - x)/l*sin(n*pi*x/l), (x, l/2, l)))
check("J2-9a An", simplify(An), 8*k*sin(n*pi/2)/(n**2*pi**2))
bn = 2/l*(integrate(x*sin(n*pi*x/l), (x, 0, l/2)) + integrate((l - x)*sin(n*pi*x/l), (x, l/2, l)))
check("J2-10a bn", simplify(bn), 4*l*sin(n*pi/2)/(n**2*pi**2))

# ===== January 2023 SET 3 =====
gf = grad(X**2 - Y**2 + 2*Z**2).subs({X: 1, Y: 2, Z: 3})
check("J3-1a", (gf.T*Matrix([4, -2, 1]))[0]/sqrt(21), 28/sqrt(21))
rho = symbols('rho', positive=True)
check("J3-1b", integrate(integrate(5*(rho*cos(th))**2*rho, (rho, 0, a)), (th, 0, 2*pi))*b, Rational(5, 4)*pi*a**4*b)
P_, Q_ = Y - sin(X), cos(X)
check("J3-2b Green", integrate(integrate(diff(Q_, X) - diff(P_, Y), (Y, 0, 2*X/pi)), (X, 0, pi/2)), -2/pi - pi/4)
Lg = (line(Matrix([Y - sin(X), cos(X), 0]), (t, 0, 0), 0, pi/2) + line(Matrix([Y - sin(X), cos(X), 0]), (pi/2, t, 0), 0, 1)
      + line(Matrix([Y - sin(X), cos(X), 0]), (pi/2*(1 - t), 1 - t, 0), 0, 1))
check("J3-2b line side", Lg, -2/pi - pi/4)
res = ILT(1/((s**2 + 4)*(s + 1)**2))
expct = (Rational(2, 25)*exp(-t) + t*exp(-t)/5 - Rational(2, 25)*cos(2*t) - Rational(3, 50)*sin(2*t))*Heaviside(t)
check("J3-3a", res, expct)
check("J3-3a convolution", integrate(sin(2*u)/2*(t - u)*exp(-(t - u)), (u, 0, t)), Rational(2, 25)*exp(-t) + t*exp(-t)/5 - Rational(2, 25)*cos(2*t) - Rational(3, 50)*sin(2*t))
check("J3-3b", ILT(3/s - 4*exp(-s)/s**2 + 4*exp(-3*s)/s**2), 3*Heaviside(t) - 4*(t - 1)*Heaviside(t - 1) + 4*(t - 3)*Heaviside(t - 3))
check("J3-4a", LT(cos(t) + (sin(t) - cos(t))*Heaviside(t - pi)), s/(s**2 + 1) + exp(-pi*s)*(s - 1)/(s**2 + 1))
ys = 4*exp(2*t) + 3*t*exp(2*t) + 3*exp(3*t) - 2*exp(5*t)
check("J3-4b ODE", ode_residual(lambda f: diff(f, t, 2) - 8*diff(f, t) + 15*f - 9*t*exp(2*t), ys), 0)
check("J3-4b y(0)", ys.subs(t, 0), 5); check("J3-4b y'(0)", diff(ys, t).subs(t, 0), 10)
check("J3-5a a0", 2*integrate(x*sin(x), (x, 0, pi))/pi, 2)
check("J3-5a a1", 2*integrate(x*sin(x)*cos(x), (x, 0, pi))/pi, Rational(-1, 2))
nn = symbols('nn', integer=True)
check("J3-5a an (n=3 sample)", 2*integrate(x*sin(x)*cos(3*x), (x, 0, pi))/pi, 2*(-1)**4/(9 - 1))
check("J3-5a an (n=4 sample)", 2*integrate(x*sin(x)*cos(4*x), (x, 0, pi))/pi, 2*(-1)**5/(16 - 1))
check("J3-5b coefficient", 2/pi*integrate(t*sin(lam*t), (t, 0, 1)), 2/pi*(sin(lam) - lam*cos(lam))/lam**2)
check("J3-6a a0", 2*integrate(pi*x, (x, 0, 1)), pi)
check("J3-6a an", simplify(integrate(pi*x*cos(n*pi*x), (x, 0, 1)) + integrate(pi*(2 - x)*cos(n*pi*x), (x, 1, 2))), 2*((-1)**n - 1)/(n**2*pi))
check("J3-6a bn", simplify(integrate(pi*x*sin(n*pi*x), (x, 0, 1)) + integrate(pi*(2 - x)*sin(n*pi*x), (x, 1, 2))), 0)
check("J3-6b", simplify(2/pi*(integrate(sin(x*t), (t, 0, 1)) + 2*integrate(sin(x*t), (t, 1, 2)))), 2*(1 + cos(x) - 2*cos(2*x))/(pi*x))
lm, mm, nm = 2, 3, 5
check("J3-7a u", first_integral(mm*Z - nm*Y, nm*X - lm*Z, lm*Y - mm*X, X**2 + Y**2 + Z**2), 0)
check("J3-7a v", first_integral(mm*Z - nm*Y, nm*X - lm*Z, lm*Y - mm*X, lm*X + mm*Y + nm*Z), 0)
zz = f(2*x + y) + g(3*x - y)
check("J3-7b r+s-6t=0", simplify(diff(zz, x, 2) + diff(zz, x, y) - 6*diff(zz, y, 2)), 0)
check("J3-8a printed: u", first_integral(X**2*(Y**2 - Z**2), Y**2*(Z**2 - X**2), Z**2*(X**2 - Y**2), 1/X + 1/Y + 1/Z), 0)
check("J3-8a reading A u", first_integral(X*(Y**2 - Z**2), Y*(Z**2 - X**2), Z*(X**2 - Y**2), X*Y*Z), 0)
check("J3-8a reading A v", first_integral(X*(Y**2 - Z**2), Y*(Z**2 - X**2), Z*(X**2 - Y**2), X**2 + Y**2 + Z**2), 0)
check("J3-8a reading B u", first_integral(X**2*(Y - Z), Y**2*(Z - X), Z**2*(X - Y), X*Y*Z), 0)
check("J3-8a reading B v", first_integral(X**2*(Y - Z), Y**2*(Z - X), Z**2*(X - Y), 1/X + 1/Y + 1/Z), 0)
zz = a*x + b*y + a/b - b
check("J3-8b", simplify(diff(zz, x)*x + diff(zz, y)*y + diff(zz, x)/diff(zz, y) - diff(zz, y) - zz), 0)
U = 6*exp(-3*x - 2*t)
check("J3-9a", simplify(diff(U, x) - 2*diff(U, t) - U), 0)
check("J3-9b bn", simplify(Rational(2, 20)*integrate((300 - 11*x)*sin(n*pi*x/20), (x, 0, 20))), 2*(300 - 80*(-1)**n)/(n*pi))
Uu = exp(u)*cos(2*u)*exp(5*t)   # sample from k=-5 branch: roots 1 +- 2i ; z(u,v) with v -> t
check("J3-10a sample k=-5", simplify(diff(Uu, u, 2) - 2*diff(Uu, u) + diff(Uu, t)), 0)
Uu = (1 + u)*exp(u)*exp(t)       # k=-1 branch: V = e^{v}
check("J3-10a sample k=-1", simplify(diff(Uu, u, 2) - 2*diff(Uu, u) + diff(Uu, t)), 0)
Uu = exp(3*u)*exp(-3*t)          # k=3: roots 1+-2 -> 3,-1 ; V = e^{-3v}
check("J3-10a sample k=3", simplify(diff(Uu, u, 2) - 2*diff(Uu, u) + diff(Uu, t)), 0)
L = {(2, 0): 1, (1, 1): 1, (0, 2): -6}
check("J3-10b PI", apply(L, sin(x) - y*cos(x)), y*cos(x))

# ===== January 2023 SET 4 =====
F = Matrix([2*X**2*Y, -Y**2, 4*X*Z**2])
dv = div(F).subs({Y: rho*cos(th), Z: rho*sin(th)})
vol = integrate(integrate(integrate(dv*rho, (rho, 0, 3)), (th, 0, pi/2)), (X, 0, 2))
check("J4-1a volume", vol, 180)
curved = integrate(integrate(((F[1]*Y + F[2]*Z)/3).subs({Y: 3*cos(th), Z: 3*sin(th)})*3, (th, 0, pi/2)), (X, 0, 2))
xface = integrate(integrate(8*rho*cos(th)*rho, (rho, 0, 3)), (th, 0, pi/2))  # x=2 face: F.i = 8y
check("J4-1a surface", curved + xface, 180)
n1 = Matrix([1, 4, -4]); n2 = Matrix([3, 3, 6])
check("J4-1b normals", grad(X*Y - Z**2).subs({X: 4, Y: 1, Z: 2}), n1)
check("J4-1b cos", (n1.T*n2)[0]/(n1.norm()*n2.norm()), -1/sqrt(22))
aS, bS = symbols('aS bS')
g1 = grad(aS*X**2 - bS*Y*Z - (aS + 2)*X).subs({X: 1, Y: -1, Z: 2}); g2 = grad(4*X**2*Y + Z**3).subs({X: 1, Y: -1, Z: 2})
sl = solve([(aS*1 - bS*(-1)*2 - (aS + 2)*1), (g1.T*g2)[0]], [aS, bS], dict=True)[0]
check("J4-2a a", sl[aS], Rational(5, 2)); check("J4-2a b", sl[bS], 1)
check("J4-2b div", simplify(div(Matrix([X, Y, Z])/r**m) - (3 - m)/r**m), 0)
check("J4-2b curl", simplify(curl(Matrix([X, Y, Z])/r**m)), Matrix([0, 0, 0]))
check("J4-3a", LT((sin(t) - cos(t))**3), Rational(3, 2)*(1 - s)/(s**2 + 1) + (3 + s)/(2*(s**2 + 9)))
check("J4-4a", integrate(t**3*exp(-t)*sin(t), (t, 0, oo)), 0)
check("J4-4a via L", (24*s*(s**2 - 1)/(s**2 + 1)**4).subs(s, 1), 0)
check("J4-4a L{t^3 sin t}", LT(t**3*sin(t)), 24*s*(s**2 - 1)/(s**2 + 1)**4)
w, th0, A0 = symbols('w theta A0', positive=True)
ys = A0/(2*w**2)*(sin(w*t)*cos(th0) - w*t*cos(w*t + th0))
check("J4-4b ODE", ode_residual(lambda f: diff(f, t, 2) + w**2*f - A0*sin(w*t + th0), ys), 0)
check("J4-4b y(0)", ys.subs(t, 0), 0); check("J4-4b y'(0)", simplify(diff(ys, t).subs(t, 0)), 0)
a0 = integrate(1 + x**2, (x, 0, 1)) + integrate(3 - x, (x, 1, 2))
an = simplify(integrate((1 + x**2)*cos(n*pi*x), (x, 0, 1)) + integrate((3 - x)*cos(n*pi*x), (x, 1, 2)))
bn = simplify(integrate((1 + x**2)*sin(n*pi*x), (x, 0, 1)) + integrate((3 - x)*sin(n*pi*x), (x, 1, 2)))
check("J4-5a a0", a0, Rational(17, 6))
check("J4-5a an", an, (3*(-1)**n - 1)/(n**2*pi**2))
check("J4-5a bn", bn, 2*((-1)**n - 1)/(pi**3*n**3))
check("J4-5b Fs", simplify(integrate(2*x*sin(n*pi*x/4), (x, 0, 4))), 32*(-1)**(n + 1)/(n*pi))
check("J4-5b Fc", simplify(integrate(2*x*cos(n*pi*x/4), (x, 0, 4))), 32*((-1)**n - 1)/(n**2*pi**2))
check("J4-5b Fc(0)", integrate(2*x, (x, 0, 4)), 16)
b1 = 2/pi*(integrate(sin(x)*sin(x), (x, 0, pi/2)) + integrate(cos(x)*sin(x), (x, pi/2, pi)))
check("J4-6a b1", b1, Rational(1, 2) - 1/pi)
bn_formula = lambda nv: 2*(nv*(-1)**nv - nv*cos(nv*pi/2) + sin(nv*pi/2))/(pi*(nv**2 - 1))
for nv in (2, 3, 4, 5, 6, 7):
    bnv = 2/pi*(integrate(sin(x)*sin(nv*x), (x, 0, pi/2)) + integrate(cos(x)*sin(nv*x), (x, pi/2, pi)))
    check(f"J4-6a b{nv}", bnv, bn_formula(nv))
check("J4-6b", simplify(2/pi*integrate(cos(lam*t), (t, 0, 1))), 2*sin(lam)/(pi*lam))
check("J4-7a u", first_integral(X**3 + 3*X*Y**2, Y**3 + 3*X**2*Y, 2*(X**2 + Y**2)*Z, X*Y/Z**2), 0)
check("J4-7a v", first_integral(X**3 + 3*X*Y**2, Y**3 + 3*X**2*Y, 2*(X**2 + Y**2)*Z, X*Y/(X**2 - Y**2)**2), 0)
check("J4-8a u", first_integral(Y**2*(X - Y), -X**2*(X - Y), Z*(X**2 + Y**2), X**3 + Y**3), 0)
check("J4-8a v", first_integral(Y**2*(X - Y), -X**2*(X - Y), Z*(X**2 + Y**2), (X - Y)/Z), 0)
nq = 3
zz = a*x + a*(nq + sqrt(nq**2 - 4))/2*y + c
check("J4-8b p^2+q^2=npq", simplify(diff(zz, x)**2 + diff(zz, y)**2 - nq*diff(zz, x)*diff(zz, y)), 0)
check("J4-9b bn", simplify(2/l*integrate(100*x/l*sin(n*pi*x/l), (x, 0, l))), 200*(-1)**(n + 1)/(n*pi))
L = {(3, 0): 1, (2, 1): -2, (1, 2): -1, (0, 3): 2}
check("J4-10b CF", apply(L, F1(y + x) + F2(y - x) + F3(y + 2*x)), 0)
check("J4-10b PI", apply(L, -x/2*exp(x + y)), exp(x + y))

# ===== July 2023 SET 1 =====
Mx = Matrix([grad(X + Y + Z).T, grad(X**2 + Y**2 + Z**2).T, grad(X*Y + Y*Z + Z*X).T])
check("Jy-1a", simplify(Mx.det()), 0)
check("Jy-1b", line(Matrix([3*X**2, 2*X*Z - Y, Z]), (2*t**3, t, 4*t**2 - t), 0, 1), Rational(208, 15))
Acap = Matrix([Y, X - 2*X*Z, -X*Y])
check("Jy-2b boundary", line(Acap, (2*cos(t), 2*sin(t), 0), 0, 2*pi), 0)
check("Jy-3a", Rational(1, 2)*log((s/2 + 3)/(s/2 + 1)), Rational(1, 2)*log((s + 6)/(s + 2)))
check("Jy-4a", LT(exp(-3*t)*(cos(4*t) + 3*sin(4*t))), (s + 15)/(s**2 + 6*s + 25))
check("Jy-4b", ILT((s + 5)/((s - 1)**2*(s + 2))), (-exp(t)/3 + 2*t*exp(t) + exp(-2*t)/3)*Heaviside(t))
a0 = integrate((pi - x)**2/4, (x, 0, 2*pi))/pi
check("Jy-5a a0", a0, pi**2/6)
check("Jy-5a an", simplify(integrate((pi - x)**2/4*cos(n*x), (x, 0, 2*pi))/pi), 1/n**2)
check("Jy-5a bn", simplify(integrate((pi - x)**2/4*sin(n*x), (x, 0, 2*pi))/pi), 0)
check("Jy-5b a0", integrate(1, (x, 0, 1)) - integrate(1, (x, 1, 2)), 0)
check("Jy-5b an", simplify(integrate(cos(n*pi*x/2), (x, 0, 1)) - integrate(cos(n*pi*x/2), (x, 1, 2))), 4*sin(n*pi/2)/(n*pi))
pr = symbols('pr', real=True, nonzero=True)
from sympy import I as II, expand_complex, re, im
Ft = integrate(x*exp(II*pr*x), (x, 0, 1)) + integrate((2 - x)*exp(II*pr*x), (x, 1, 2))
check("Jy-6a intended (2-x)", simplify(Ft - (-(exp(II*pr) - 1)**2/pr**2)), 0)
Fp = integrate(x*exp(II*pr*x), (x, 0, 1)) + integrate((1 - x)*exp(II*pr*x), (x, 1, 2))
print("     Jy-6a as printed (1-x):", simplify(Fp))
check("Jy-6b", integrate(cos(p*x)/(1 + x**2), (x, 0, oo)), pi*exp(-p)/2)
zz = f(x**2 - y) + g(x**2 + y)
check("Jy-7a", simplify(x*diff(zz, x, 2) - diff(zz, x) - 4*x**3*diff(zz, y, 2)), 0)
zz = a*x + a**Rational(-2, 3)*y + c
check("Jy-7b", simplify(diff(zz, x)**2*diff(zz, y)**3), 1)
al = symbols('alpha', positive=True)
zz = c + sqrt(x**2 + y**2)*tan(al)
check("Jy-8a yp - xq = 0", simplify(y*diff(zz, x) - x*diff(zz, y)), 0)
check("Jy-8b u", first_integral(X + 2*Z, 4*Z - Y, 2*X + Y, 2*X - Y - Z), 0)
check("Jy-8b v", first_integral(X + 2*Z, 4*Z - Y, 2*X + Y, X*Y - Z**2), 0)
check("Jy-9 bn", simplify(2/a*integrate(k*x*sin(n*pi*x/a), (x, 0, a))), 2*k*a*(-1)**(n + 1)/(n*pi))
L = {(3, 0): 1, (2, 1): -4, (1, 2): 5, (0, 3): -2}
check("Jy-10b CF", apply(L, F1(y + x) + x*F2(y + x) + F3(y + 2*x)), 0)
check("Jy-10b PI", apply(L, x*exp(2*x + y) - x**2/2*exp(x + y)), exp(2*x + y) + exp(x + y))

print(f"\n{count - len(fails)}/{count} checks passed")
sys.exit(1 if fails else 0)
