"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_META, type Category, type ExercisePublic, type Submission } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { ExerciseFlow } from "./ExerciseFlow";

type Item = { exercise: ExercisePublic; submission: Submission | null; locked: string | null; completesDay: boolean };

/** The four skill tabs of a session. Switching tabs is instant (no server round trip); drafts stay mounted. */
export function DaySession({ day, items, initial }: { day: number; items: Record<Category, Item>; initial: Category }) {
  const [active, setActive] = useState<Category>(initial);

  function select(c: Category) {
    setActive(c);
    const url = new URL(window.location.href);
    url.searchParams.set("c", c);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const { submission, locked } = items[cat];
          const selected = cat === active;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={selected}
              onClick={() => select(cat)}
              className={`border px-3 py-2.5 text-left text-sm backdrop-blur transition ${selected ? "bg-neon/[0.08]" : "border-neon/10 bg-ink/50 hover:bg-neon/[0.05]"}`}
              style={selected ? { borderColor: `${meta.color}88` } : undefined}
            >
              <div className="display text-[11px] font-bold" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-100/50">
                {submission ? (
                  <>
                    <Icon name="synapse" size={11} /> fired {submission.score}/10
                  </>
                ) : locked ? (
                  <>
                    <Icon name="lock" size={11} /> locked
                  </>
                ) : (
                  <>
                    <Icon name="node" size={11} /> ready
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {CATEGORIES.map((cat) => (
        <div key={`${cat}-${day}`} hidden={cat !== active} role="tabpanel">
          <ExerciseFlow {...items[cat]} />
        </div>
      ))}
    </>
  );
}
