"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATEGORY_META, type Category } from "@/lib/types";
import { Icon } from "../ui/Icon";

type Lesson = { category: Category; title: string; lesson: string; pattern: string | null };
type DrillId = "recall" | "math" | "guided";

// Targeted advice for the most common thinking patterns the coach tags.
const PATTERN_TIPS: { match: RegExp; tip: string }[] = [
  { match: /anchor/, tip: "Before reacting to any number, write down your own estimate first. Then compare it with the one you were given." },
  { match: /confirm/, tip: "For every belief you test, ask: what result would prove me wrong? Then go and look for that." },
  { match: /consequent|antecedent|conditional/, tip: "Rewrite every 'if A then B' as its contrapositive (not B → not A). Only that direction is guaranteed." },
  { match: /base rate/, tip: "Turn percentages into a crowd of 1,000 people and count. The rare group is smaller than it feels." },
  { match: /stopped too early|premature|incomplete/, tip: "Before you answer, list every case or option. Commit only after you have checked the last one." },
  { match: /overconfiden|calibrat/, tip: "Widen your ranges until you would be genuinely surprised to be wrong at both ends." },
  { match: /obvious|fluency|quantity|originality/, tip: "Throw away your first five ideas. The interesting ones start after the obvious ones run out." },
  { match: /correlation|causa/, tip: "When two things move together, name at least two other explanations before accepting that one causes the other." },
  { match: /generali|sample|survivor/, tip: "Ask who is missing from the data: the failures, the silent and the people who never responded." },
  { match: /assumption|unstated/, tip: "Write the hidden premise an argument needs, then ask whether you would accept it on its own." },
];

const GUIDED = [
  {
    title: "Observation sweep",
    minutes: 2,
    skill: "Attention",
    steps: ["Look around for 60 seconds and silently note as many specific details as you can.", "Close your eyes and list them out loud or on paper.", "Open your eyes and check what you missed."],
    why: "Deliberate noticing trains selective attention, the raw input for every kind of thinking.",
  },
  {
    title: "Explain it to a 12-year-old",
    minutes: 3,
    skill: "Understanding",
    steps: ["Pick one of today's lessons.", "Explain it out loud in simple words, with an everyday example.", "Wherever you stumble, that's the part you don't fully understand yet. Revisit it."],
    why: "The Feynman technique exposes gaps that rereading hides.",
  },
  {
    title: "Argue the other side",
    minutes: 3,
    skill: "Critical",
    steps: ["Choose one answer you gave today.", "Spend two minutes building the strongest case that it is wrong.", "Decide: does your answer survive?"],
    why: "Attacking your own conclusions is the fastest cure for confirmation bias.",
  },
  {
    title: "Box breathing + single focus",
    minutes: 3,
    skill: "Focus",
    steps: ["Breathe in 4 s, hold 4 s, out 4 s, hold 4 s. Repeat 4 times.", "Then do one small task with total attention. No phone, no tabs.", "Notice each time your mind wanders and gently return."],
    why: "Calming the stress response and practising sustained attention both improve working memory.",
  },
  {
    title: "Number span",
    minutes: 2,
    skill: "Working memory",
    steps: ["Ask someone (or a random generator) for a 6-digit number and repeat it backwards.", "Go up one digit each time you succeed.", "Stop when you fail twice at the same length; note your span."],
    why: "Backward digit span directly exercises the working memory you use to hold a problem in your head.",
  },
  {
    title: "Fermi minute",
    minutes: 2,
    skill: "Analytical",
    steps: ["Pick something around you (cars on your street, words you read today…).", "Estimate it in 60 seconds by breaking it into factors.", "Write your range and the factor you're least sure of."],
    why: "Quick decompositions make structured thinking automatic.",
  },
  {
    title: "Twenty uses",
    minutes: 3,
    skill: "Creative",
    steps: ["Pick any object on your desk.", "List 20 uses in 3 minutes. Don't judge, just write.", "Circle the strangest one and make it practical."],
    why: "Pushing past easy answers builds ideational fluency.",
  },
  {
    title: "Pre-mortem tomorrow",
    minutes: 2,
    skill: "Metacognition",
    steps: ["Imagine tomorrow went badly.", "Write the three most likely reasons why.", "Add one small action that prevents the biggest one."],
    why: "Prospective hindsight surfaces risks your optimism hides.",
  },
  {
    title: "Teach-back walk",
    minutes: 5,
    skill: "Consolidation",
    steps: ["Take a short walk without your phone.", "Mentally replay today's four problems and how the coach solved them.", "Say each transferable lesson once, out loud or in your head."],
    why: "Light movement plus spaced replay helps move learning into long-term memory.",
  },
  {
    title: "Spot three fallacies",
    minutes: 3,
    skill: "Critical",
    steps: ["Open any news headline, ad or social post.", "Find three reasoning flaws (missing base rate, anecdote, false choice…).", "Rewrite one claim so it's honest."],
    why: "Transferring a skill to real material is what makes it stick.",
  },
];

