import katex from 'katex';
import { Fragment, memo, useMemo } from 'react';

type Segment = { kind: 'text'; value: string } | { kind: 'inline' | 'display'; value: string };

/** Split "text $inline$ more $$display$$" into segments. A literal dollar can be written as \$. */
export function splitMath(src: string): Segment[] {
  const out: Segment[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$])+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ kind: 'text', value: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: 'display', value: m[1] });
    else out.push({ kind: 'inline', value: m[2] });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ kind: 'text', value: src.slice(last) });
  return out;
}

export function renderTex(tex: string, display: boolean, strict = false): string {
  return katex.renderToString(tex, { displayMode: display, throwOnError: strict, strict: 'ignore', output: 'htmlAndMathml', trust: false });
}

/** Very small markdown subset for prose: **bold** and *italic*. */
function Prose({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i} className="font-semibold text-slate-100">{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export const MathText = memo(function MathText({ text, className }: { text: string; className?: string }) {
  const segs = useMemo(() => splitMath(text), [text]);
  return (
    <span className={className}>
      {segs.map((s, i) => {
        if (s.kind === 'text') return <Prose key={i} text={s.value} />;
        const html = renderTex(s.value, s.kind === 'display');
        return s.kind === 'display' ? (
          <span key={i} className="math-display block overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <span key={i} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </span>
  );
});

export const TeX = memo(function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => renderTex(tex, display), [tex, display]);
  return display ? (
    <div className="math-display overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
});
