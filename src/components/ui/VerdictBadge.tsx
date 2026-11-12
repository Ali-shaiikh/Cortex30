import type { Verdict } from "@/lib/types";

const STYLE: Record<Verdict, { label: string; cls: string }> = {
  correct: { label: "Correct", cls: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200" },
  strong: { label: "Strong", cls: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200" },
  partially_correct: { label: "Partially correct", cls: "border-amber-400/40 bg-amber-400/15 text-amber-200" },
  developing: { label: "Developing", cls: "border-amber-400/40 bg-amber-400/15 text-amber-200" },
  incorrect: { label: "Incorrect", cls: "border-red-400/40 bg-red-400/15 text-red-200" },
  weak: { label: "Weak", cls: "border-red-400/40 bg-red-400/15 text-red-200" },
};

export function VerdictBadge({ verdict, score }: { verdict: Verdict; score?: number }) {
  const s = STYLE[verdict];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
      {score !== undefined && <span className="font-mono">{score}/10</span>}
    </span>
  );
}
