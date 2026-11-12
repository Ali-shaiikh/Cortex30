// Per-user, self-calibrating exercise plan. The user never chooses; it adapts on its own, per skill.
//
// Each skill's exercises are ranked by difficulty (their original day, 1 = easiest) and grouped into weekly bands
// (days 1-7, 8-14, 15-21, 22-28), so the overall ramp is preserved. Recent scores in that skill drive two layers:
// 1. Order within the week: the plan picks the unused exercise of the current week closest to
//      target = program day + calibration shift (±4) + a small personal jitter (±2),
//    so strong performers meet the week's harder problems first and no two users see the same sequence.
// 2. Pitch of the exercise itself: a strong recent run adds a "Level up" extension (graded against a higher bar);
//    a weak one adds a "Warm-up" scaffold. This adapts in both directions without exhausting the question pool.
// Rules that keep it coherent:
// - A day's exercise depends only on answers to *earlier* days in that skill (which are locked by the time the day
//   unlocks), so the exercise in front of you never changes.
// - Answered days always show the exercise that was actually answered (stored as feedback_json.exercise_id).
// - Day 16's decision journal and day 29's review of it stay pinned (critical); day 30 revisits the user's day 1.
// - Users who answered under the original fixed order keep it, so their history stays consistent.
import { EXERCISES, getExercise, getExerciseById } from "./exercises";
import { CATEGORIES, type Category, type Exercise, type Submission } from "./types";

const PINNED: Partial<Record<Category, number[]>> = { critical: [16, 29] };
const bandOf = (day: number) => (day >= 29 ? 4 : Math.floor((day - 1) / 7));
const STRETCH_AT = 2; // calibration shift at which an exercise gets a "Level up" extension
const SCAFFOLD_AT = -2; // ... or a "Warm-up" scaffold

const STRETCH: Record<Category, string> = {
  logic: "Also prove that your answer is the ONLY possibility: rule out every alternative explicitly, then state the general rule behind the puzzle in one sentence.",
  analytical: "Also produce a second, independent estimate or model by a different route, reconcile the two, and name the single assumption your result is most sensitive to.",
  critical: "Also steelman the claim you are critiquing in two or three sentences, and state exactly what evidence would change your mind.",
  creative: "Double your output, then add one hard constraint of your own (budget, material, audience) and show how your best idea survives it.",
};
const SCAFFOLD: Record<Category, string> = {
  logic: "Start by listing every possibility (every case, every option) before you decide anything. Then test each one against the rules, one at a time, and cross out the ones that fail.",
  analytical: "Start by writing the 2-4 factors you would multiply or add to get the answer. Put a rough number on each, then combine them. Exactness doesn't matter; structure does.",
  critical: "Start by writing the claim in one sentence and the reason it gives in another. Then ask: is the reason actually enough to support the claim? What is missing?",
  creative: "Start with five quick, ordinary ideas to warm up. Then, for each one, ask 'what if it were the opposite / for a different person / ten times bigger?'",
};
const MAX_SHIFT = 4; // how far ahead/behind schedule calibration may reach
const JITTER = 2; // personal randomness, in difficulty steps
const WINDOW = 3; // recent answers used for calibration

type PlanSub = Pick<Submission, "category" | "day" | "is_bonus" | "feedback_json" | "score">;
type Assignment = { canonical: number[]; shift: number[] };

export type Tuning = "harder" | "easier" | null;

export type Plan = {
  randomised: boolean;
  /** The user's exercise for a program day, with `day` set to that program day. */
  get(category: Category, day: number): Exercise;
  /** The exercise a stored submission answered. */
  forSubmission(sub: Pick<Submission, "category" | "day" | "is_bonus" | "feedback_json">): Exercise | undefined;
  /** Whether that day's exercise was pitched above or below the default schedule for this user. */
  tuning(category: Category, day: number): Tuning;
};

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic number in [0, 1) for a key. */
function unit(key: string): number {
  let t = (hashSeed(key) + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Difficulty shift from recent scores: 6.5 is on track; each point above/below moves ~1.5 steps. */
export function calibrationShift(recentScores: number[]): number {
  if (!recentScores.length) return 0;
  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  return Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, Math.round((avg - 6.5) * 1.5)));
}

/** Day 30: the same problem as the user's day 1, framed as a revisit. */
function revisitOf(first: Exercise): Exercise {
  return {
    ...first,
    id: `${first.category}-30`,
    day: 30,
    title: `${first.title} (revisited)`,
    prompt: `Day 30: you're back where you started. Answer your Day 1 problem again, as thoroughly as you now can.\n\n${first.prompt}`,
    rubric: `${first.rubric}\n\nThis is a revisit: EXPECT more than on Day 1 (sharper structure, explicit checks, better vocabulary). Compare explicitly with the Day 1 answer: what improved and what is still missing.`,
    revisit_of: first.id,
    revisit_day: 1,
  };
}

/**
 * Canonical exercise day chosen for each program day 1-29 of one skill, plus the calibration shift in force that day.
 * `answered` maps program day → { canonical day actually answered, score }.
 */
