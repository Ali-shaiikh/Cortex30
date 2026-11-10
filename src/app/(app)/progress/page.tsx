import type { Metadata } from "next";
import { CalibrationScatter, SkillRadar, TrendLine } from "@/components/progress/Charts";
import { ReportCard, SummaryCard } from "@/components/progress/AiPanels";
import { Markdown } from "@/components/ui/Markdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireUserData } from "@/lib/data";
import { localDate } from "@/lib/day";
import { achievements, allMastery, calibration, fingerprint, mainSubmissions, overall, trend } from "@/lib/progress";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const { profile, submissions, reports, today } = await requireUserData();
  const stats = overall(submissions, profile.start_date, today);
  const m = allMastery(submissions);
  const t = trend(submissions);
  const cal = calibration(submissions);
  const fp = fingerprint(submissions).slice(0, 8);
  const ach = achievements(submissions, profile.start_date);
  const summary = reports.find((r) => r.kind === "summary");
  const final = reports.find((r) => r.kind === "final");

  return (
    <div className="space-y-6">
      <SummaryCard text={summary?.text ?? null} stale={!summary || localDate(new Date(summary.created_at)) !== localDate()} enoughData={mainSubmissions(submissions).length >= 2} />

      <section className="glass p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h1 className="text-lg font-semibold">Program</h1>
          <span className="font-mono text-sm text-white/70">
            {stats.completed}/120 · {Math.round(stats.pct)}% · streak {stats.streak}
          </span>
        </div>
        <ProgressBar value={stats.pct} className="h-2.5" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c];
          const s = m[c];
          return (
            <div key={c} className="glass space-y-3 p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold" style={{ color: meta.color }}>
                  {meta.label}
                </h2>
                <span className="font-mono text-xs text-white/60">
                  {s.completed}/30 · avg {s.averageScore?.toFixed(1) ?? "-"}
                </span>
              </div>
              <ProgressBar value={s.completionPct} color={meta.color} />
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/80">
                    {s.level}
                    <span className="ml-2 font-mono text-white/45">last-5 {s.avg?.toFixed(1) ?? "-"}</span>
                  </span>
                  <span className="text-white/45">{s.nextLevel ? `→ ${s.nextLevel}` : "Top level"}</span>
                </div>
                <ProgressBar value={s.toNext * 100} color="rgba(255,255,255,0.55)" className="h-1" />
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="mb-2 font-semibold">Skill radar</h2>
          <SkillRadar data={CATEGORIES.map((c) => ({ category: c, score: m[c].averageScore ?? 0 }))} />
        </div>
        <div className="glass p-5">
          <h2 className="mb-2 font-semibold">Daily average score</h2>
          {t.points.length ? <TrendLine points={t.points} label={t.label} /> : <p className="text-sm text-white/45">No scores yet.</p>}
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="mb-1 font-semibold">Calibration</h2>
        <p className="mb-3 text-sm text-white/50">
          Your confidence vs. your actual score.{" "}
          {cal.overallError !== null && (
            <>
              Average gap: <span className="font-mono text-white/80">{cal.overallError}%</span>
            </>
          )}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cal.perSkill.map((c) => (
            <div key={c.category} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="text-xs font-semibold" style={{ color: CATEGORY_META[c.category].color }}>
                {CATEGORY_META[c.category].label}
              </div>
              <div className="text-sm text-white/85">{c.label}</div>
              {c.n > 0 && (
                <div className="font-mono text-[11px] text-white/45">
                  {c.confidence}% conf · {c.accuracy}% score
                </div>
              )}
            </div>
          ))}
        </div>
        {cal.points.length > 0 && <CalibrationScatter points={cal.points} />}
      </section>

      <section className="glass p-5">
        <h2 className="mb-1 font-semibold">Thinking fingerprint</h2>
        <p className="mb-3 text-sm text-white/50">Your recurring thinking patterns. “Fixed” means you haven&apos;t shown it in your last 5 answers.</p>
        {fp.length ? (
          <ul className="space-y-2">
            {fp.map((f) => (
              <li key={f.pattern} className="flex items-center gap-3">
                <span className="w-44 truncate text-sm text-white/85 sm:w-60">{f.pattern}</span>
                <div className="flex-1">
                  <ProgressBar value={(f.count / fp[0].count) * 100} color={f.fixed ? "#2ec4a0" : "#ffb020"} />
                </div>
                <span className="w-6 text-right font-mono text-xs text-white/60">{f.count}</span>
                <span className={`w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold ${f.fixed ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>
                  {f.fixed ? "fixed ✓" : "active"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/45">Patterns show up after a few graded answers.</p>
        )}
      </section>

      <section className="glass p-5">
        <h2 className="mb-3 font-semibold">Achievements</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ach.achievements.map((a) => (
            <div key={a.id} className={`rounded-xl border p-3 ${a.unlocked ? "border-rim/40 bg-rim/[0.07]" : "border-white/[0.07] bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${a.unlocked ? "text-white" : "text-white/55"}`}>{a.name}</span>
                <span aria-label={a.unlocked ? "unlocked" : "locked"}>{a.unlocked ? "✦" : "○"}</span>
              </div>
              <p className="text-xs text-white/55">{a.description}</p>
              <p className="mt-1 text-[11px] text-rim/80">Brain: {a.visual}</p>
              {!a.unlocked && <ProgressBar value={a.progress * 100} color="rgba(255,255,255,0.4)" className="mt-2 h-1" />}
            </div>
          ))}
        </div>
      </section>

      <section id="reports" className="glass scroll-mt-20 p-5">
        <h2 className="mb-3 font-semibold">Weekly coach reports</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map((w) => (
            <ReportCard key={w} week={w} text={reports.find((r) => r.kind === "weekly" && r.week === w)?.text ?? null} unlocked={today >= w * 7} />
          ))}
        </div>
      </section>

      {final && (
        <section id="final" className="glass scroll-mt-20 p-5">
          <h2 className="mb-3 font-semibold">Final 30-day review</h2>
          <Markdown text={final.text} />
        </section>
      )}

      <div className="flex justify-end">
        <a href="/api/export" className="btn btn-ghost text-sm">
          Export all answers + feedback (.md)
        </a>
      </div>
    </div>
  );
}
