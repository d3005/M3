import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { units } from '../data';
import { useProgress } from '../lib/progress';
import { unitProgress } from '../lib/analytics';
import { search, type SearchHit } from '../lib/search';
import { ProgressBar } from './ui';

export const NAV = [
  { to: '/', label: 'Dashboard', short: 'Home', end: true },
  ...units.map((u) => ({ to: u.path, label: u.title, short: `Unit ${['I', 'II', 'III', 'IV', 'V'][u.id - 1]}`, end: false, unit: u.id })),
  { to: '/papers', label: 'Previous Papers, Practice & Mock Exams', short: 'Papers', end: false },
] as { to: string; label: string; short: string; end: boolean; unit?: 1 | 2 | 3 | 4 | 5 }[];

function GlobalSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const hits: SearchHit[] = q.trim().length >= 2 ? search(q, 12) : [];
  const listId = 'global-search-results';

  const go = (h: SearchHit) => {
    setOpen(false);
    setQ('');
    navigate(h.to);
    onNavigate?.();
  };

  return (
    <div className="relative">
      <label htmlFor="global-search" className="sr-only">Search topics, formulas and questions</label>
      <input
        id="global-search"
        type="search"
        value={q}
        placeholder="Search topics, formulas, questions…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        aria-activedescendant={hits[active] ? `sr-${hits[active].kind}-${hits[active].id}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && hits[active]) { e.preventDefault(); go(hits[active]); }
          if (e.key === 'Escape') setOpen(false);
        }}
        className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-ring"
      />
      {open && q.trim().length >= 2 && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border border-ink-600 bg-ink-850 shadow-xl">
          {hits.length === 0 && <li className="px-3 py-2 text-sm text-slate-400">No matches for “{q}”. Try a shorter word (e.g. “stokes”, “clairaut”).</li>}
          {hits.map((h, i) => (
            <li
              key={`${h.kind}-${h.id}`}
              id={`sr-${h.kind}-${h.id}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); go(h); }}
              className={`cursor-pointer px-3 py-2 text-sm ${i === active ? 'bg-ink-700' : 'hover:bg-ink-800'}`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-ink-700 px-1 text-[10px] uppercase tracking-wide text-slate-300">{h.kind}</span>
                <span className="truncate text-slate-100">{h.title}</span>
              </div>
              <div className="truncate text-xs text-slate-400">Unit {['I', 'II', 'III', 'IV', 'V'][h.unit - 1]} · {h.context}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useProgress();
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV.map((n, i) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              onClick={onNavigate}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm focus-ring ${isActive ? 'bg-accent-600/20 text-white ring-1 ring-accent-500/50' : 'text-slate-300 hover:bg-ink-800 hover:text-white'}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="w-4 shrink-0 text-xs tabular-nums text-slate-500">{i + 1}</span>
                <span className="leading-snug">{n.label}</span>
              </div>
              {n.unit && <div className="ml-6 mt-1"><ProgressBar value={unitProgress(state, n.unit)} small /></div>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { storageOk, loadError } = useProgress();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200">
      <a href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent-600 focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 border-b border-ink-700 bg-ink-950/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button type="button" className="rounded-md border border-ink-600 px-2.5 py-1.5 text-sm text-slate-200 focus-ring" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <span className="truncate font-semibold text-white">M3 · R20 Exam Prep</span>
        </div>
        {menuOpen && (
          <div id="mobile-nav" className="max-h-[80vh] space-y-3 overflow-y-auto border-t border-ink-700 px-4 py-3">
            <GlobalSearch onNavigate={() => setMenuOpen(false)} />
            <NavList onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-ink-700 bg-ink-950 p-4 lg:flex">
          <div>
            <div className="text-lg font-semibold text-white">M3 · R20 Exam Prep</div>
            <div className="text-xs text-slate-400">JNTUK Mathematics-III · R2021011</div>
          </div>
          <GlobalSearch />
          <NavList />
          <p className="mt-auto text-[11px] leading-snug text-slate-500">
            Progress is saved in this browser only (localStorage). No account, no cloud sync.
          </p>
        </aside>

        <main id="main" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 px-4 py-5 outline-none sm:px-6 lg:px-8">
          {!storageOk && (
            <div role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              Your browser is blocking local storage (private mode or disabled site data). Everything works, but progress will be lost when you close this tab.
            </div>
          )}
          {loadError && <div role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">{loadError}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
