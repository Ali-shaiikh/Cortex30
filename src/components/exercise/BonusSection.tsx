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
    <section className="glass flex flex-wrap items-center gap-4 p-5">
      <div className="flex-1">
        <div className="display neon flex items-center gap-1.5 text-xs font-bold">
          <Icon name="spark" size={13} /> Session complete
        </div>
        <p className="mt-1 font-read text-sm text-cyan-50/80">Optional weak-spot drill: the coach writes one exercise aimed at your most frequent thinking pattern. It orbits your brain as a satellite node.</p>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
      <button className="btn btn-primary" onClick={generate} disabled={busy}>
        {busy ? "Compiling drill…" : "Generate drill"}
      </button>
    </section>
  );
}
