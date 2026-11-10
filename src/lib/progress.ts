// Pure progress/analytics functions shared by the server, the progress page and the 3D mind map.
import { dateOfDay, localDate, PROGRAM_DAYS } from "./day";
import { CATEGORIES, type Category, type Submission } from "./types";

export type NodeState = "locked" | "available" | "completed";
export type SubLike = Pick<
  Submission,
  "day" | "category" | "score" | "verdict" | "confidence" | "thinking_pattern" | "created_at" | "is_bonus"
>;

export const key = (category: Category, day: number) => `${category}-${day}`;

export function mainSubmissions<T extends SubLike>(subs: T[]): T[] {
  return subs.filter((s) => !s.is_bonus);
}

export function completionMap<T extends SubLike>(subs: T[]): Map<string, T> {
  return new Map(mainSubmissions(subs).map((s) => [key(s.category, s.day), s]));
}

/** A node unlocks when its day has arrived AND the previous day's node in that skill is completed. */
export function nodeState(category: Category, day: number, today: number, done: Map<string, unknown>): NodeState {
  if (done.has(key(category, day))) return "completed";
  if (day <= today && (day === 1 || done.has(key(category, day - 1)))) return "available";
  return "locked";
}

/** Why a node is locked, for the UI. */
export function lockReason(category: Category, day: number, today: number, done: Map<string, unknown>): string | null {
  if (nodeState(category, day, today, done) !== "locked") return null;
  if (day > today) return `Unlocks on day ${day}`;
  return `Finish day ${day - 1} first`;
}

// ---------------------------------------------------------------------------
// Streaks: a day counts only if all 4 exercises were done on that day's calendar date.
// ---------------------------------------------------------------------------

export function onTimeDays(subs: SubLike[], startDate: string): Set<number> {
  const counts = new Map<number, Set<Category>>();
  for (const s of mainSubmissions(subs)) {
    if (localDate(new Date(s.created_at)) !== dateOfDay(startDate, s.day)) continue;
    const set = counts.get(s.day) ?? new Set<Category>();
    set.add(s.category);
    counts.set(s.day, set);
  }
  return new Set([...counts].filter(([, set]) => set.size === CATEGORIES.length).map(([d]) => d));
}

export function currentStreak(subs: SubLike[], startDate: string, today: number): number {
  const days = onTimeDays(subs, startDate);
  let d = days.has(today) ? today : today - 1;
  let streak = 0;
  while (d >= 1 && days.has(d)) {
    streak++;
    d--;
  }
  return streak;
}

