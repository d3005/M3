"""Symbolic verification of every worked example and practice answer used in the app.

Run:  python3 scripts/verify_math.py      (requires: pip install sympy)

Each check() compares the value stated in src/data/*.ts with an independent
sympy computation. A failing check prints FAIL and the script exits non-zero.
"""
import sys
from sympy import (symbols, Function, diff, integrate, simplify, sqrt, Rational, pi, sin, cos,
                   exp, log, sinh, cosh, tan, atan, acos, oo, Matrix, laplace_transform,
                   inverse_laplace_transform, Heaviside, DiracDelta, dsolve, Eq, Derivative,
                   expand, trigsimp, nsimplify, N, Abs, Piecewise, S, factor, symbols, Integral)

x, y, z, t, s, u, a, b, c, k, l, lam = symbols('x y z t s u a b c k l lam', positive=True)
X, Y, Z = symbols('X Y Z', real=True)
n = symbols('n', integer=True, positive=True)

failures = []
count = 0


def _numeric_zero(d):
    import random
    syms = sorted(d.free_symbols, key=str)
    for _ in range(3):
        sub = {v: (random.randint(1, 5) if v.is_integer else Rational(random.randint(11, 29), 10)) for v in syms}
        if abs(complex(N(d.subs(sub)))) > 1e-8:
            return False
    return True


def check(name, got, expected):
    global count
    count += 1
    d = simplify(got - expected)
    is_mat = hasattr(d, 'is_zero_matrix')
    zero = d.is_zero_matrix if is_mat else d == 0
    if not zero:
        try:
            zero = all(_numeric_zero(e) for e in d) if is_mat else _numeric_zero(d)
        except Exception:
            zero = False
    if zero:
        print(f"ok   {name}")
    else:
        failures.append(name)
        print(f"FAIL {name}: got {got}, expected {expected}")


def grad(f, v=(X, Y, Z)):
    return Matrix([diff(f, q) for q in v])


def div(F, v=(X, Y, Z)):
    return sum(diff(F[i], v[i]) for i in range(3))


def curl(F, v=(X, Y, Z)):
    P, Q, R = F
    return Matrix([diff(R, v[1]) - diff(Q, v[2]), diff(P, v[2]) - diff(R, v[0]), diff(Q, v[0]) - diff(P, v[1])])


sub = lambda e, p: e.subs({X: p[0], Y: p[1], Z: p[2]})

# ---------------- UNIT I ----------------
phi = X**2*Y*Z + 4*X*Z**2
g = sub(grad(phi), (1, -2, -1))
check("U1 grad phi at (1,-2,-1)", g, Matrix([8, -1, -10]))
check("U1 directional derivative 37/3", (g.T*Matrix([2, -1, -2]))[0]/3, Rational(37, 3))

g = sub(grad(X**2*Y + 2*X*Z), (2, -2, 3))
check("U1 normal x^2y+2xz=4", g/g.norm(), Matrix([-1, 2, 2])/3)

n1 = sub(grad(X**2 + Y**2 + Z**2), (2, -1, 2)); n2 = sub(grad(X**2 + Y**2 - Z - 3), (2, -1, 2))
check("U1 angle between surfaces cos", (n1.T*n2)[0]/(n1.norm()*n2.norm()), 8/(3*sqrt(21)))

gphi = sub(grad(X*Y**2 + Y*Z**3), (2, -1, 1))
nn = sub(grad(X*log(Z) - Y**2), (-1, 2, 1))
check("U1 dir. deriv along normal 15/sqrt17", (gphi.T*nn)[0]/nn.norm(), 15/sqrt(17))
check("U1 max dir deriv |grad| for phi=x^2yz+4xz^2", sub(grad(phi), (1, -2, -1)).norm(), sqrt(165))

F = Matrix([X*Y**2, 2*X**2*Y*Z, -3*Y*Z**2])
check("U1 div F at (1,-1,1)", sub(div(F), (1, -1, 1)), 9)
p = symbols('p')
check("U1 solenoidal p", div(Matrix([X + 3*Y, Y - 2*Z, X + p*Z])), 2 + p)  # => p=-2
r = sqrt(X**2 + Y**2 + Z**2); m = symbols('m')
check("U1 div(r^n r)=(n+3)r^n", simplify(div(Matrix([X, Y, Z])*r**m) - (m + 3)*r**m), 0)

F = Matrix([6*X*Y + Z**3, 3*X**2 - Z, 3*X*Z**2 - Y])
check("U1 curl F = 0", curl(F), Matrix([0, 0, 0]))
check("U1 potential", grad(3*X**2*Y + X*Z**3 - Y*Z) - F, Matrix([0, 0, 0]))
A, B, C = symbols('A B C')
check("U1 irrotational constants", curl(Matrix([X + 2*Y + A*Z, B*X - 3*Y - Z, 4*X + C*Y + 2*Z])),
      Matrix([C + 1, A - 4, B - 2]))
