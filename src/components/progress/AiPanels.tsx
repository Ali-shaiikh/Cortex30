"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../ui/Markdown";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

/** "Where you stand": regenerated automatically at most once per day. */
export function SummaryCard({ text, stale, enoughData }: { text: string | null; stale: boolean; enoughData: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!stale || !enoughData || started.current) return;
    started.current = true;
    setBusy(true);
    post("/api/summary", {})
      .then(() => router.refresh())
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [stale, enoughData, router]);

  return (
    <section className="glass p-5">
      <div className="label text-rim">Where you stand</div>
      {text ? (
        <p className="mt-2 leading-relaxed text-white/85">{text}</p>
      ) : (
        <p className="mt-2 text-white/50">{busy ? "Your coach is reading your answers…" : enoughData ? "No summary yet." : "Complete a couple of exercises and your coach will summarise where you stand."}</p>
      )}
      {busy && text && <p className="mt-2 text-xs text-white/40">Updating for today…</p>}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </section>
  );
}

export function ReportCard({ week, text, unlocked }: { week: number; text: string | null; unlocked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Week {week}</h3>
        <span className="font-mono text-xs text-white/40">day {week * 7}</span>
      </div>
      {text ? (
        <Markdown text={text} />
      ) : unlocked ? (
        <button
          className="btn btn-ghost"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await post("/api/report", { kind: "weekly", week });
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Writing your report…" : "Generate coach report"}
        </button>
      ) : (
        <p className="text-sm text-white/40">Unlocks on day {week * 7}.</p>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