function loadDone(day: number): Record<DrillId, boolean> {
  try {
    return { recall: false, math: false, guided: false, ...JSON.parse(localStorage.getItem(`mg-sharpen-${day}`) ?? "{}") };
  } catch {
    return { recall: false, math: false, guided: false };
  }
}

export function SharpeningProtocol({ day, lessons, topPattern, bonus }: { day: number; lessons: Lesson[]; topPattern: string | null; bonus: ReactNode }) {
  const [done, setDone] = useState<Record<DrillId, boolean>>({ recall: false, math: false, guided: false });
  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage exists only after hydration
  useEffect(() => setDone(loadDone(day)), [day]);
  const mark = (id: DrillId) =>
    setDone((d) => {
      const next = { ...d, [id]: true };
      try {
        localStorage.setItem(`mg-sharpen-${day}`, JSON.stringify(next));
      } catch {}
      return next;
    });

  const tip = topPattern ? PATTERN_TIPS.find((t) => t.match.test(topPattern))?.tip : null;
  const guided = GUIDED[(day - 1) % GUIDED.length];
  const count = Object.values(done).filter(Boolean).length;

  return (
    <section className="space-y-4">
      <div className="glass p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label">{"// session complete"}</p>
            <h2 className="display neon mt-1 flex items-center gap-2 text-base font-bold">
              <Icon name="spark" size={16} /> Sharpening protocol
            </h2>
            <p className="mt-1 max-w-xl font-read text-sm text-cyan-50/70">
              Your four reps are done. These short drills lock in today&apos;s learning and train the raw capacities behind every skill: memory, speed and attention.
            </p>
          </div>
          <div className="font-mono text-xs text-neon">{count}/3 drills</div>
        </div>
      </div>

      <div className="focus-panel space-y-4 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Today&apos;s rewiring</h3>
        <ul className="space-y-2">
          {lessons.map((l) => (
            <li key={l.category} className="flex gap-3 rounded-xl bg-white/[0.035] p-3">
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_META[l.category].color }} />
              <div>
                <div className="text-xs text-white/50">
                  {CATEGORY_META[l.category].label} · {l.title}
                </div>
                <div className="text-[0.95rem] leading-relaxed text-white/90">{l.lesson}</div>
              </div>
            </li>
          ))}
        </ul>
        {topPattern && (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <div className="text-sm font-semibold text-amber-100">
              <Icon name="pattern" size={14} className="mr-1.5" />
              Focus for tomorrow: {topPattern}
            </div>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-white/80">
              {tip ?? "This is the thinking habit the coach flagged most often. Before each answer tomorrow, pause and check for it deliberately."}
            </p>
          </div>
        )}
      </div>

      <RecallDrill lessons={lessons} done={done.recall} onDone={() => mark("recall")} />
      <MathSprint day={day} done={done.math} onDone={() => mark("math")} />
      <GuidedDrill drill={guided} done={done.guided} onDone={() => mark("guided")} />
      {bonus}
    </section>
  );
}

function DrillCard({ title, meta, why, done, children }: { title: string; meta: string; why: string; done: boolean; children: ReactNode }) {
  return (
    <div className="focus-panel space-y-3 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">{meta}</div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {done && (
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            <Icon name="check" size={11} className="mr-1" />
            Done
          </span>
        )}
      </div>
      {children}
      <p className="text-xs leading-relaxed text-white/50">
        <span className="font-semibold text-white/70">Why it sharpens: </span>
        {why}
      </p>
    </div>
  );
}

function RecallDrill({ lessons, done, onDone }: { lessons: Lesson[]; done: boolean; onDone: () => void }) {
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  return (
    <DrillCard title="Lesson recall" meta="Memory · 2 min" why="Pulling knowledge out of memory (retrieval practice) strengthens it far more than rereading it." done={done}>
      <p className="text-[0.95rem] text-white/80">Without scrolling up, write today&apos;s four lessons from memory, one line each.</p>
      <textarea className="field min-h-28" value={text} onChange={(e) => setText(e.target.value)} placeholder="1. …" disabled={revealed} />
      {!revealed ? (
        <button className="btn btn-primary" onClick={() => setRevealed(true)} disabled={text.trim().length < 10}>
          Reveal & compare
        </button>
      ) : (
        <div className="space-y-3">
          <ol className="list-decimal space-y-1 rounded-xl bg-white/[0.035] p-4 pl-8 text-[0.95rem] text-white/85">
            {lessons.map((l) => (
              <li key={l.category}>{l.lesson}</li>
            ))}
          </ol>
          {!done && (
            <button className="btn btn-ghost" onClick={onDone}>
              <Icon name="check" size={13} /> I&apos;ve compared. Mark done
            </button>
          )}
        </div>
      )}
    </DrillCard>
  );
}