F = Matrix([Y**2 - Z**2 + 3*Y*Z - 2*X, 3*X*Z + 2*X*Y, 3*X*Y - 2*X*Z + 2*Z])
check("U1 both: div 0", div(F), 0)
check("U1 both: curl 0", curl(F), Matrix([0, 0, 0]))
check("U1 both: potential", grad(X*Y**2 - X*Z**2 + 3*X*Y*Z - X**2 + Z**2) - F, Matrix([0, 0, 0]))

def line(F, rr, t0, t1):
    Fv = F.subs({X: rr[0], Y: rr[1], Z: rr[2]})
    return integrate(sum(Fv[i]*diff(rr[i], t) for i in range(3)), (t, t0, t1))

check("U1 work straight line = 16", line(Matrix([3*X**2, 2*X*Z - Y, Z]), (2*t, t, 3*t), 0, 1), 16)
check("U1 line integral y=x^2 = 11/15", line(Matrix([X**2, X*Y, 0]), (t, t**2, 0), 0, 1), Rational(11, 15))
check("U1 work 288/35", line(Matrix([2*Y + 3, X*Z, Y*Z - X]), (2*t**2, t, t**3), 0, 1), Rational(288, 35))

# flux over x^2+y^2=16 first octant, 0<=z<=5 : r = (4cos th, 4 sin th, z), outward n dS = (4cos th, 4 sin th, 0) dth dz
th = symbols('th')
Fc = Matrix([Z, X, -3*Y**2*Z]).subs({X: 4*cos(th), Y: 4*sin(th)})
check("U1 flux cylinder = 90", integrate(integrate(Fc[0]*4*cos(th) + Fc[1]*4*sin(th), (th, 0, pi/2)), (Z, 0, 5)), 90)
# plane 2x+3y+6z=12: n dS = (2,3,6)/6 dxdy (projection on xy) ; z = (12-2x-3y)/6
Fp = Matrix([18*Z, -12, 3*Y]).subs(Z, (12 - 2*X - 3*Y)/6)
check("U1 flux plane = 24", integrate(integrate((Fp.T*Matrix([2, 3, 6]))[0]/6, (Y, 0, (12 - 2*X)/3)), (X, 0, 6)), 24)

# Green: (3x^2-8y^2)dx+(4y-6xy)dy, region between y=x^2 and y=sqrt(x)
P = 3*X**2 - 8*Y**2; Q = 4*Y - 6*X*Y
lhs = integrate((P + Q*diff(X**2, X)).subs(Y, X**2), (X, 0, 1)) + integrate((P + Q*diff(sqrt(X), X)).subs(Y, sqrt(X)), (X, 1, 0))
rhs = integrate(integrate(diff(Q, X) - diff(P, Y), (Y, X**2, sqrt(X))), (X, 0, 1))
check("U1 Green line side 3/2", lhs, Rational(3, 2)); check("U1 Green area side 3/2", rhs, Rational(3, 2))
P = X*Y + Y**2; Q = X**2
lhs = integrate((P + Q*2*X).subs(Y, X**2), (X, 0, 1)) + integrate((P + Q).subs(Y, X), (X, 1, 0))
check("U1 Green -1/20", lhs, Rational(-1, 20))
check("U1 Green -1/20 double", integrate(integrate(diff(Q, X) - diff(P, Y), (Y, X**2, X)), (X, 0, 1)), Rational(-1, 20))
check("U1 ellipse area via Green", integrate((a*cos(th))*(b*cos(th)) - (b*sin(th))*(-a*sin(th)), (th, 0, 2*pi))/2, pi*a*b)

# Stokes F=(2x-y, -yz^2, -y^2 z) upper unit hemisphere; boundary x=cos, y=sin, z=0
F = Matrix([2*X - Y, -Y*Z**2, -Y**2*Z])
check("U1 Stokes line side pi", line(F, (cos(t), sin(t), 0), 0, 2*pi), pi)
check("U1 Stokes curl", curl(F), Matrix([0, 0, 1]))
check("U1 Stokes surface side pi (flux of k = projected area)", pi*1**2, pi)
F = Matrix([X + Y, 2*X - Z, Y + Z])
check("U1 Stokes triangle curl", curl(F), Matrix([2, 0, 1]))
check("U1 Stokes triangle = 21", integrate(integrate((2*3 + 0*2 + 1*1), (Y, 0, 3 - 3*X/2)), (X, 0, 2)), 21)
# line integral around triangle (2,0,0)->(0,3,0)->(0,0,6)->(2,0,0)
L = line(F, (2 - 2*t, 3*t, 0), 0, 1) + line(F, (0, 3 - 3*t, 6*t), 0, 1) + line(F, (2*t, 0, 6 - 6*t), 0, 1)
check("U1 Stokes triangle line side 21", L, 21)
F = Matrix([X**2 + Y**2, -2*X*Y, 0])
L = line(F, (t, 0, 0), -a, a) + line(F, (a, t, 0), 0, b) + line(F, (-t, b, 0), -a, a) + line(F, (-a, -t, 0), -b, 0)
check("U1 Stokes rectangle -4ab^2", L, -4*a*b**2)

