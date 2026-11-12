import type { Metadata } from "next";
import { CalibrationScatter, SkillRadar, TrendLine } from "@/components/progress/Charts";
import { ReportCard, SummaryCard } from "@/components/progress/AiPanels";
import { Markdown } from "@/components/ui/Markdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireUserData } from "@/lib/data";
import { localDate } from "@/lib/day";
import { achievements, allMastery, calibration, fingerprint, mainSubmissions, overall, trend } from "@/lib/progress";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

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
          <h1 className="display neon text-sm font-bold">Synaptic load</h1>
          <span className="font-mono text-sm text-cyan-100/70">
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
                <h2 className="display text-xs font-bold" style={{ color: meta.color }}>
                  {meta.label} cortex
                </h2>
                <span className="font-mono text-xs text-cyan-100/60">
                  {s.completed}/30 · avg {s.averageScore?.toFixed(1) ?? "-"}
                </span>
              </div>
              <ProgressBar value={s.completionPct} color={meta.color} />
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-cyan-100/80">
                    {s.level}
                    <span className="ml-2 font-mono text-cyan-100/45">last-5 {s.avg?.toFixed(1) ?? "-"}</span>
                  </span>
                  <span className="text-cyan-100/45">{s.level === "Calibrating" ? <>{s.completed}/3 answers to rate</> : s.nextLevel ? <>next: {s.nextLevel}</> : "Top level"}</span>
                </div>
                <ProgressBar value={s.toNext * 100} color="rgba(255,255,255,0.55)" className="h-1" />
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="display mb-2 text-xs font-bold text-cyan-50">Cortex radar</h2>
          <SkillRadar data={CATEGORIES.map((c) => ({ category: c, score: m[c].averageScore ?? 0 }))} />
        </div>
        <div className="glass p-5">
          <h2 className="display mb-2 text-xs font-bold text-cyan-50">Signal trend</h2>
          {t.points.length ? <TrendLine points={t.points} label={t.label} /> : <p className="text-sm text-cyan-100/45">No scores yet.</p>}
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="display mb-1 text-xs font-bold text-cyan-50">Calibration matrix</h2>
        <p className="mb-3 text-sm text-cyan-100/50">
          Your confidence vs. your actual score.{" "}
          {cal.overallError !== null && (
            <>
              Average gap: <span className="font-mono text-cyan-100/80">{cal.overallError}%</span>
            </>
          )}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cal.perSkill.map((c) => (
            <div key={c.category} className="border border-neon/[0.08] bg-black/30 p-3">
              <div className="text-xs font-semibold" style={{ color: CATEGORY_META[c.category].color }}>
                {CATEGORY_META[c.category].label}
              </div>
              <div className="text-sm text-cyan-100/85">{c.label}</div>
              {c.n > 0 && (
                <div className="font-mono text-[11px] text-cyan-100/45">
                  {c.confidence}% conf · {c.accuracy}% score
                </div>
              )}
            </div>
          ))}
        </div>
        {cal.points.length > 0 && <CalibrationScatter points={cal.points} />}
      </section>

      <section className="glass p-5">
        <h2 className="display mb-1 text-xs font-bold text-cyan-50">Cognitive fingerprint</h2>
        <p className="mb-3 text-sm text-cyan-100/50">Your recurring thinking patterns. “Fixed” means you haven&apos;t shown it in your last 5 answers.</p>
        {fp.length ? (
          <ul className="space-y-2">
            {fp.map((f) => (
              <li key={f.pattern} className="flex items-center gap-3">
                <span className="w-44 truncate text-sm text-cyan-100/85 sm:w-60">{f.pattern}</span>
                <div className="flex-1">
                  <ProgressBar value={(f.count / fp[0].count) * 100} color={f.fixed ? "#2ec4a0" : "#ffb020"} />
                </div>
                <span className="w-6 text-right font-mono text-xs text-cyan-100/60">{f.count}</span>
                <span className={`w-16 px-2 py-0.5 text-center text-[10px] font-semibold ${f.fixed ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>
                  {f.fixed ? (
                    <>
                      <Icon name="check" size={10} /> fixed
                    </>
                  ) : (
                    "active"
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-cyan-100/45">Patterns show up after a few graded answers.</p>
        )}
      </section>

      <section className="glass p-5">
        <h2 className="display mb-3 text-xs font-bold text-cyan-50">Neural implants</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ach.achievements.map((a) => (
            <div key={a.id} className={`border p-3 ${a.unlocked ? "border-neon/40 bg-neon/[0.07]" : "border-neon/[0.07] bg-black/30"}`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${a.unlocked ? "text-white" : "text-cyan-100/55"}`}>{a.name}</span>
                <Icon name={a.unlocked ? "implantOn" : "implant"} size={16} className={a.unlocked ? "text-neon drop-shadow-[0_0_6px_#6fe7ff]" : "text-cyan-100/30"} aria-label={a.unlocked ? "unlocked" : "locked"} />
              </div>
              <p className="text-xs text-cyan-100/55">{a.description}</p>
              <p className="mt-1 flex items-start gap-1 font-mono text-[10px] text-neon/70">
                <Icon name="spark" size={10} className="mt-0.5" /> {a.visual}
              </p>
              {!a.unlocked && <ProgressBar value={a.progress * 100} color="rgba(255,255,255,0.4)" className="mt-2 h-1" />}
            </div>
          ))}
        </div>
      </section>

      <section id="reports" className="glass scroll-mt-20 p-5">
        <h2 className="display mb-3 text-xs font-bold text-cyan-50">Coach transmissions</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map((w) => (
            <ReportCard key={w} week={w} text={reports.find((r) => r.kind === "weekly" && r.week === w)?.text ?? null} unlocked={today >= w * 7} />
          ))}
        </div>
      </section>

      {final && (
        <section id="final" className="glass scroll-mt-20 p-5">
          <h2 className="display mb-3 text-xs font-bold text-cyan-50">Final neural review</h2>
          <Markdown text={final.text} />
        </section>
      )}

      <div className="flex justify-end">
        <a href="/api/export" className="btn btn-ghost text-sm">
          Export memory (.md)
        </a>
      </div>
    </div>
  );
}
