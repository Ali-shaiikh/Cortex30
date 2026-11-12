// Per-user exercise plan: every user gets their own (stable) order of questions.
//
// - Exercises are shuffled within weekly bands (days 1-7, 8-14, 15-21, 22-28), so difficulty still ramps up.
// - Day 16's decision journal and day 29's review of it stay pinned (critical), because one refers to the other.
// - Day 30 is always a revisit of whatever exercise the user had on day 1.
// - Users who already answered under the original fixed order keep it, so their history stays consistent.
import { EXERCISES, getExercise, getExerciseById } from "./exercises";
import { CATEGORIES, type Category, type Exercise, type Submission } from "./types";

const BANDS: [number, number][] = [
  [1, 7],
  [8, 14],
  [15, 21],
  [22, 28],
];
const PINNED: Partial<Record<Category, number[]>> = { critical: [16, 29] };

export type Plan = {
  randomised: boolean;
  /** The user's exercise for a program day, with `day` set to that program day. */
  get(category: Category, day: number): Exercise;
  /** The exercise a stored submission answered. */
  forSubmission(sub: Pick<Submission, "category" | "day" | "is_bonus" | "feedback_json">): Exercise | undefined;
};

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Program day → canonical exercise day, per category, for one user (days 1-29; day 30 is derived). */
export function shuffledDays(userId: string): Record<Category, number[]> {
  const out = {} as Record<Category, number[]>;
  for (const category of CATEGORIES) {
    const rand = rng(hashSeed(`${userId}:${category}`));
    const order = Array.from({ length: 30 }, (_, i) => i + 1); // index = program day - 1
    const pinned = new Set(PINNED[category] ?? []);
    for (const [from, to] of BANDS) {
      const days = [];
      for (let d = from; d <= to; d++) if (!pinned.has(d)) days.push(d);
      const shuffled = [...days];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      days.forEach((d, i) => (order[d - 1] = shuffled[i]));
    }
    out[category] = order;
  }
  return out;
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

export function buildPlan(userId: string, submissions: Pick<Submission, "is_bonus" | "feedback_json">[]): Plan {
  // Anyone with an answer that predates per-user plans keeps the original order.
  const randomised = !submissions.some((s) => !s.is_bonus && !s.feedback_json?.exercise_id);
  const order = randomised ? shuffledDays(userId) : null;

  const base = (category: Category, day: number): Exercise => {
    const canonicalDay = order ? order[category][day - 1] : day;
    const ex = getExercise(category, canonicalDay)!;
    // Exercises that review an earlier one point at the program day it now falls on.
    const revisitDay = ex.revisit_of ? (order ? order[category].indexOf(getExerciseById(ex.revisit_of)!.day) + 1 : getExerciseById(ex.revisit_of)!.day) : undefined;
    return { ...ex, day, ...(revisitDay ? { revisit_day: revisitDay } : {}) };
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
      return stored ? { ...stored, day: sub.day } : get(sub.category, sub.day);
    },
  };
}

/** Every exercise a user will see, in program order (used by the 3D brain). */
export function planExercises(plan: Plan): Exercise[] {
  return CATEGORIES.flatMap((c) => Array.from({ length: 30 }, (_, i) => plan.get(c, i + 1)));
}

export { EXERCISES };