F = Matrix([X**2 - Y*Z, Y**2 - Z*X, Z**2 - X*Y])
check("U1 Gauss box", integrate(div(F), (X, 0, a), (Y, 0, b), (Z, 0, c)), a*b*c*(a + b + c))
F = Matrix([4*X*Z, -Y**2, Y*Z])
check("U1 Gauss unit cube 3/2", integrate(div(F), (X, 0, 1), (Y, 0, 1), (Z, 0, 1)), Rational(3, 2))
# surface side of unit cube check
faces = (integrate(F[0].subs(X, 1) - F[0].subs(X, 0), (Y, 0, 1), (Z, 0, 1))
         + integrate(F[1].subs(Y, 1) - F[1].subs(Y, 0), (X, 0, 1), (Z, 0, 1))
         + integrate(F[2].subs(Z, 1) - F[2].subs(Z, 0), (X, 0, 1), (Y, 0, 1)))
check("U1 Gauss unit cube surface side", faces, Rational(3, 2))
check("U1 Gauss sphere r", 3*Rational(4, 3)*pi*a**3, 4*pi*a**3)

# ---------------- UNIT II ----------------
LT = lambda f: laplace_transform(f, t, s, noconds=True)
ILT = lambda F: inverse_laplace_transform(F, s, t)
check("U2 linear combo", LT(3*exp(2*t) + 4*sin(3*t) - 2*t**3 + cosh(2*t)), 3/(s - 2) + 12/(s**2 + 9) - 12/s**4 + s/(s**2 - 4))
check("U2 sin^2 t", LT(sin(t)**2), 2/(s*(s**2 + 4)))
check("U2 cos^3 2t", LT(cos(2*t)**3), Rational(1, 4)*(3*s/(s**2 + 4) + s/(s**2 + 36)))
check("U2 sin2t cos3t", LT(sin(2*t)*cos(3*t)), Rational(1, 2)*(5/(s**2 + 25) - 1/(s**2 + 1)))
check("U2 e^-3t cos4t", LT(exp(-3*t)*cos(4*t)), (s + 3)/((s + 3)**2 + 16))
check("U2 e^2t t^3", LT(exp(2*t)*t**3), 6/(s - 2)**4)
check("U2 e^-t sin^2 t", LT(exp(-t)*sin(t)**2), 2/((s + 1)*((s + 1)**2 + 4)))
check("U2 cosh at sin at", LT(cosh(a*t)*sin(a*t)), a/2*(1/((s - a)**2 + a**2) + 1/((s + a)**2 + a**2)))
check("U2 (t-2)^3 u(t-2)", LT((t - 2)**3*Heaviside(t - 2)), 6*exp(-2*s)/s**4)
check("U2 piecewise t / 3", LT(t + (3 - t)*Heaviside(t - 2)), 1/s**2 - exp(-2*s)/s**2 + exp(-2*s)/s)
check("U2 sin t u(t-pi)", LT(sin(t)*Heaviside(t - pi)), -exp(-pi*s)/(s**2 + 1))
check("U2 window 1 on (0,1)", LT(1 - Heaviside(t - 1)), (1 - exp(-s))/s)
check("U2 t sin 3t", LT(t*sin(3*t)), 6*s/(s**2 + 9)**2)
check("U2 t^2 cos t", LT(t**2*cos(t)), (2*s**3 - 6*s)/(s**2 + 1)**3)
check("U2 sin t / t", integrate(1/(u**2 + 1), (u, s, oo)), pi/2 - atan(s))
check("U2 (e^-at - e^-bt)/t", integrate(1/(u + a) - 1/(u + b), (u, s, oo)), log((s + b)/(s + a)))
check("U2 int t e^-2t sin t", integrate(t*exp(-2*t)*sin(t), (t, 0, oo)), Rational(4, 25))
check("U2 integral of e^-u cos u", LT(integrate(exp(-u)*cos(u), (u, 0, t))), (s + 1)/(s*((s + 1)**2 + 1)))
check("U2 t^2 delta(t-3)", integrate(exp(-s*t)*t**2*DiracDelta(t - 3), (t, 0, oo)), 9*exp(-3*s))
check("U2 cos t delta(t-pi)", integrate(exp(-s*t)*cos(t)*DiracDelta(t - pi), (t, 0, oo)), -exp(-pi*s))
check("U2 partial fractions", ILT((5*s + 3)/((s - 1)*(s**2 + 2*s + 5))),
      (exp(t) - exp(-t)*cos(2*t) + Rational(3, 2)*exp(-t)*sin(2*t))*Heaviside(t))
