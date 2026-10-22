import { useEffect, useRef, useState } from 'react';
import type { UnitId } from '../types';
import { allFormulas, units } from '../data';
import { FormulaTable } from './FormulaTable';
import { Button } from './ui';

export function printSection() {
  document.body.classList.add('print-only-area');
  const done = () => {
    document.body.classList.remove('print-only-area');
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

export function FormulaReview({ open, onClose, initialUnit = 'all' }: { open: boolean; onClose: () => void; initialUnit?: UnitId | 'all' }) {
  const [unit, setUnit] = useState<UnitId | 'all'>(initialUnit);
  const closeRef = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Reset the filter and move focus only when the dialog opens (not on every parent re-render).
  useEffect(() => {
    if (!open) return;
    setUnit(initialUnit);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const list = unit === 'all' ? allFormulas : allFormulas.filter((f) => f.unit === unit);
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="formula-review-title">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden border border-ink-600 bg-ink-900 sm:rounded-xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-700 p-3">
          <h2 id="formula-review-title" className="mr-auto text-lg font-semibold text-slate-100">Formula review</h2>
          <Button variant="ghost" onClick={printSection}>Print / save as PDF</Button>
          <Button ref={closeRef} variant="subtle" onClick={onClose} ariaLabel="Close formula review">Close ✕</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-b border-ink-700 p-3" role="tablist" aria-label="Filter by unit">
          {(['all', 1, 2, 3, 4, 5] as const).map((u) => (
            <button key={u} role="tab" aria-selected={unit === u} onClick={() => setUnit(u)} className={`rounded-md px-2.5 py-1 text-sm focus-ring ${unit === u ? 'bg-accent-600 text-white' : 'bg-ink-800 text-slate-300 hover:bg-ink-700'}`}>
              {u === 'all' ? 'All units' : `Unit ${['I', 'II', 'III', 'IV', 'V'][u - 1]}`}
            </button>
          ))}
        </div>
        <div className="print-area overflow-y-auto p-3 sm:p-4">
          <p className="mb-2 hidden text-black print:block">M3 R20 formula sheet — {unit === 'all' ? 'all units' : units[unit - 1].title}</p>
          <FormulaTable formulas={list} showTopic />
          <p className="mt-3 text-xs text-slate-500">{list.length} formulas. Each row shows whether it is verified from your notes or is additional mathematical knowledge.</p>
        </div>
      </div>
    </div>
  );
}
