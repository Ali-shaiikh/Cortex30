"use client";

import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";

// The coach reasons before answering (typically 8-15 s). Showing what it's doing makes the wait purposeful.
const STEPS = [
  { at: 0, label: "Reading your answer and reasoning" },
  { at: 2.5, label: "Comparing it with the expert solution" },
  { at: 5.5, label: "Finding the exact step where your logic held or slipped" },
  { at: 8.5, label: "Naming your thinking pattern" },
  { at: 11, label: "Writing your feedback and a 2-minute drill" },
];
const EXPECTED_S = 13;

export function GradingProgress() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed((performance.now() - start) / 1000), 200);
    return () => clearInterval(id);
  }, []);
  const current = STEPS.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);
  // Eases towards 95% so the bar never claims to be done before the coach is.
  const pct = Math.min(95, 100 * (1 - Math.exp(-elapsed / (EXPECTED_S / 1.6))));

  return (
    <div className="space-y-3 rounded-xl border border-neon/15 bg-neon/[0.04] p-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">The coach is analysing your thinking</span>
        <span className="tabular-nums text-xs text-white/45">{Math.floor(elapsed)}s</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-neon to-magenta transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
      <ol className="space-y-1.5 text-sm">
        {STEPS.map((s, i) => (
          <li key={s.label} className={`flex items-center gap-2 transition-colors ${i < current ? "text-white/45" : i === current ? "text-white" : "text-white/25"}`}>
            {i < current ? (
              <Icon name="check" size={13} className="text-emerald-300" />
            ) : i === current ? (
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-neon shadow-[0_0_8px_#6fe7ff]" />
            ) : (
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20" />
            )}
            {s.label}
          </li>
        ))}
      </ol>
      <p className="text-xs text-white/40">
        {elapsed < 20 ? "Usually 10–15 seconds: the coach reasons carefully before it grades." : "Taking a little longer than usual. The free AI tier is busy; hang tight."}
      </p>
    </div>
  );
}