check("U2 completing square", ILT((s + 2)/(s**2 - 4*s + 13)), exp(2*t)*(cos(3*t) + Rational(4, 3)*sin(3*t))*Heaviside(t))
check("U2 1/(s(s+1)(s+2))", ILT(1/(s*(s + 1)*(s + 2))), (Rational(1, 2) - exp(-t) + exp(-2*t)/2)*Heaviside(t))
check("U2 e^-2s/(s^2+4)", ILT(exp(-2*s)/(s**2 + 4)), sin(2*(t - 2))/2*Heaviside(t - 2))
check("U2 log((s+1)/(s-1)) derivative route", -(exp(-t) - exp(t))/t, 2*sinh(t)/t)
check("U2 log((s+1)/(s-1)) at s=3", integrate(2*sinh(t)/t*exp(-3*t), (t, 0, oo)), log(Rational(4, 2)))
check("U2 conv 1/(s(s^2+4))", integrate(sin(2*u)/2, (u, 0, t)), (1 - cos(2*t))/4)
check("U2 conv check 1/(s(s^2+4))", LT((1 - cos(2*t))/4), 1/(s*(s**2 + 4)))
check("U2 s/(s^2+a^2)^2", LT(t*sin(a*t)/(2*a)), s/(s**2 + a**2)**2)
check("U2 1/(s^2+a^2)^2", LT((sin(a*t) - a*t*cos(a*t))/(2*a**3)), 1/(s**2 + a**2)**2)
check("U2 s^2/(s^2+a^2)^2", LT((sin(a*t) + a*t*cos(a*t))/(2*a)), s**2/(s**2 + a**2)**2)
check("U2 conv e^-t*e^-2t", integrate(exp(-u)*exp(-2*(t - u)), (u, 0, t)), exp(-t) - exp(-2*t))
check("U2 conv for s/(s^2+a^2)^2", integrate(cos(a*u)*sin(a*(t - u))/a, (u, 0, t)), t*sin(a*t)/(2*a))

yf = Function('y')
def ode_ok(eq, sol, ics):
    res = simplify(eq(sol))
    ok = res == 0
    for (order, t0, val) in ics:
        ok = ok and simplify(diff(sol, t, order).subs(t, t0) - val) == 0
    return ok
sol = -7*exp(t) + 4*exp(2*t) + 4*t*exp(2*t)
check("U2 ODE1", int(not ode_ok(lambda f: diff(f, t, 2) - 3*diff(f, t) + 2*f - 4*exp(2*t), sol, [(0, 0, -3), (1, 0, 5)])), 0)
sol = exp(-t)*(sin(t) + sin(2*t))/3
check("U2 ODE2", int(not ode_ok(lambda f: diff(f, t, 2) + 2*diff(f, t) + 5*f - exp(-t)*sin(t), sol, [(0, 0, 0), (1, 0, 1)])), 0)
sol = Rational(7, 4)*exp(-t) - Rational(3, 4)*exp(-3*t) + t*exp(-t)/2
check("U2 ODE3", int(not ode_ok(lambda f: diff(f, t, 2) + 4*diff(f, t) + 3*f - exp(-t), sol, [(0, 0, 1), (1, 0, 1)])), 0)
# delta ODE: y = -sin t u(t-pi) ; check transform
check("U2 ODE delta transform", LT(sin(t - pi)*Heaviside(t - pi)), exp(-pi*s)/(s**2 + 1))
check("U2 ODE4 y''+y=t, y(0)=1,y'(0)=-2", int(not ode_ok(lambda f: diff(f, t, 2) + f - t, t + cos(t) - 3*sin(t), [(0, 0, 1), (1, 0, -2)])), 0)

# ---------------- UNIT III ----------------
def fs(f, lo, hi, L):
    """Euler coefficients with f = a0/2 + sum(an cos(n pi x/L) + bn sin(n pi x/L)), interval length 2L."""
    a0 = integrate(f, (x, lo, hi))/L
    an = integrate(f*cos(n*pi*x/L), (x, lo, hi))/L
    bn = integrate(f*sin(n*pi*x/L), (x, lo, hi))/L
    return simplify(a0), simplify(an), simplify(bn)

