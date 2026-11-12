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
      <div className="display neon text-xs font-bold">Neural status report</div>
      {text ? (
        <p className="mt-2 font-read leading-relaxed text-cyan-50/85">{text}</p>
      ) : (
        <p className="mt-2 text-white/50">{busy ? "Coach is scanning your synapses…" : enoughData ? "No report yet." : "Fire a couple of synapses and your coach will report where you stand."}</p>
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
    <div className="border border-neon/10 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="display text-xs font-bold text-cyan-50">Transmission {String(week).padStart(2, "0")}</h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-100/40">week {week} · S{week * 7}</span>
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
          {busy ? "Decoding…" : "Receive transmission"}
        </button>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-100/40">Unlocks at session {week * 7}</p>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