type Problem = { text: string; answer: number };
function makeProblem(level: number): Problem {
  const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const big = 9 + level * 6;
  const kind = r(0, level >= 2 ? 3 : 2);
  if (kind === 0) {
    const a = r(2, big), b = r(2, big);
    return { text: `${a} + ${b}`, answer: a + b };
  }
  if (kind === 1) {
    const a = r(big, big * 2), b = r(2, big);
    return { text: `${a} − ${b}`, answer: a - b };
  }
  if (kind === 2) {
    const a = r(2, 6 + level * 2), b = r(2, 9 + level);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  const b = r(2, 9 + level), q = r(2, 9 + level);
  return { text: `${b * q} ÷ ${b}`, answer: q };
}

function MathSprint({ day, done, onDone }: { day: number; done: boolean; onDone: () => void }) {
  const level = Math.min(4, Math.floor((day - 1) / 7));
  const [state, setState] = useState<"idle" | "running" | "over">("idle");
  const [left, setLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => ({ text: "", answer: 0 }));
  const [input, setInput] = useState("");
  const [best, setBest] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storeKey = "mg-math-best";

  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage exists only after hydration
  useEffect(() => setBest(Number(safeGet(storeKey)) || null), []);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "running" || left > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the timer reaching zero ends the round
    setState("over");
    if (best === null || score > best) {
      setBest(score);
      safeSet(storeKey, String(score));
    }
    if (!done) onDone();
  }, [left, state, score, best, done, onDone]);

  function start() {
    setScore(0);
    setMisses(0);
    setLeft(60);
    setInput("");
    setProblem(makeProblem(level));
    setState("running");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit() {
    if (input.trim() === "") return;
    if (Number(input) === problem.answer) setScore((s) => s + 1);
    else setMisses((m) => m + 1);
    setInput("");
    setProblem(makeProblem(level));
  }

  const levelName = ["warm-up", "steady", "brisk", "fast", "elite"][level];
  return (
    <DrillCard title="Mental math sprint" meta={`Processing speed · 60 s · ${levelName} level`} why="Fast, accurate mental arithmetic trains processing speed and working memory, the engine behind quick reasoning." done={done}>
      {state === "idle" && (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" onClick={start}>
            Start sprint
          </button>
          {best !== null && <span className="text-sm text-white/60">Personal best: {best}</span>}
        </div>
      )}
      {state === "running" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-baseline justify-between text-sm text-white/60">
            <span>Correct: {score}</span>
            <span className={left <= 10 ? "text-amber-200" : ""}>{left}s</span>
          </div>
          <div className="text-center text-4xl font-semibold tabular-nums text-white">{problem.text} = ?</div>
          <input ref={inputRef} className="field text-center text-2xl tabular-nums" inputMode="numeric" value={input} onChange={(e) => setInput(e.target.value.replace(/[^\d-]/g, ""))} aria-label="Answer" />
          <p className="text-center text-xs text-white/40">Type the answer and press Enter</p>
        </form>
      )}
      {state === "over" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[0.95rem] text-white/85">
            <span className="text-2xl font-semibold text-white">{score}</span> correct · {misses} missed
            {best !== null && score >= best && score > 0 && <span className="ml-2 text-emerald-200">New best!</span>}
          </div>
          <button className="btn btn-ghost ml-auto" onClick={start}>
            <Icon name="loop" size={13} /> Go again
          </button>
        </div>
      )}
    </DrillCard>
  );
}

function GuidedDrill({ drill, done, onDone }: { drill: (typeof GUIDED)[number]; done: boolean; onDone: () => void }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const id = setTimeout(() => setLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  const mmss = useMemo(() => (left === null ? "" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`), [left]);
  return (
    <DrillCard title={drill.title} meta={`${drill.skill} · ${drill.minutes} min · today's guided drill`} why={drill.why} done={done}>
      <ol className="list-decimal space-y-1.5 pl-5 text-[0.95rem] leading-relaxed text-white/85">
        {drill.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        {left === null ? (
          <button className="btn btn-ghost" onClick={() => setLeft(drill.minutes * 60)}>
            Start {drill.minutes}-min timer
          </button>
        ) : (
          <span className={`text-lg tabular-nums ${left === 0 ? "text-emerald-200" : "text-white"}`}>{left === 0 ? "Time!" : mmss}</span>
        )}
        {!done && (
          <button className="btn btn-primary ml-auto" onClick={onDone}>
            <Icon name="check" size={13} /> Mark done
          </button>
        )}
      </div>
    </DrillCard>
  );
}

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}