a0, an, bn = fs(x + x**2, -pi, pi, pi)
check("U3 x+x^2 a0", a0, 2*pi**2/3); check("U3 x+x^2 an", an, 4*(-1)**n/n**2); check("U3 x+x^2 bn", bn, -2*(-1)**n/n)
a0, an, bn = fs(exp(x), 0, 2*pi, pi)
E = exp(2*pi) - 1
check("U3 e^x a0", a0, E/pi); check("U3 e^x an", an, E/(pi*(1 + n**2))); check("U3 e^x bn", bn, -n*E/(pi*(1 + n**2)))
a0, an, bn = fs((pi - x)/2, 0, 2*pi, pi)
check("U3 (pi-x)/2 a0", a0, 0); check("U3 (pi-x)/2 an", an, 0); check("U3 (pi-x)/2 bn", bn, 1/n)
a0, an, bn = fs(x**2, 0, 2*pi, pi)
check("U3 x^2 (0,2pi) a0", a0, 8*pi**2/3); check("U3 x^2 (0,2pi) an", an, 4/n**2); check("U3 x^2 (0,2pi) bn", bn, -4*pi/n)
a0, an, bn = fs(x**2, -pi, pi, pi)
check("U3 x^2 a0", a0, 2*pi**2/3); check("U3 x^2 an", an, 4*(-1)**n/n**2)
a0, an, bn = fs(x, -pi, pi, pi)
check("U3 x bn", bn, 2*(-1)**(n + 1)/n)
# |x| in (-pi,pi): a0 = (2/pi)int_0^pi x, an = (2/pi) int_0^pi x cos nx
check("U3 |x| a0", 2*integrate(x, (x, 0, pi))/pi, pi)
check("U3 |x| an", simplify(2*integrate(x*cos(n*x), (x, 0, pi))/pi), 2*((-1)**n - 1)/(pi*n**2))
# piecewise: -pi on (-pi,0), x on (0,pi)
a0 = (integrate(-pi, (x, -pi, 0)) + integrate(x, (x, 0, pi)))/pi
an = simplify((integrate(-pi*cos(n*x), (x, -pi, 0)) + integrate(x*cos(n*x), (x, 0, pi)))/pi)
bn = simplify((integrate(-pi*sin(n*x), (x, -pi, 0)) + integrate(x*sin(n*x), (x, 0, pi)))/pi)
check("U3 piecewise a0", a0, -pi/2); check("U3 piecewise an", an, ((-1)**n - 1)/(pi*n**2)); check("U3 piecewise bn", bn, (1 - 2*(-1)**n)/n)
a0, an, bn = fs(x**2, -l, l, l)
check("U3 x^2 (-l,l) a0", a0, 2*l**2/3); check("U3 x^2 (-l,l) an", an, 4*l**2*(-1)**n/(n**2*pi**2))
# step on (-2,2): 0 then 1, L=2
a0 = integrate(1, (x, 0, 2))/2; bn = simplify(integrate(sin(n*pi*x/2), (x, 0, 2))/2); an = simplify(integrate(cos(n*pi*x/2), (x, 0, 2))/2)
check("U3 step a0", a0, 1); check("U3 step an", an, 0); check("U3 step bn", bn, (1 - (-1)**n)/(n*pi))
a0, an, bn = fs(x, 0, 2, 1)
check("U3 x on (0,2) a0", a0, 2); check("U3 x on (0,2) an", an, 0); check("U3 x on (0,2) bn", bn, -2/(n*pi))
# half range
check("U3 HR sine x", simplify(2*integrate(x*sin(n*x), (x, 0, pi))/pi), 2*(-1)**(n + 1)/n)
check("U3 HR sine x(pi-x)", simplify(2*integrate(x*(pi - x)*sin(n*x), (x, 0, pi))/pi), 4*(1 - (-1)**n)/(pi*n**3))
check("U3 HR cos x(pi-x) a0", 2*integrate(x*(pi - x), (x, 0, pi))/pi, pi**2/3)
check("U3 HR cos x(pi-x) an", simplify(2*integrate(x*(pi - x)*cos(n*x), (x, 0, pi))/pi), -2*(1 + (-1)**n)/n**2)
check("U3 HR sine of 1 on (0,l)", simplify(2*integrate(sin(n*pi*x/l), (x, 0, l))/l), 2*(1 - (-1)**n)/(n*pi))
# Fourier integral / transform (convention F(s)=int f e^{isx})
check("U3 FI box: int cos(lam(t-x)) over |t|<1", simplify(integrate(cos(lam*(t - x)), (t, -1, 1))), 2*sin(lam)*cos(lam*x)/lam)
check("U3 Dirichlet integral", integrate(sin(x)/x, (x, 0, oo)), pi/2)
check("U3 FCI e^-kx coefficient", integrate(exp(-k*t)*cos(lam*t), (t, 0, oo)), k/(k**2 + lam**2))
check("U3 Laplace integral", integrate(cos(lam*x)/(lam**2 + k**2), (lam, 0, oo)), pi*exp(-k*x)/(2*k))
check("U3 FSI e^-kx coefficient", integrate(exp(-k*t)*sin(lam*t), (t, 0, oo)), lam/(k**2 + lam**2))
check("U3 FT box", simplify(2*integrate(cos(s*x), (x, 0, a))), 2*sin(a*s)/s)
check("U3 FT e^-a|x|", 2*integrate(exp(-a*x)*cos(s*x), (x, 0, oo)), 2*a/(a**2 + s**2))
check("U3 FT 1-x^2", simplify(2*integrate((1 - x**2)*cos(s*x), (x, 0, 1))), 4*(sin(s) - s*cos(s))/s**3)
val = N(Integral((x*cos(x) - sin(x))/x**3*cos(x/2), (x, 0, 200)), 20)
check("U3 FT deduced integral -3pi/16 (numeric, |err|<1e-3)", int(abs(float(val) + 3*float(pi)/16) < 1e-3), 1)
check("U3 Fs e^-ax", integrate(exp(-a*x)*sin(s*x), (x, 0, oo)), s/(s**2 + a**2))
check("U3 Fc e^-ax", integrate(exp(-a*x)*cos(s*x), (x, 0, oo)), a/(s**2 + a**2))
check("U3 Fs e^-ax/x via d/ds", integrate(a/(u**2 + a**2), (u, 0, s)), atan(s/a))
fc = integrate(x*cos(s*x), (x, 0, 1)) + integrate((2 - x)*cos(s*x), (x, 1, 2))
check("U3 Fc triangle", simplify(fc), (2*cos(s) - 1 - cos(2*s))/s**2)
al = symbols('alpha', positive=True)
check("U3 inverse cosine 1-alpha", simplify(2/pi*integrate((1 - al)*cos(al*x), (al, 0, 1))), 2*(1 - cos(x))/(pi*x**2))
check("U3 int sin^2 t/t^2", integrate(sin(t)**2/t**2, (t, 0, oo)), pi/2)
check("U3 finite Fs x", simplify(integrate(x*sin(n*x), (x, 0, pi))), pi*(-1)**(n + 1)/n)
check("U3 finite Fc x", simplify(integrate(x*cos(n*x), (x, 0, pi))), ((-1)**n - 1)/n**2)
check("U3 finite Fc x n=0", integrate(x, (x, 0, pi)), pi**2/2)
check("U3 finite Fs 1", simplify(integrate(sin(n*x), (x, 0, pi))), (1 - (-1)**n)/n)
check("U3 finite Fs x^2", simplify(integrate(x**2*sin(n*x), (x, 0, pi))), (-1)**(n + 1)*pi**2/n + 2*((-1)**n - 1)/n**3)