export function assignDays(userId: string, category: Category, answered: Map<number, { canonical: number; score: number }>): Assignment {
  const pinned = new Set(PINNED[category] ?? []);
  const used = new Set<number>([...answered.values()].map((a) => a.canonical));
  pinned.forEach((d) => used.add(d));
  const canonical: number[] = [];
  const shift: number[] = [];
  const scores: number[] = [];
  for (let day = 1; day <= 29; day++) {
    const prior = answered.get(day);
    const s = calibrationShift(scores.slice(-WINDOW));
    shift.push(s);
    if (prior) {
      canonical.push(prior.canonical);
    } else if (pinned.has(day)) {
      canonical.push(day);
    } else {
      const jitter = Math.round((unit(`${userId}:${category}:${day}`) * 2 - 1) * JITTER);
      const target = day + s + jitter;
      let best = -1;
      let bestCost = Infinity;
      for (let c = 1; c <= 29; c++) {
        if (used.has(c) || bandOf(c) !== bandOf(day)) continue;
        // Distance to the target, with a tiny seeded tie-break so equal options don't always resolve the same way.
        const cost = Math.abs(c - target) + unit(`${userId}:${category}:${day}:${c}`) * 0.01;
        if (cost < bestCost) {
          bestCost = cost;
          best = c;
        }
      }
      canonical.push(best);
      used.add(best);
    }
    if (prior) scores.push(prior.score);
  }
  return { canonical, shift };
}

/** Adds the calibrated "Level up" extension or "Warm-up" scaffold to an exercise. */
function pitch(ex: Exercise, tuning: Tuning): Exercise {
  if (tuning === "harder") {
    return {
      ...ex,
      prompt: `${ex.prompt}\n\nLevel up (calibrated to your recent results): ${STRETCH[ex.category]}`,
      rubric: `${ex.rubric}\n\nCALIBRATION: this learner has been scoring highly, so the exercise includes a "Level up" extension: ${STRETCH[ex.category]} Hold them to that higher bar: an answer that ignores the extension cannot score above 7.`,
    };
  }
  if (tuning === "easier") {
    return {
      ...ex,
      prompt: `${ex.prompt}\n\nWarm-up (calibrated to your recent results): ${SCAFFOLD[ex.category]}`,
      rubric: `${ex.rubric}\n\nCALIBRATION: this learner has been struggling, so the exercise includes a "Warm-up" scaffold: ${SCAFFOLD[ex.category]} Grade the core answer against the rubric, give extra credit for following the scaffold's structure, and make the feedback especially concrete and encouraging about the next step.`,
    };
  }
  return ex;
}

export function buildPlan(userId: string, submissions: PlanSub[]): Plan {
  // Anyone with an answer that predates per-user plans keeps the original order.
  const randomised = !submissions.some((s) => !s.is_bonus && !s.feedback_json?.exercise_id);

  const plans = {} as Record<Category, Assignment>;
  for (const category of CATEGORIES) {
    if (!randomised) {
      plans[category] = { canonical: Array.from({ length: 29 }, (_, i) => i + 1), shift: Array(29).fill(0) };
      continue;
    }
    const answered = new Map<number, { canonical: number; score: number }>();
    for (const s of submissions) {
      const id = s.feedback_json?.exercise_id;
      if (s.is_bonus || s.category !== category || !id || id.endsWith("-30")) continue;
      const ex = getExerciseById(id);
      if (ex) answered.set(s.day, { canonical: ex.day, score: Number(s.score) });
    }
    plans[category] = assignDays(userId, category, answered);
  }

  const tuning = (category: Category, day: number): Tuning => {
    if (!randomised || day >= 29) return null;
    const s = plans[category].shift[day - 1];
    return s >= STRETCH_AT ? "harder" : s <= SCAFFOLD_AT ? "easier" : null;
  };

  const base = (category: Category, day: number): Exercise => {
    const ex = getExercise(category, plans[category].canonical[day - 1])!;
    // Exercises that review an earlier one point at the program day it now falls on.
    const revisitDay = ex.revisit_of ? plans[category].canonical.indexOf(getExerciseById(ex.revisit_of)!.day) + 1 : undefined;
    return pitch({ ...ex, day, ...(revisitDay ? { revisit_day: revisitDay } : {}) }, tuning(category, day));
  };
  const get = (category: Category, day: number): Exercise => (day === 30 ? revisitOf(base(category, 1)) : base(category, day));

  return {
    randomised,
    get,
    forSubmission(sub) {
      if (sub.is_bonus) return undefined;
      const id = sub.feedback_json?.exercise_id;
      if (id?.endsWith("-30")) return get(sub.category, 30);
      const stored = id ? getExerciseById(id) : undefined;
      if (!stored) return get(sub.category, sub.day);
      // Same exercise the plan assigned: include the calibrated pitch the learner actually saw.
      if (sub.day < 30 && plans[sub.category].canonical[sub.day - 1] === stored.day) return get(sub.category, sub.day);
      return { ...stored, day: sub.day };
    },
    tuning,
  };
}

/** Every exercise a user will see, in program order (used by the 3D brain). */
export function planExercises(plan: Plan): Exercise[] {
  return CATEGORIES.flatMap((c) => Array.from({ length: 30 }, (_, i) => plan.get(c, i + 1)));
}

export { EXERCISES };
