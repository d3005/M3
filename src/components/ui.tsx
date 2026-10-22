import { forwardRef, useId, useState, type ReactNode } from 'react';
import type { Priority, Provenance, Question, SourceType, TopicStatus, VerificationStatus } from '../types';
import { priorityExplain, priorityLabel } from '../data';

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-xl border border-ink-700 bg-ink-850 p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-slate-100">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
    </div>
  );
}

export function ProgressBar({ value, label, small = false }: { value: number; label?: string; small?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span className="tabular-nums text-slate-300">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-ink-700 ${small ? 'h-1.5' : 'h-2.5'}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'progress'}>
        <div className="h-full rounded-full bg-accent-500 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'violet';
const tones: Record<Tone, string> = {
  blue: 'border-accent-500/40 bg-accent-500/10 text-accent-300',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  red: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  slate: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
};

export function Badge({ children, tone = 'slate', title }: { children: ReactNode; tone?: Tone; title?: string }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const sourceTypeLabel: Record<SourceType, string> = {
  uploaded_past_paper: 'Past paper (uploaded)',
  uploaded_note: 'From uploaded notes',
  generated_practice: 'Generated practice — not from an uploaded past paper',
  student_entered: 'Entered by you (unverified)',
};

export function SourceBadge({ type }: { type: SourceType }) {
  const tone: Tone = type === 'uploaded_past_paper' ? 'blue' : type === 'uploaded_note' ? 'violet' : type === 'student_entered' ? 'amber' : 'slate';
  return <Badge tone={tone}>{sourceTypeLabel[type]}</Badge>;
}

export const verificationLabel: Record<VerificationStatus, string> = {
  verified_symbolic: 'Solution machine-checked',
  checked_by_hand: 'Solution checked by hand',
  not_verified: 'Solution not yet verified',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const tone: Tone = status === 'verified_symbolic' ? 'green' : status === 'checked_by_hand' ? 'blue' : 'amber';
  return (
    <Badge tone={tone} title={status === 'verified_symbolic' ? 'Final answer checked with SymPy (scripts/verify_*.py). This is our solution, not an official answer key.' : undefined}>
      {verificationLabel[status]}
    </Badge>
  );
}

export const provenanceLabel: Record<Provenance, string> = {
  verified_notes: 'Verified from uploaded notes',
  verified_papers: 'Verified from uploaded past papers',
  math_knowledge: 'Additional explanation (math knowledge)',
  recommendation: 'Study recommendation',
};

export function ProvenanceBadges({ items }: { items: Provenance[] }) {
  const tone: Record<Provenance, Tone> = { verified_notes: 'violet', verified_papers: 'blue', math_knowledge: 'slate', recommendation: 'amber' };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => (
        <Badge key={p} tone={tone[p]}>{provenanceLabel[p]}</Badge>
      ))}
    </div>
  );
}

export function PriorityBadge({ p }: { p: Priority }) {
  return (
    <Badge tone={p === 'core' ? 'red' : p === 'important' ? 'amber' : 'slate'} title={priorityExplain}>
      {priorityLabel[p]} · recommendation
    </Badge>
  );
}

export function StatusPill({ s }: { s: TopicStatus }) {
  const map: Record<TopicStatus, [string, Tone]> = {
    not_started: ['Not started', 'slate'],
    learning: ['Learning', 'blue'],
    practising: ['Practising', 'amber'],
    mastered: ['Mastered', 'green'],
  };
  return <Badge tone={map[s][1]}>{map[s][0]}</Badge>;
}

export function Collapsible({ title, children, defaultOpen = false, right }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; right?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/60">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-slate-200 focus-ring" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          <span aria-hidden className={`inline-block transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
          {title}
        </button>
        {right}
      </div>
      {open && (
        <div id={id} className="border-t border-ink-700 px-3 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, onClick, variant = 'primary', type = 'button', disabled, className = '', ariaLabel },
  ref,
) {
  const v = {
    primary: 'bg-accent-600 text-white hover:bg-accent-500 border-accent-500',
    ghost: 'bg-transparent text-slate-200 hover:bg-ink-700 border-ink-600',
    subtle: 'bg-ink-800 text-slate-200 hover:bg-ink-700 border-ink-700',
    danger: 'bg-rose-600/90 text-white hover:bg-rose-500 border-rose-500',
  }[variant];
  return (
    <button ref={ref} type={type} aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-ring ${v} ${className}`}>
      {children}
    </button>
  );
});

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-600 bg-ink-900/40 p-5 text-center">
      <p className="font-medium text-slate-200">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function QuestionMeta({ q }: { q: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <SourceBadge type={q.sourceType} />
      {q.exam && (
        <Badge tone="blue">
          {q.exam.date} · {q.exam.type} · {q.exam.set} · Q{q.exam.questionNumber}
        </Badge>
      )}
      {q.marks !== null && <Badge>{q.marks} marks</Badge>}
      <Badge>{q.difficulty}</Badge>
      <VerificationBadge status={q.verificationStatus} />
      {q.transcription === 'exact_suspected_misprint' && <Badge tone="amber">Printed as shown — suspected misprint</Badge>}
      {q.transcription === 'reconstructed' && <Badge tone="amber">Reconstructed from damaged scan</Badge>}
    </div>
  );
}