# ---------------- UNIT IV ----------------
zf = Function('z')(x, y)
A_, B_ = symbols('A B')
# z=(x-a)^2+(y-b)^2 => p^2+q^2=4z
Zx = (x - A_)**2 + (y - B_)**2
check("U4 p^2+q^2=4z", diff(Zx, x)**2 + diff(Zx, y)**2 - 4*Zx, 0)
Zx = A_*x + B_*y + A_*B_
check("U4 Clairaut form", diff(Zx, x)*x + diff(Zx, y)*y + diff(Zx, x)*diff(Zx, y) - Zx, 0)
Zx = (x**2 + A_)*(y**2 + B_)
check("U4 pq=4xyz", diff(Zx, x)*diff(Zx, y) - 4*x*y*Zx, 0)
R_ = symbols('R')
Zx = sqrt(R_**2 - (x - A_)**2 - (y - B_)**2)
check("U4 sphere family", simplify(Zx**2*(diff(Zx, x)**2 + diff(Zx, y)**2 + 1) - R_**2), 0)
Zx = ((A_*x + y)**2 + B_)/2
check("U4 px+qy=q^2", simplify(x*diff(Zx, x) + y*diff(Zx, y) - diff(Zx, y)**2), 0)
f = Function('f'); g_ = Function('g')
Zx = f(x**2 + y**2)
check("U4 yp-xq=0", simplify(y*diff(Zx, x) - x*diff(Zx, y)), 0)
Zx = f(x**2 - y**2)
check("U4 yp+xq=0", simplify(y*diff(Zx, x) + x*diff(Zx, y)), 0)
Zt = f(x + c*t) + g_(x - c*t)
check("U4 wave from functions", simplify(diff(Zt, t, 2) - c**2*diff(Zt, x, 2)), 0)
# phi(u,v)=0 Jacobian route: P=(u_y v_z - u_z v_y) etc
uu = X + Y + Z; vv = X**2 + Y**2 - Z**2
P = diff(uu, Y)*diff(vv, Z) - diff(uu, Z)*diff(vv, Y); Q = diff(uu, Z)*diff(vv, X) - diff(uu, X)*diff(vv, Z); R = diff(uu, X)*diff(vv, Y) - diff(uu, Y)*diff(vv, X)
check("U4 phi(u,v) P", P, -2*(Y + Z)); check("U4 phi(u,v) Q", Q, 2*(X + Z)); check("U4 phi(u,v) R", R, 2*(Y - X))

def first_integral(Pv, Qv, Rv, w):
    return simplify(Pv*diff(w, X) + Qv*diff(w, Y) + Rv*diff(w, Z))
