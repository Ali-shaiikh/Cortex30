import Link from "next/link";
import { BootSequence } from "@/components/BootSequence";
import { CompletionPanel } from "@/components/CompletionPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireUserData } from "@/lib/data";
import { allMastery, completionMap, key, nodeState, overall } from "@/lib/progress";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/** Landing: the user's brain fills the screen, with a HUD and a single call to action. */
export default async function CortexPage({ searchParams }: PageProps<"/">) {
  const { boot } = await searchParams;
  const { profile, submissions, reports, today } = await requireUserData();
  const done = completionMap(submissions);
  const stats = overall(submissions, profile.start_date, today);
  const mastery = allMastery(submissions);
  const finished = CATEGORIES.every((c) => done.has(key(c, 30)));
  const todayLeft = CATEGORIES.filter((c) => nodeState(c, today, today, done) === "available");
  const todayDone = CATEGORIES.filter((c) => done.has(key(c, today))).length;
  const catchUp = CATEGORIES.flatMap((c) => {
    for (let d = 1; d < today; d++) if (nodeState(c, d, today, done) === "available") return [{ c, d }];
    return [];
  });
  const reportDue = [7, 14, 21, 28].filter((d) => today >= d && !reports.some((r) => r.kind === "weekly" && r.week === d / 7)).at(-1);
  const session = String(today).padStart(2, "0");

  return (
    <>
      {boot === "1" && (
        <BootSequence
          username={profile.username}
          synapses={stats.completed}
          cortex={CATEGORIES.map((c) => ({ label: CATEGORY_META[c].label, color: CATEGORY_META[c].color, pct: (mastery[c].avg ?? 0) * 10 }))}
        />
      )}

      {/* Hero: the brain (rendered by the layout background) shows through the middle */}
      <section className="relative flex min-h-[calc(100dvh-11rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col justify-between gap-6 sm:min-h-[calc(100dvh-5.5rem)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="glass w-full p-4 sm:w-72">
            <p className="label">{"// neural profile"}</p>
            <p className="display neon mt-1 truncate text-lg font-bold normal-case">@{profile.username}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 font-mono">
              <div>
                <div className="label">Session</div>
                <div className="text-2xl text-cyan-50">
                  {session}
                  <span className="text-sm text-cyan-100/40">/30</span>
                </div>
              </div>
              <div>
                <div className="label">Streak</div>
                <div className="text-2xl text-cyan-50">
                  {stats.streak}
                  <span className="text-sm text-cyan-100/40"> d</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between">
                <span className="label">Synapses online</span>
                <span className="font-mono text-xs text-neon">
                  {stats.completed}/120
                </span>
              </div>
              <ProgressBar value={stats.pct} className="h-1" />
            </div>
            {/* Phones: compact cortex readout (the separate panel is desktop-only) */}
            <div className="mt-3 grid grid-cols-4 gap-2 sm:hidden">
              {CATEGORIES.map((c) => (
                <div key={c}>
                  <div className="truncate font-mono text-[9px] uppercase tracking-wider" style={{ color: CATEGORY_META[c].color }}>
                    {CATEGORY_META[c].label.slice(0, 5)}
                  </div>
                  <ProgressBar value={(mastery[c].avg ?? 0) * 10} color={CATEGORY_META[c].color} className="mt-1 h-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass hidden w-64 p-4 sm:block">
            <p className="label mb-2">{"// cortex status"}</p>
            <ul className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider">
                    <span style={{ color: CATEGORY_META[c].color }}>{CATEGORY_META[c].label}</span>
                    <span className="text-cyan-100/60">{mastery[c].level}</span>
                  </div>
                  <ProgressBar value={(mastery[c].avg ?? 0) * 10} color={CATEGORY_META[c].color} className="mt-1 h-1" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pb-4 text-center">
          {finished ? (
            <CompletionPanel hasFinal={reports.some((r) => r.kind === "final")} />
          ) : (
            <>
              <p className="font-mono text-[11px] tracking-[0.3em] text-neon/70">
                {todayLeft.length ? `SESSION ${session} · ${todayDone}/4 SYNAPSES FIRED` : `SESSION ${session} COMPLETE · NEXT UNLOCK AT 00:00 IST`}
              </p>
              <Link href={`/day/${today}`} className="btn btn-primary group w-full max-w-xs px-10 py-4 text-sm shadow-[0_0_40px_-8px_#6fe7ff] sm:w-auto">
                {todayLeft.length ? (todayDone ? "Continue session" : "Get started") : "Review session"}
                <Icon name="arrowRight" className="transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex flex-wrap justify-center gap-2">
                {catchUp.map(({ c, d }) => (
                  <Link key={c} href={`/day/${d}?c=${c}`} className="border border-neon/20 bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur hover:bg-neon/10" style={{ color: CATEGORY_META[c].color }}>
                    <Icon name="loop" size={11} /> {CATEGORY_META[c].label} S{String(d).padStart(2, "0")}
                  </Link>
                ))}
                {reportDue && (
                  <Link href="/progress#reports" className="border border-magenta/40 bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-magenta backdrop-blur hover:bg-magenta/10">
                    <Icon name="transmission" size={11} /> Week {reportDue / 7} transmission ready
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Memory timeline */}
      <section className="glass mt-6 p-4">
        <p className="label mb-3">{"// memory timeline"}</p>
        <nav className="flex flex-wrap gap-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const complete = CATEGORIES.every((c) => done.has(key(c, d)));
            const unlocked = d <= today;
            const cls = complete
              ? "border-neon/50 bg-neon/15 text-neon"
              : unlocked
                ? "border-cyan-100/20 text-cyan-100/70 hover:bg-neon/10"
                : "border-cyan-100/5 text-cyan-100/20";
            return unlocked ? (
              <Link key={d} href={`/day/${d}`} className={`grid h-8 w-8 place-items-center border font-mono text-[11px] ${cls} ${d === today ? "ring-1 ring-magenta" : ""}`}>
                {d}
              </Link>
            ) : (
              <span key={d} className={`grid h-8 w-8 place-items-center border font-mono text-[11px] ${cls}`}>
                {d}
              </span>
            );
          })}
        </nav>
      </section>
    </>
  );
}
