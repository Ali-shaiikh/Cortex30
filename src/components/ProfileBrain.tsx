"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrainData, BrainNode } from "@/lib/brainData";
import { CATEGORIES, CATEGORY_META, type Category, type Submission } from "@/lib/types";
import { BrainStage } from "./brain/BrainStage";
import { FeedbackView } from "./exercise/FeedbackView";
import { Icon } from "./ui/Icon";

type Detail = { key: string; submission: Submission };

export function ProfileBrain({ data, details, username }: { data: BrainData; details: Detail[]; username: string }) {
  const [filter, setFilter] = useState<Category | null>(null);
  const [selected, setSelected] = useState<BrainNode | null>(null);
  const byKey = useMemo(() => new Map(details.map((d) => [d.key, d])), [details]);
  const detail = selected ? byKey.get(`${selected.category}-${selected.day}`) : undefined;
  const completed = data.nodes.filter((n) => n.state === "completed").length;

  return (
    <div className="relative -mx-4 -mb-[calc(6rem+env(safe-area-inset-bottom))] -mt-4 sm:-mb-24 sm:-mt-6">
      <div className="relative h-[calc(100dvh-7.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full sm:h-[calc(100dvh-3.5rem)]">
        <BrainStage data={data} interactive className="absolute inset-0" filter={filter} onFilter={setFilter} onSelect={setSelected} />

        <div className="pointer-events-none absolute left-4 top-4 space-y-2">
          <div className="glass pointer-events-auto px-4 py-3">
            <div className="font-mono text-xs text-white/50">@{username}</div>
            <div className="font-mono text-lg">
              {completed}
              <span className="text-cyan-100/40">/120 synapses online</span>
            </div>
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(filter === c ? null : c)}
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur ${filter === c ? "bg-neon/15" : "bg-black/40"}`}
                style={{ borderColor: `${CATEGORY_META[c].color}77`, color: CATEGORY_META[c].color }}
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-center font-mono text-[10px] tracking-widest text-cyan-100/40 sm:block">DRAG · ROTATE  ·  SCROLL · ZOOM  ·  CLICK A NODE TO DECODE</p>
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-widest text-cyan-100/40 sm:hidden">DRAG · PINCH · TAP A NODE</p>

        {filter && (
          <div className="glass absolute bottom-10 left-4 right-4 max-h-[35vh] overflow-y-auto p-3 text-sm sm:bottom-4 sm:right-auto sm:w-64">
            <div className="label mb-2" style={{ color: CATEGORY_META[filter].color }}>
              {CATEGORY_META[filter].label} pathway
            </div>
            <ul className="space-y-1">
              {data.nodes
                .filter((n) => n.category === filter && n.state !== "locked")
                .map((n) => (
                  <li key={n.day}>
                    <button onClick={() => setSelected(n)} className="flex w-full justify-between rounded px-1.5 py-0.5 text-left hover:bg-white/5">
                      <span className="truncate text-white/80">
                        D{n.day} {n.title}
                      </span>
                      <span className="font-mono text-white/50">{n.score ?? "·"}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              className="glass-strong absolute inset-x-2 bottom-2 top-16 overflow-y-auto p-5 sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[420px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider" style={{ color: CATEGORY_META[selected.category].color }}>
                    {CATEGORY_META[selected.category].label} · Day {selected.day}
                  </div>
                  <h2 className="text-lg font-semibold">{selected.title}</h2>
                  <p className="text-sm text-white/50">{selected.concept}</p>
                </div>
                <button onClick={() => setSelected(null)} className="btn btn-ghost px-2.5 py-1" aria-label="Close">
                  <Icon name="close" />
                </button>
              </div>
              {detail ? (
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <div className="label mb-1">My answer</div>
                    <p className="whitespace-pre-line text-white/85">{detail.submission.answer}</p>
                  </div>
                  <div>
                    <div className="label mb-1">My reasoning</div>
                    <p className="whitespace-pre-line text-white/85">{detail.submission.reasoning}</p>
                  </div>
                  <FeedbackView feedback={detail.submission.feedback_json} hintsUsed={detail.submission.hints_used} />
                </div>
              ) : (
                <div className="mt-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-cyan-100/60">
                    <Icon name="node" size={12} /> Synapse ready to fire.
                  </p>
                  <Link href={`/day/${selected.day}?c=${selected.category}`} className="btn btn-primary mt-3">
                    Fire it <Icon name="arrowRight" />
                  </Link>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