check("U4 Lagrange1 u", first_integral(Y - Z, Z - X, X - Y, X + Y + Z), 0)
check("U4 Lagrange1 v", first_integral(Y - Z, Z - X, X - Y, X**2 + Y**2 + Z**2), 0)
check("U4 Lagrange2 u", first_integral(X, Y, Z, Y/X), 0); check("U4 Lagrange2 v", first_integral(X, Y, Z, Z/X), 0)
check("U4 Lagrange3 u", first_integral(tan(X), tan(Y), tan(Z), sin(Y)/sin(X)), 0)
check("U4 Lagrange3 v", first_integral(tan(X), tan(Y), tan(Z), sin(Z)/sin(Y)), 0)
check("U4 Lagrange4 u", first_integral(X**2, Y**2, Z**2, 1/Y - 1/X), 0)
check("U4 Lagrange4 v", first_integral(X**2, Y**2, Z**2, 1/Z - 1/Y), 0)
Pv, Qv, Rv = X*(Y**2 - Z**2), Y*(Z**2 - X**2), Z*(X**2 - Y**2)
check("U4 Lagrange5 u", first_integral(Pv, Qv, Rv, X*Y*Z), 0)
check("U4 Lagrange5 v", first_integral(Pv, Qv, Rv, X**2 + Y**2 + Z**2), 0)
check("U4 Lagrange6 (mz-ny)p+(nx-lz)q=ly-mx u", first_integral(3*Z - 4*Y, 4*X - 2*Z, 2*Y - 3*X, 2*X + 3*Y + 4*Z), 0)
check("U4 Lagrange6 v", first_integral(3*Z - 4*Y, 4*X - 2*Z, 2*Y - 3*X, X**2 + Y**2 + Z**2), 0)
# Nonlinear
Zx = A_*x + sqrt(1 - A_**2)*y + B_
check("U4 Form I p^2+q^2=1", simplify(diff(Zx, x)**2 + diff(Zx, y)**2), 1)
Zx = A_*x + (1 - sqrt(A_))**2*y + B_
check("U4 Form I sqrt p + sqrt q = 1 (a in (0,1))", simplify((sqrt(diff(Zx, x)) + sqrt(diff(Zx, y))).subs(A_, Rational(1, 4))), 1)
Zx = A_*x + B_*y + sqrt(1 + A_**2 + B_**2)
check("U4 Clairaut sqrt", simplify(x*diff(Zx, x) + y*diff(Zx, y) + sqrt(1 + diff(Zx, x)**2 + diff(Zx, y)**2) - Zx), 0)
# Form III p(1+q)=qz : log(az-1) = x+ay+b  => z = (1+exp(x+a y+b))/a
Zx = (1 + exp(x + A_*y + B_))/A_
check("U4 Form III p(1+q)=qz", simplify(diff(Zx, x)*(1 + diff(Zx, y)) - diff(Zx, y)*Zx), 0)
Zx = x**3/3 + A_*x + A_*y - y**3/3 + B_
check("U4 Form IV p-x^2=q+y^2", simplify((diff(Zx, x) - x**2) - (diff(Zx, y) + y**2)), 0)
# Form III z^2(p^2+q^2+1)=1 ... skip; Form IV p^2+q^2 = x+y? z = (2/3)(x+a)^{3/2} + (2/3)(y-a)^{3/2} + b
Zx = Rational(2, 3)*(x + A_)**Rational(3, 2) + Rational(2, 3)*(y - A_)**Rational(3, 2) + B_
check("U4 Form IV p^2+q^2=x+y", simplify(diff(Zx, x)**2 + diff(Zx, y)**2 - (x + y)), 0)

# ---------------- UNIT V ----------------
F1, F2, F3 = Function('f1'), Function('f2'), Function('f3')
def op(expr, coeffs):
    """Apply sum c_ij D^i D'^j to expr, coeffs dict {(i,j): c}."""
    return sum(cf*diff(expr, x, i, y, j) if (i or j) else cf*expr for (i, j), cf in coeffs.items())
def dxy(e, i, j):
    r = e
    if i: r = diff(r, x, i)
    if j: r = diff(r, y, j)
    return r
def apply(coeffs, e):
    return simplify(sum(cf*dxy(e, i, j) for (i, j), cf in coeffs.items()))
