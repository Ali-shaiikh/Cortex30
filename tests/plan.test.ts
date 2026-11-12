import { describe, expect, it } from "vitest";
import { buildPlan, shuffledDays } from "@/lib/plan";
import { CATEGORIES } from "@/lib/types";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

describe("per-user plans", () => {
  it("gives different users different orders, and the same user the same order every time", () => {
    expect(shuffledDays(A)).toEqual(shuffledDays(A));
    expect(shuffledDays(A)).not.toEqual(shuffledDays(B));
    const a = buildPlan(A, []);
    const b = buildPlan(B, []);
    const differing = CATEGORIES.flatMap((c) => Array.from({ length: 28 }, (_, i) => a.get(c, i + 1).id !== b.get(c, i + 1).id)).filter(Boolean);
    expect(differing.length).toBeGreaterThan(60); // most of the 112 shuffled slots differ
  });

  it("uses every exercise exactly once and only shuffles within weekly bands", () => {
    for (const c of CATEGORIES) {
      const order = shuffledDays(A)[c].slice(0, 29);
      expect([...order].sort((x, y) => x - y)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
      order.slice(0, 28).forEach((canonical, i) => expect(Math.floor((canonical - 1) / 7)).toBe(Math.floor(i / 7)));
    }
  });

  it("keeps the decision journal on day 16 and its review on day 29", () => {
    const p = buildPlan(A, []);
    expect(p.get("critical", 16).id).toBe("critical-16");
    expect(p.get("critical", 29)).toMatchObject({ id: "critical-29", revisit_day: 16 });
  });

  it("makes day 30 a revisit of the user's own day 1", () => {
    const p = buildPlan(A, []);
    for (const c of CATEGORIES) {
      const first = p.get(c, 1);
      expect(p.get(c, 30)).toMatchObject({ id: `${c}-30`, day: 30, revisit_of: first.id, revisit_day: 1 });
      expect(p.get(c, 30).prompt).toContain(first.prompt);
    }
  });

  it("keeps the original order for users with answers from before per-user plans", () => {
    const legacy = buildPlan(A, [{ is_bonus: false, feedback_json: {} as never }]);
    expect(legacy.randomised).toBe(false);
    expect(legacy.get("logic", 5).id).toBe("logic-05");
  });

  it("resolves stored answers to the exercise they answered", () => {
    const p = buildPlan(A, []);
    expect(p.forSubmission({ category: "logic", day: 3, is_bonus: false, feedback_json: { exercise_id: "logic-06" } as never })).toMatchObject({ id: "logic-06", day: 3 });
  });
});
