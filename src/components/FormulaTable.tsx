import type { Formula } from '../types';
import { TeX } from './MathText';
import { provenanceLabel } from './ui';

export function FormulaTable({ formulas, showTopic }: { formulas: (Formula & { topicTitle?: string })[]; showTopic?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-3 font-medium">Name</th>
            <th className="py-2 pr-3 font-medium">Formula</th>
            <th className="py-2 font-medium">Conditions / source</th>
          </tr>
        </thead>
        <tbody>
          {formulas.map((f) => (
            <tr key={f.id} className="border-b border-ink-700/60 align-top">
              <td className="py-2 pr-3 text-slate-200">
                {f.label}
                {showTopic && f.topicTitle && <div className="text-xs text-slate-500">{f.topicTitle}</div>}
              </td>
              <td className="max-w-[28rem] py-2 pr-3 text-slate-100"><TeX tex={f.tex} display /></td>
              <td className="py-2 text-xs text-slate-400">
                {f.conditions && <div className="mb-1 text-slate-300">{f.conditions}</div>}
                <div>{provenanceLabel[f.provenance]}</div>
                {f.sourceRef && <div className="font-mono">{f.sourceRef.file} p. {f.sourceRef.pages}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
