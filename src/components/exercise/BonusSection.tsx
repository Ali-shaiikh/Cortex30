"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExercisePublic, Submission } from "@/lib/types";
import { ExerciseFlow } from "./ExerciseFlow";
import { Icon } from "../ui/Icon";

export function BonusSection({ day, bonus, submission }: { day: number; bonus: ExercisePublic | null; submission: Submission | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (bonus) return <ExerciseFlow exercise={bonus} submission={submission} locked={null} bonus />;

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/bonus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Could not create the bonus");
    router.refresh();
  }

  return (
    <section className="focus-panel flex flex-wrap items-center gap-4 p-5 sm:p-6">
      <div className="flex-1">
        <div className="text-xs text-white/50">AI coach · 5 min · optional</div>
        <h3 className="flex items-center gap-1.5 text-base font-semibold text-white">
          <Icon name="spark" size={14} className="text-neon" /> Weak-spot drill
        </h3>
        <p className="mt-1 text-[0.95rem] text-white/75">The coach writes one exercise aimed at the thinking pattern you slip into most. Once answered, it orbits your brain as a satellite node.</p>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
      <button className="btn btn-primary" onClick={generate} disabled={busy}>
        {busy ? "Compiling drill…" : "Generate drill"}
      </button>
    </section>
  );
}
