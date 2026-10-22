import { lazy, Suspense } from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProgressProvider } from './lib/progress';
import { units } from './data';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const UnitPage = lazy(() => import('./pages/UnitPage'));
const PapersPage = lazy(() => import('./pages/PapersPage'));

function Loading() {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" aria-hidden />
      Loading…
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 p-6">
      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <p className="mt-1 text-sm text-slate-400">This app has exactly seven pages. Use the menu, or go back to the <Link to="/" className="text-accent-300 underline focus-ring">Dashboard</Link>.</p>
    </div>
  );
}

/** Exactly seven routes: dashboard, five units, previous papers. */
export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            {units.map((u) => (
              <Route key={u.id} path={u.path.slice(1)} element={<UnitPage unitId={u.id} />} />
            ))}
            <Route path="papers" element={<PapersPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ProgressProvider>
  );
}
