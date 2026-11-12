import "server-only";
import type { ReportStats } from "./ai";
import type { Plan } from "./plan";
import { allMastery, calibration, currentStreak, fingerprint, mainSubmissions, trend } from "./progress";
import type { Profile, Submission } from "./types";

/** Compact stats object sent to the coach for reports and summaries. */
export function buildReportStats(profile: Profile, subs: Submission[], plan: Plan, today: number, fromDay = 1, toDay = 30): ReportStats {
  const m = allMastery(subs);
  return {
    dayNumber: today,
    completed: mainSubmissions(subs).length,
    streak: currentStreak(subs, profile.start_date, today),
    mastery: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { level: v.level, avg: v.avg, averageScore: v.averageScore }])),
    calibration: calibration(subs).perSkill.map((c) => ({ category: c.category, label: c.label, confidence: c.confidence, accuracy: c.accuracy })),
    fingerprint: fingerprint(subs),
    trend: trend(subs).label,
    recent: subs
      .filter((s) => s.day >= fromDay && s.day <= toDay)
      .slice(-40)
      .map((s) => ({
        day: s.day,
        category: s.category + (s.is_bonus ? " (bonus)" : ""),
        title: s.is_bonus ? s.feedback_json.bonus?.title ?? "Bonus" : plan.forSubmission(s)?.title ?? "",
        verdict: s.verdict,
        score: Number(s.score),
        pattern: s.thinking_pattern,
        lesson: s.feedback_json.transferable_lesson,
      })),
  };
}
