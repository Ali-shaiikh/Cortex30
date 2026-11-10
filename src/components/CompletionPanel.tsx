"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompletionPanel({ hasFinal }: { hasFinal: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "final" }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Could not write the review");
    router.push("/progress#final");
    router.refresh();
  }

  return (
    <section className="glass relative overflow-hidden p-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(111,231,255,0.18),transparent_60%)]" />
      <div className="relative">
        <div className="font-mono text-xs tracking-[0.3em] text-rim">PROGRAM COMPLETE</div>
        <h2 className="mt-2 text-2xl font-semibold">30 days. 120 reps. Your whole brain is lit.</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {hasFinal ? (
            <Link href="/progress#final" className="btn btn-primary">
              Read your final review
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={generate} disabled={busy}>
              {busy ? "The coach is reviewing 30 days…" : "Get your final AI review"}
            </button>
          )}
          <a href="/api/export" className="btn btn-ghost">
            Export everything (.md)
          </a>
          <Link href="/profile" className="btn btn-ghost">
            See your brain
          </Link>
        </div>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  );
}
