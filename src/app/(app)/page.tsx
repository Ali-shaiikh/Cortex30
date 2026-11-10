import Link from "next/link";
import { CompletionPanel } from "@/components/CompletionPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireUserData } from "@/lib/data";
import { getExercise } from "@/lib/exercises";
import { completionMap, key, lockReason, nodeState, overall } from "@/lib/progress";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";

export default async function TodayPage() {
  const { profile, submissions, reports, today } = await requireUserData();
  const done = completionMap(submissions);
  const stats = overall(submissions, profile.start_date, today);
  const finished = CATEGORIES.every((c) => done.has(key(c, 30)));

  // Earlier exercises that are open but not yet done (late work doesn't count towards the streak).
  const catchUp = CATEGORIES.flatMap((c) => {
    for (let d = 1; d < today; d++) if (nodeState(c, d, today, done) === "available") return [{ c, d }];
    return [];
  });
  const reportDue = [7, 14, 21, 28].filter((d) => today >= d && !reports.some((r) => r.kind === "weekly" && r.week === d / 7)).at(-1);

  return (
    <div className="space-y-6">
      <section className="glass p-5">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <div className="label">Program</div>
            <div className="font-mono text-3xl font-semibold">
              Day {today}
              <span className="text-white/35">/30</span>
            </div>
          </div>
          <div>
            <div className="label">Streak</div>
            <div className="font-mono text-3xl font-semibold">
              {stats.streak}
              <span className="ml-1 text-base text-white/45">day{stats.streak === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="min-w-48 flex-1">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="label">Overall</span>
              <span className="font-mono text-white/70">
                {stats.completed}/120 · {Math.round(stats.pct)}%
              </span>
            </div>
            <ProgressBar value={stats.pct} className="h-2" />
          </div>
        </div>
      </section>

      {finished && <CompletionPanel hasFinal={reports.some((r) => r.kind === "final")} />}

      <section>
        <h1 className="mb-3 text-lg font-semibold tracking-tight">Today&apos;s reps</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const ex = getExercise(c, today)!;
            const meta = CATEGORY_META[c];
            const state = nodeState(c, today, today, done);
            const sub = done.get(key(c, today));
            const reason = lockReason(c, today, today, done);
            return (
              <Link
                key={c}
                href={`/day/${today}?c=${c}`}
                className="glass group relative block overflow-hidden p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
              >
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
                  <span style={{ color: meta.color }}>{meta.label}</span>
                  <span className="text-white/40">~{ex.minutes} min</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold">{ex.title}</h2>
                <p className="text-sm text-white/50">{ex.concept}</p>
                <div className="mt-4 text-sm">
                  {state === "completed" && sub ? (
                    <span className="font-mono text-white/80">
                      ✓ {sub.score}/10 · {sub.verdict.replace("_", " ")}
                    </span>
                  ) : state === "available" ? (
                    <span className="inline-flex items-center gap-2" style={{ color: meta.color }}>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: meta.color }} />
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: meta.color }} />
                      </span>
                      Start →
                    </span>
                  ) : (
                    <span className="text-white/40">🔒 {reason}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {catchUp.length > 0 && (
        <section className="glass p-5">
          <h2 className="font-semibold">Catch up</h2>
          <p className="mb-3 text-sm text-white/50">Missed days stay open. They count towards your progress, just not your streak.</p>
          <div className="flex flex-wrap gap-2">
            {catchUp.map(({ c, d }) => (
              <Link key={c} href={`/day/${d}?c=${c}`} className="btn btn-ghost py-1.5 text-xs" style={{ color: CATEGORY_META[c].color }}>
                {CATEGORY_META[c].label} · Day {d}
              </Link>
            ))}
          </div>
        </section>
      )}

      {reportDue && (
        <Link href="/progress#reports" className="glass block p-5 hover:bg-white/[0.06]">
          <div className="label text-rim">Coach report ready</div>
          <p className="mt-1 text-white/80">Your week {reportDue / 7} coach report is waiting. Generate it on the progress page →</p>
        </Link>
      )}

      <nav className="flex flex-wrap gap-2 text-sm">
        {Array.from({ length: today }, (_, i) => i + 1).map((d) => {
          const complete = CATEGORIES.every((c) => done.has(key(c, d)));
          return (
            <Link key={d} href={`/day/${d}`} className={`grid h-9 w-9 place-items-center rounded-lg border font-mono text-xs ${complete ? "border-rim/40 bg-rim/10 text-rim" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
              {d}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