export function longestStreak(subs: SubLike[], startDate: string): number {
  const days = onTimeDays(subs, startDate);
  let best = 0;
  let run = 0;
  for (let d = 1; d <= PROGRAM_DAYS; d++) {
    run = days.has(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

// ---------------------------------------------------------------------------
// Mastery
// ---------------------------------------------------------------------------

export const LEVELS = [
  { name: "Beginner", min: 0, max: 4 },
  { name: "Developing", min: 4, max: 6 },
  { name: "Sharp", min: 6, max: 8 },
  { name: "Master", min: 8, max: 10 },
] as const;
export type LevelName = (typeof LEVELS)[number]["name"];

const byTime = <T extends SubLike>(a: T, b: T) => a.created_at.localeCompare(b.created_at);

export type Mastery = {
  avg: number | null; // rolling average of the last 5 scores
  level: LevelName;
  toNext: number; // 0-1 progress within the current level
  nextLevel: LevelName | null;
  completed: number;
  completionPct: number;
  averageScore: number | null; // all-time average
};

export function levelFor(avg: number): (typeof LEVELS)[number] {
  return [...LEVELS].reverse().find((l) => avg >= l.min) ?? LEVELS[0];
}

export function mastery(subs: SubLike[], category: Category): Mastery {
  const mine = mainSubmissions(subs).filter((s) => s.category === category).sort(byTime);
  const last5 = mine.slice(-5);
  const avg = last5.length ? mean(last5.map((s) => Number(s.score))) : null;
  const level = levelFor(avg ?? 0);
  const idx = LEVELS.indexOf(level);
  return {
    avg,
    level: level.name,
    toNext: avg === null ? 0 : Math.min(1, (avg - level.min) / (level.max - level.min)),
    nextLevel: idx < LEVELS.length - 1 ? LEVELS[idx + 1].name : null,
    completed: mine.length,
    completionPct: (mine.length / PROGRAM_DAYS) * 100,
    averageScore: mine.length ? mean(mine.map((s) => Number(s.score))) : null,
  };
}

export function allMastery(subs: SubLike[]): Record<Category, Mastery> {
  return Object.fromEntries(CATEGORIES.map((c) => [c, mastery(subs, c)])) as Record<Category, Mastery>;
}

// ---------------------------------------------------------------------------
// Trend, calibration, fingerprint
// ---------------------------------------------------------------------------

export type Trend = { points: { day: number; avg: number }[]; label: "improving" | "flat" | "slipping" | "not enough data"; slope: number };

export function trend(subs: SubLike[]): Trend {
  const byDay = new Map<number, number[]>();
  for (const s of mainSubmissions(subs)) byDay.set(s.day, [...(byDay.get(s.day) ?? []), Number(s.score)]);
  const points = [...byDay].map(([day, scores]) => ({ day, avg: round1(mean(scores)) })).sort((a, b) => a.day - b.day);
  const recent = points.slice(-7);
  if (recent.length < 3) return { points, label: "not enough data", slope: 0 };
  const slope = linearSlope(recent.map((p) => p.day), recent.map((p) => p.avg));
  const label = slope > 0.12 ? "improving" : slope < -0.12 ? "slipping" : "flat";
  return { points, label, slope };
}

export type Calibration = {
  category: Category;
  n: number;
  confidence: number; // mean confidence %
  accuracy: number; // mean score as %
  error: number; // mean |confidence - score%|
  label: "overconfident" | "underconfident" | "well calibrated" | "no data";
};

export function calibration(subs: SubLike[]): { perSkill: Calibration[]; overallError: number | null; points: { category: Category; confidence: number; score: number }[] } {
  const main = mainSubmissions(subs);
  const perSkill = CATEGORIES.map((category): Calibration => {
    const mine = main.filter((s) => s.category === category);
    if (!mine.length) return { category, n: 0, confidence: 0, accuracy: 0, error: 0, label: "no data" };
    const confidence = mean(mine.map((s) => s.confidence));
    const accuracy = mean(mine.map((s) => Number(s.score) * 10));
    const error = mean(mine.map((s) => Math.abs(s.confidence - Number(s.score) * 10)));
    const gap = confidence - accuracy;
    const label = gap > 10 ? "overconfident" : gap < -10 ? "underconfident" : "well calibrated";
    return { category, n: mine.length, confidence: round1(confidence), accuracy: round1(accuracy), error: round1(error), label };
  });
  const overallError = main.length ? round1(mean(main.map((s) => Math.abs(s.confidence - Number(s.score) * 10)))) : null;
  const points = main.map((s) => ({ category: s.category, confidence: s.confidence, score: Number(s.score) * 10 }));
  return { perSkill, overallError, points };
}

const NON_PATTERNS = new Set(["none", "n/a", "no issue", "sound reasoning", "solid reasoning"]);
export const normalisePattern = (p: string | null | undefined) => (p ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export type FingerprintItem = { pattern: string; count: number; fixed: boolean; lastSeenDay: number };

/** Recurring thinking patterns; "fixed" = not seen in the last 5 submissions. */
export function fingerprint(subs: SubLike[]): FingerprintItem[] {
  const sorted = [...subs].sort(byTime);
  const recent = new Set(sorted.slice(-5).map((s) => normalisePattern(s.thinking_pattern)));
  const counts = new Map<string, { count: number; lastSeenDay: number }>();
  for (const s of sorted) {
    const p = normalisePattern(s.thinking_pattern);
    if (!p || NON_PATTERNS.has(p)) continue;
    const c = counts.get(p) ?? { count: 0, lastSeenDay: 0 };
    counts.set(p, { count: c.count + 1, lastSeenDay: Math.max(c.lastSeenDay, s.day) });
  }
  return [...counts]
    .map(([pattern, c]) => ({ pattern, ...c, fixed: !recent.has(pattern) }))
    .sort((a, b) => b.count - a.count || b.lastSeenDay - a.lastSeenDay);
}

export function topPatterns(subs: SubLike[], n = 3): string[] {
  return fingerprint(subs)
    .filter((f) => !f.fixed || f.count > 1)
    .slice(0, n)
    .map((f) => f.pattern);
}

// ---------------------------------------------------------------------------
// Achievements + the brain visuals they unlock
// ---------------------------------------------------------------------------

export type AchievementId =
  | "first_spark"
  | "streak_7"
  | "perfect_day"
  | "bias_hunter"
  | "idea_machine"
  | "well_calibrated"
  | "comeback"
  | "polymath"
  | "finisher";

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  visual: string;
  unlocked: boolean;
  progress: number; // 0-1
};

export type Bridge = { from: { category: Category; day?: number }; to: { category: Category; day?: number }; reason: string };

export type AchievementResult = {
  achievements: Achievement[];
  perfectDays: number[];
  bridges: Bridge[];
  comebackSkill: Category | null;
};

export function achievements(subs: SubLike[], startDate: string): AchievementResult {
  const main = mainSubmissions(subs);
  const done = completionMap(main);
  const m = allMastery(main);

  const dayComplete = (d: number) => CATEGORIES.every((c) => done.has(key(c, d)));
  const perfectDays: number[] = [];
  for (let d = 1; d <= PROGRAM_DAYS; d++) {
    if (dayComplete(d) && CATEGORIES.every((c) => Number(done.get(key(c, d))!.score) >= 8)) perfectDays.push(d);
  }

  const longest = longestStreak(main, startDate);
  const biasHunts = main.filter((s) => s.category === "critical" && Number(s.score) >= 7).length;
  const strongIdeas = main.filter((s) => s.category === "creative" && s.verdict === "strong").length;
  const cal = calibration(main);
  const sharpSkills = CATEGORIES.filter((c) => m[c].avg !== null && m[c].avg! >= 6);

  // Comeback: a skill whose rolling average climbed 2+ points from a weak low (< 6).
  let comebackSkill: Category | null = null;
  let bestGain = 0;
  for (const c of CATEGORIES) {
    const scores = main.filter((s) => s.category === c).sort(byTime).map((s) => Number(s.score));
    let low = Infinity;
    for (let i = 0; i < scores.length; i++) {
      const avg = mean(scores.slice(Math.max(0, i - 4), i + 1));
      if (i >= 2 && avg < low) low = avg;
      if (low < 6 && avg - low >= 2 && avg - low > bestGain) {
        bestGain = avg - low;
        comebackSkill = c;
      }
    }
  }

  const list: Achievement[] = [
    { id: "first_spark", name: "First Spark", description: "Complete all of day 1", visual: "The four region cores ignite", unlocked: dayComplete(1), progress: CATEGORIES.filter((c) => done.has(key(c, 1))).length / 4 },
    { id: "streak_7", name: "7-Day Streak", description: "Complete 7 days in a row, on time", visual: "A halo ring orbits your brain", unlocked: longest >= 7, progress: Math.min(1, longest / 7) },
    { id: "perfect_day", name: "Perfect Day", description: "Score 8+ on all four exercises in one day", visual: "Bridges link all four regions for that day", unlocked: perfectDays.length > 0, progress: perfectDays.length ? 1 : 0 },
    { id: "bias_hunter", name: "Bias Hunter", description: "Score 7+ on 10 critical exercises", visual: "Sparks crackle over the right frontal lobe", unlocked: biasHunts >= 10, progress: Math.min(1, biasHunts / 10) },
    { id: "idea_machine", name: "Idea Machine", description: "Earn 5 “strong” creative verdicts", visual: "Sparks crackle over the creative region", unlocked: strongIdeas >= 5, progress: Math.min(1, strongIdeas / 5) },
    { id: "well_calibrated", name: "Well Calibrated", description: "Keep calibration error under 15% (min. 8 answers)", visual: "A bridge between your two frontal lobes", unlocked: cal.overallError !== null && main.length >= 8 && cal.overallError < 15, progress: main.length >= 8 && cal.overallError !== null ? Math.min(1, 15 / Math.max(cal.overallError, 0.01)) : main.length / 8 },
    { id: "comeback", name: "Comeback", description: "Lift a weak skill's average by 2+ points", visual: "A bridge from the comeback skill across the brain", unlocked: comebackSkill !== null, progress: comebackSkill ? 1 : 0 },
    { id: "polymath", name: "Polymath", description: "Reach “Sharp” in all four skills", visual: "Every region is linked to every other", unlocked: sharpSkills.length === 4, progress: sharpSkills.length / 4 },
    { id: "finisher", name: "Finisher", description: "Complete day 30", visual: "Your whole brain lights up", unlocked: dayComplete(30), progress: CATEGORIES.filter((c) => done.has(key(c, 30))).length / 4 },
  ];

  const bridges: Bridge[] = [];
  const ring: Category[] = ["logic", "critical", "creative", "analytical"];
  for (const d of perfectDays) {
    ring.forEach((c, i) => bridges.push({ from: { category: c, day: d }, to: { category: ring[(i + 1) % 4], day: d }, reason: `Perfect Day ${d}` }));
  }
  for (let i = 0; i < sharpSkills.length; i++) {
    for (let j = i + 1; j < sharpSkills.length; j++) {
      bridges.push({ from: { category: sharpSkills[i] }, to: { category: sharpSkills[j] }, reason: "Both skills Sharp" });
    }
  }
  if (list.find((a) => a.id === "well_calibrated")!.unlocked) {
    bridges.push({ from: { category: "logic" }, to: { category: "critical" }, reason: "Well Calibrated" });
  }
  if (comebackSkill) {
    const partner: Record<Category, Category> = { logic: "critical", critical: "logic", analytical: "creative", creative: "analytical" };
    bridges.push({ from: { category: comebackSkill }, to: { category: partner[comebackSkill] }, reason: "Comeback" });
  }

  return { achievements: list, perfectDays, bridges, comebackSkill };
}

// ---------------------------------------------------------------------------
// Overall stats
// ---------------------------------------------------------------------------

export function overall(subs: SubLike[], startDate: string, today: number) {
  const main = mainSubmissions(subs);
  return {
    completed: main.length,
    total: PROGRAM_DAYS * CATEGORIES.length,
    pct: (main.length / (PROGRAM_DAYS * CATEGORIES.length)) * 100,
    streak: currentStreak(main, startDate, today),
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
function linearSlope(xs: number[], ys: number[]): number {
  const mx = mean(xs);
  const my = mean(ys);
  const num = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((acc, x) => acc + (x - mx) ** 2, 0);
  return den === 0 ? 0 : num / den;
}