L1 = {(2, 0): 1, (1, 1): -5, (0, 2): 6}
check("U5 CF D^2-5DD'+6D'^2", apply(L1, F1(y + 2*x) + F2(y + 3*x)), 0)
check("U5 PI e^{x+y}/2", apply(L1, exp(x + y)/2), exp(x + y))
L2 = {(3, 0): 1, (2, 1): -3, (0, 3): 4}
check("U5 CF cubic", apply(L2, F1(y - x) + F2(y + 2*x) + x*F3(y + 2*x)), 0)
L3 = {(2, 0): 1, (1, 1): 2, (0, 2): 1}
check("U5 CF repeated", apply(L3, F1(y - x) + x*F2(y - x)), 0)
L4 = {(2, 0): 1, (1, 1): -2, (0, 2): 1}
check("U5 PI cos(x-3y)", apply(L4, -cos(x - 3*y)/16), cos(x - 3*y))
L5 = {(2, 0): 1, (1, 1): 1, (0, 2): -6}
check("U5 PI failure x sin(2x+y)/5", apply(L5, x*sin(2*x + y)/5), cos(2*x + y))
check("U5 CF D^2+DD'-6D'^2", apply(L5, F1(y + 2*x) + F2(y - 3*x)), 0)
check("U5 PI y cos x", apply(L5, sin(x) - y*cos(x)), y*cos(x))
L6 = {(2, 0): 1, (1, 1): 3, (0, 2): 2}
check("U5 PI x+y", apply(L6, x**2*y/2 - x**3/3), x + y)
check("U5 general rule (D^2-D'^2): x - y", apply({(2, 0): 1, (0, 2): -1}, x**3/6 - x**2*y/2), x - y)
check("U5 CF D^2+3DD'+2D'^2", apply(L6, F1(y - x) + F2(y - 2*x)), 0)
L7 = {(2, 0): 1, (0, 2): -1, (1, 0): 1, (0, 1): -1}
check("U5 nonhom CF", apply(L7, F1(y + x) + exp(-x)*F2(y - x)), 0)
L8 = {(2, 0): 1, (1, 1): -2, (0, 2): 1, (1, 0): -3, (0, 1): 3, (0, 0): 2}  # (D-D'-1)(D-D'-2)
check("U5 nonhom2 CF", apply(L8, exp(x)*F1(y + x) + exp(2*x)*F2(y + x)), 0)
check("U5 nonhom2 PI", apply(L8, exp(2*x - y)/2), exp(2*x - y))
L9 = {(2, 0): 1, (0, 2): -1, (1, 0): -3, (0, 1): 3}  # (D-D')(D+D'-3)
check("U5 nonhom3 CF", apply(L9, F1(y + x) + exp(3*x)*F2(y - x)), 0)
check("U5 nonhom3 PI", apply(L9, -exp(x - 2*y)/12), exp(x - 2*y))
# separation of variables
U = 4*exp(-x + Rational(3, 2)*y)
check("U5 sep1 PDE", simplify(3*diff(U, x) + 2*diff(U, y)), 0); check("U5 sep1 IC", U.subs(y, 0), 4*exp(-x))
U = 6*exp(-3*x - 2*t)
check("U5 sep2 PDE", simplify(diff(U, x) - 2*diff(U, t) - U), 0); check("U5 sep2 IC", U.subs(t, 0), 6*exp(-3*x))
U = 8*exp(-12*x - 3*y)
check("U5 sep3 PDE", simplify(diff(U, x) - 4*diff(U, y)), 0); check("U5 sep3 IC", U.subs(x, 0), 8*exp(-3*y))
# wave
check("U5 wave An parabola", simplify(2/l*integrate(k*(l*x - x**2)*sin(n*pi*x/l), (x, 0, l))), 4*k*l**2*(1 - (-1)**n)/(n**3*pi**3))
An = 2/l*(integrate(2*k*x/l*sin(n*pi*x/l), (x, 0, l/2)) + integrate(2*k*(l - x)/l*sin(n*pi*x/l), (x, l/2, l)))
check("U5 wave triangular An", simplify(An), 8*k*sin(n*pi/2)/(n**2*pi**2))
v0 = symbols('v0', positive=True)
Uw = v0*l/(12*pi*c)*(9*sin(pi*x/l)*sin(pi*c*t/l) - sin(3*pi*x/l)*sin(3*pi*c*t/l))
check("U5 wave velocity PDE", simplify(diff(Uw, t, 2) - c**2*diff(Uw, x, 2)), 0)
check("U5 wave velocity u(x,0)", Uw.subs(t, 0), 0)
check("U5 wave velocity u_t(x,0)", simplify(diff(Uw, t).subs(t, 0) - v0*sin(pi*x/l)**3), 0)
Uw = a*sin(pi*x/l)*cos(pi*c*t/l)
check("U5 wave single mode", simplify(diff(Uw, t, 2) - c**2*diff(Uw, x, 2)), 0)
# heat
check("U5 heat bn const 100", simplify(2/l*integrate(100*sin(n*pi*x/l), (x, 0, l))), 200*(1 - (-1)**n)/(n*pi))
Uh = Rational(3, 4)*sin(pi*x/l)*exp(-c**2*pi**2*t/l**2) - Rational(1, 4)*sin(3*pi*x/l)*exp(-9*c**2*pi**2*t/l**2)
check("U5 heat sin^3 PDE", simplify(diff(Uh, t) - c**2*diff(Uh, x, 2)), 0)
check("U5 heat sin^3 IC", simplify(Uh.subs(t, 0) - sin(pi*x/l)**3), 0)
check("U5 heat x(l-x) bn", simplify(2/l*integrate(x*(l - x)*sin(n*pi*x/l), (x, 0, l))), 4*l**2*(1 - (-1)**n)/(n**3*pi**3))
check("U5 heat insulated a0", 2/l*integrate(x, (x, 0, l)), l)
check("U5 heat insulated an", simplify(2/l*integrate(x*cos(n*pi*x/l), (x, 0, l))), 2*l*((-1)**n - 1)/(n**2*pi**2))
# Laplace
check("U5 Laplace rect const k", simplify(2/a*integrate(k*sin(n*pi*x/a), (x, 0, a))), 2*k*(1 - (-1)**n)/(n*pi))
Ul = sin(x)*sinh(y)/sinh(pi) + sin(2*x)*sinh(2*y)/sinh(2*pi)
check("U5 Laplace square PDE", simplify(diff(Ul, x, 2) + diff(Ul, y, 2)), 0)
check("U5 Laplace square top edge", simplify(Ul.subs(y, pi) - sin(x) - sin(2*x)), 0)
check("U5 Laplace semi-inf u0 bn", simplify(2/l*integrate(sin(n*pi*x/l), (x, 0, l))), 2*(1 - (-1)**n)/(n*pi))
check("U5 Laplace semi-inf x(pi-x) bn", simplify(2/pi*integrate(x*(pi - x)*sin(n*x), (x, 0, pi))), 4*(1 - (-1)**n)/(pi*n**3))
Ul = sin(n*pi*x/l)*exp(-n*pi*y/l)
check("U5 Laplace semi-inf mode", simplify(diff(Ul, x, 2) + diff(Ul, y, 2)), 0)

print(f"\n{count - len(failures)}/{count} checks passed")
sys.exit(1 if failures else 0)
