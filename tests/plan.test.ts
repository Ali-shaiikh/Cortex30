import { describe, expect, it } from "vitest";
import { getExerciseById } from "@/lib/exercises";
import { assignDays, buildPlan, calibrationShift } from "@/lib/plan";
import { CATEGORIES, type Category } from "@/lib/types";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

/** Simulates a user who answers every day of one skill with a fixed score, letting the plan pick each exercise. */
function simulate(userId: string, category: Category, score: number, days = 28) {
  const subs: { category: Category; day: number; is_bonus: boolean; score: number; feedback_json: never }[] = [];
  for (let day = 1; day <= days; day++) {
    const ex = buildPlan(userId, subs).get(category, day);
    subs.push({ category, day, is_bonus: false, score, feedback_json: { exercise_id: ex.id } as never });
  }
  return subs.map((s) => getExerciseById((s.feedback_json as unknown as { exercise_id: string }).exercise_id)!.day);
}
const avgOffset = (canonical: number[], from: number, to: number) => {
  const slice = canonical.slice(from - 1, to);
  return slice.reduce((acc, c, i) => acc + (c - (from + i)), 0) / slice.length;
};

describe("self-calibrating plans", () => {
  it("maps recent scores to a bounded difficulty shift", () => {
    expect(calibrationShift([])).toBe(0);
    expect(calibrationShift([6, 7])).toBe(0);
    expect(calibrationShift([10, 10, 10])).toBe(4);
    expect(calibrationShift([1, 2, 1])).toBe(-4);
  });

  it("is deterministic per user, and different users get different sequences", () => {
    expect(buildPlan(A, []).get("logic", 5).id).toBe(buildPlan(A, []).get("logic", 5).id);
    const a = simulate(A, "logic", 6.5);
    const b = simulate(B, "logic", 6.5);
    expect(a).not.toEqual(b);
  });

  it("pitches exercises up for strong performers and down for struggling ones", () => {
    const strongSubs = [1, 2, 3].map((day) => ({ category: "logic" as const, day, is_bonus: false, score: 10, feedback_json: { exercise_id: `logic-0${day}` } as never }));
    const weakSubs = strongSubs.map((s) => ({ ...s, score: 2 }));
    const strong = buildPlan(A, strongSubs);
    const weak = buildPlan(A, weakSubs);
    expect(strong.tuning("logic", 4)).toBe("harder");
    expect(strong.get("logic", 4).prompt).toContain("Level up");
    expect(strong.get("logic", 4).rubric).toContain("cannot score above 7");
    expect(weak.tuning("logic", 4)).toBe("easier");
    expect(weak.get("logic", 4).prompt).toContain("Warm-up");
  });

  it("orders each week by performance: strong performers meet the week's harder problems first", () => {
    for (const c of CATEGORIES) {
      const strong = simulate(A, c, 10);
      const weak = simulate(A, c, 2);
      // First days of weeks 2-4 (excluding pinned days)
      for (const day of [8, 22]) expect(strong[day - 1]).toBeGreaterThan(weak[day - 1]);
      expect(avgOffset(strong, 8, 11)).toBeGreaterThan(avgOffset(weak, 8, 11));
    }
  });

  it("keeps every exercise inside its week, so the overall difficulty ramp holds", () => {
    for (const score of [2, 10]) {
      for (const c of CATEGORIES) {
        simulate(B, c, score).forEach((canonical, i) => expect(Math.floor((canonical - 1) / 7)).toBe(Math.floor(i / 7)));
      }
    }
  });

  it("never repeats an exercise within a skill", () => {
    for (const score of [2, 6.5, 10]) {
      for (const c of CATEGORIES) {
        const seq = simulate(B, c, score);
        expect(new Set(seq).size).toBe(seq.length);
      }
    }
  });

  it("depends only on earlier answers, so today's exercise never changes", () => {
    const answered = new Map([[1, { canonical: 3, score: 9 }], [2, { canonical: 5, score: 10 }]]);
    const before = assignDays(A, "logic", answered).canonical[2];
    const later = new Map([...answered, [3, { canonical: before, score: 1 }]]);
    expect(assignDays(A, "logic", later).canonical[2]).toBe(before);
  });

  it("keeps the decision journal on day 16, its review on day 29, and day 30 as a revisit of day 1", () => {
    const p = buildPlan(A, []);
    expect(p.get("critical", 16).id).toBe("critical-16");
    expect(p.get("critical", 29)).toMatchObject({ id: "critical-29", revisit_day: 16 });
    for (const c of CATEGORIES) expect(p.get(c, 30)).toMatchObject({ id: `${c}-30`, revisit_of: p.get(c, 1).id, revisit_day: 1 });
  });

  it("labels tuning only when calibration (not just jitter) moved the difficulty", () => {
    const strong: never[] = [];
    let p = buildPlan(A, strong);
    expect(p.tuning("logic", 1)).toBe(null);
    const subs = [1, 2, 3].map((day) => ({ category: "logic" as const, day, is_bonus: false, score: 10, feedback_json: { exercise_id: `logic-0${day}` } as never }));
    p = buildPlan(A, subs);
    expect(p.tuning("logic", 4)).toBe("harder");
  });

  it("keeps the original order for users with answers from before per-user plans", () => {
    const legacy = buildPlan(A, [{ category: "logic", day: 1, is_bonus: false, score: 8, feedback_json: {} as never }]);
    expect(legacy.randomised).toBe(false);
    expect(legacy.get("logic", 5).id).toBe("logic-05");
    expect(legacy.tuning("logic", 5)).toBe(null);
  });

  it("resolves stored answers to the exercise they answered", () => {
    const p = buildPlan(A, []);
    expect(p.forSubmission({ category: "logic", day: 3, is_bonus: false, feedback_json: { exercise_id: "logic-06" } as never })).toMatchObject({ id: "logic-06", day: 3 });
  });
});
