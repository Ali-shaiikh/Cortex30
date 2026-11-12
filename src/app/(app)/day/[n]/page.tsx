import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BonusSection } from "@/components/exercise/BonusSection";
import { DaySession } from "@/components/exercise/DaySession";
import { SharpeningProtocol } from "@/components/exercise/SharpeningProtocol";
import { requireUserData } from "@/lib/data";
import { completionMap, fingerprint, key, lockReason, nodeState } from "@/lib/progress";
import { CATEGORIES, toPublic, type BonusExercise, type Category, type ExercisePublic, type Submission } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: PageProps<"/day/[n]">): Promise<Metadata> {
  const { n } = await params;
  return { title: `Day ${n}` };
}

export default async function DayPage({ params, searchParams }: PageProps<"/day/[n]">) {
  const { n } = await params;
  const { c } = await searchParams;
  const day = Number(n);
  if (!Number.isInteger(day) || day < 1 || day > 30) notFound();
  const { submissions, reports, today, plan } = await requireUserData();

  if (day > today) {
    return (
      <div className="glass mx-auto mt-10 max-w-md p-8 text-center">
        <Icon name="lock" size={36} className="mx-auto text-magenta drop-shadow-[0_0_10px_#ff3dbb]" />
        <h1 className="display neon mt-2 text-lg font-bold">Session {String(day).padStart(2, "0")} locked</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-cyan-100/55">Unlocks at 00:00 IST in {day - today} day{day - today > 1 ? "s" : ""}</p>
        <Link href="/" className="btn btn-ghost mt-5">
          Back to cortex
        </Link>
      </div>
    );
  }

  const done = completionMap(submissions);
  const states = Object.fromEntries(CATEGORIES.map((cat) => [cat, nodeState(cat, day, today, done)])) as Record<Category, string>;
  const requested = CATEGORIES.find((cat) => cat === c);
  const active: Category = requested ?? CATEGORIES.find((cat) => states[cat] === "available") ?? "logic";
  const remaining = CATEGORIES.filter((cat) => !done.has(key(cat, day)));
  // Answered exercises show what was actually answered; open ones come from the user's plan.
  const exerciseOf = (cat: Category) => {
    const sub = done.get(key(cat, day));
    return (sub && plan.forSubmission(sub)) || plan.get(cat, day);
  };
  const dayComplete = remaining.length === 0;

  const bonusReport = reports.find((r) => r.kind === "bonus" && r.week === day);
  const bonus = bonusReport ? (JSON.parse(bonusReport.text) as BonusExercise) : null;
  const bonusSub = submissions.find((s) => s.is_bonus && s.day === day) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={day > 1 ? `/day/${day - 1}` : "/"} className="btn btn-ghost px-3 py-1.5" aria-label="Previous day">
          <Icon name="arrowLeft" />
        </Link>
        <h1 className="display neon text-base font-bold">
          Session {String(day).padStart(2, "0")}
          <span className="text-cyan-100/35">/30</span>
        </h1>
        {day < today && <span className="hidden font-mono text-[10px] uppercase tracking-wider text-cyan-100/45 sm:inline">Late reps count for progress, not streaks</span>}
        {day < today && (
          <Link href={`/day/${day + 1}`} className="btn btn-ghost ml-auto px-3 py-1.5" aria-label="Next day">
            <Icon name="arrowRight" />
          </Link>
        )}
      </div>

      <DaySession
        day={day}
        initial={active}
        items={
          Object.fromEntries(
            CATEGORIES.map((cat) => [
              cat,
              {
                exercise: { ...toPublic(exerciseOf(cat)), tuning: plan.tuning(cat, day) },
                submission: done.get(key(cat, day)) ?? null,
                locked: lockReason(cat, day, today, done),
                completesDay: remaining.length === 1 && remaining[0] === cat,
              },
            ]),
          ) as Record<Category, { exercise: ExercisePublic; submission: Submission | null; locked: string | null; completesDay: boolean }>
        }
      />

      {dayComplete && (
        <SharpeningProtocol
          day={day}
          lessons={CATEGORIES.map((cat) => {
            const sub = done.get(key(cat, day))!;
            return { category: cat, title: exerciseOf(cat).title, lesson: sub.feedback_json.transferable_lesson, pattern: sub.thinking_pattern };
          })}
          topPattern={fingerprint(submissions).find((f) => !f.fixed)?.pattern ?? null}
          bonus={<BonusSection day={day} bonus={bonus ? toPublic({ ...bonus, day }) : null} submission={bonusSub} />}
        />
      )}
    </div>
  );
}
