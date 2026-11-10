import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BonusSection } from "@/components/exercise/BonusSection";
import { ExerciseFlow } from "@/components/exercise/ExerciseFlow";
import { requireUserData } from "@/lib/data";
import { getExercise } from "@/lib/exercises";
import { completionMap, key, lockReason, nodeState } from "@/lib/progress";
import { CATEGORIES, CATEGORY_META, toPublic, type BonusExercise, type Category } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/day/[n]">): Promise<Metadata> {
  const { n } = await params;
  return { title: `Day ${n}` };
}

export default async function DayPage({ params, searchParams }: PageProps<"/day/[n]">) {
  const { n } = await params;
  const { c } = await searchParams;
  const day = Number(n);
  if (!Number.isInteger(day) || day < 1 || day > 30) notFound();
  const { submissions, reports, today } = await requireUserData();

  if (day > today) {
    return (
      <div className="glass mx-auto mt-10 max-w-md p-8 text-center">
        <div className="text-3xl">🔒</div>
        <h1 className="mt-2 text-xl font-semibold">Day {day} is locked</h1>
        <p className="mt-1 text-white/55">It unlocks at midnight (IST) in {day - today} day{day - today > 1 ? "s" : ""}.</p>
        <Link href="/" className="btn btn-ghost mt-5">
          Back to today
        </Link>
      </div>
    );
  }

  const done = completionMap(submissions);
  const states = Object.fromEntries(CATEGORIES.map((cat) => [cat, nodeState(cat, day, today, done)])) as Record<Category, string>;
  const requested = CATEGORIES.find((cat) => cat === c);
  const active: Category = requested ?? CATEGORIES.find((cat) => states[cat] === "available") ?? "logic";
  const exercise = getExercise(active, day)!;
  const remaining = CATEGORIES.filter((cat) => !done.has(key(cat, day)));
  const dayComplete = remaining.length === 0;

  const bonusReport = reports.find((r) => r.kind === "bonus" && r.week === day);
  const bonus = bonusReport ? (JSON.parse(bonusReport.text) as BonusExercise) : null;
  const bonusSub = submissions.find((s) => s.is_bonus && s.day === day) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={day > 1 ? `/day/${day - 1}` : "/"} className="btn btn-ghost px-3 py-1.5" aria-label="Previous day">
          ←
        </Link>
        <h1 className="font-mono text-lg font-semibold">
          Day {day}
          <span className="text-white/35">/30</span>
        </h1>
        {day < today && <span className="text-xs text-white/45">Late answers count for progress, not streaks</span>}
        {day < today && (
          <Link href={`/day/${day + 1}`} className="btn btn-ghost ml-auto px-3 py-1.5" aria-label="Next day">
            →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const sub = done.get(key(cat, day));
          const selected = cat === active;
          return (
            <Link
              key={cat}
              role="tab"
              aria-selected={selected}
              href={`/day/${day}?c=${cat}`}
              scroll={false}
              className={`rounded-xl border px-3 py-2.5 text-sm transition ${selected ? "bg-white/[0.08]" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"}`}
              style={selected ? { borderColor: `${meta.color}88` } : undefined}
            >
              <div className="font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <div className="font-mono text-[11px] text-white/50">
                {sub ? `✓ ${sub.score}/10` : states[cat] === "available" ? "open" : "locked"}
              </div>
            </Link>
          );
        })}
      </div>

      <ExerciseFlow
        key={`${active}-${day}`}
        exercise={toPublic(exercise)}
        submission={done.get(key(active, day)) ?? null}
        locked={lockReason(active, day, today, done)}
        completesDay={remaining.length === 1 && remaining[0] === active}
      />

      {dayComplete && <BonusSection day={day} bonus={bonus ? toPublic({ ...bonus, day }) : null} submission={bonusSub} />}
    </div>
  );
}
