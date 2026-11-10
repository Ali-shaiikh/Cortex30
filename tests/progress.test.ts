import { describe, expect, it } from "vitest";
import { achievements, calibration, completionMap, currentStreak, fingerprint, mastery, nodeState, trend, type SubLike } from "@/lib/progress";
import { CATEGORIES, type Category } from "@/lib/types";

const START = "2026-03-01";
// 10:00 IST on a given program day
const at = (day: number, hour = 4) => new Date(Date.UTC(2026, 2, day, hour, 30)).toISOString();

function sub(category: Category, day: number, score: number, extra: Partial<SubLike> = {}): SubLike {
  return { category, day, score, verdict: "correct", confidence: 70, thinking_pattern: null, created_at: at(day), is_bonus: false, ...extra };
}
const fullDay = (day: number, score: number, extra: Partial<SubLike> = {}) => CATEGORIES.map((c) => sub(c, day, score, extra));

describe("unlock rules", () => {
  it("needs the day to have arrived AND the previous node completed", () => {
    const done = completionMap([sub("logic", 1, 7)]);
    expect(nodeState("logic", 1, 3, done)).toBe("completed");
    expect(nodeState("logic", 2, 3, done)).toBe("available");
    expect(nodeState("logic", 3, 3, done)).toBe("locked"); // day 2 not done
    expect(nodeState("analytical", 1, 3, done)).toBe("available");
    expect(nodeState("logic", 2, 1, done)).toBe("locked"); // day hasn't arrived
  });
});

describe("streaks", () => {
  it("counts consecutive on-time full days, ending today or yesterday", () => {
    const subs = [...fullDay(1, 7), ...fullDay(2, 7), ...fullDay(3, 7)];
    expect(currentStreak(subs, START, 3)).toBe(3);
    expect(currentStreak(subs, START, 4)).toBe(3); // today not done yet
    expect(currentStreak(subs, START, 5)).toBe(0); // missed day 4
  });

  it("does not count days completed late", () => {
    const late = fullDay(2, 7).map((s) => ({ ...s, created_at: at(3) }));
    expect(currentStreak([...fullDay(1, 7), ...late, ...fullDay(3, 7)], START, 3)).toBe(1);
  });
});

describe("mastery", () => {
  it("uses the rolling average of the last 5 scores", () => {
    const scores = [2, 2, 8, 8, 8, 8, 8];
    const subs = scores.map((s, i) => sub("logic", i + 1, s));
    const m = mastery(subs, "logic");
    expect(m.avg).toBe(8);
    expect(m.level).toBe("Master");
    expect(m.averageScore).toBeCloseTo(44 / 7);
  });
});

describe("calibration + fingerprint + trend", () => {
  it("flags overconfidence", () => {
    const subs = [sub("logic", 1, 3, { confidence: 90 }), sub("logic", 2, 4, { confidence: 85 })];
    expect(calibration(subs).perSkill[0].label).toBe("overconfident");
  });

  it("marks a pattern fixed when absent from the last 5", () => {
    const subs = [
      sub("logic", 1, 3, { thinking_pattern: "Anchoring" }),
      sub("logic", 2, 3, { thinking_pattern: "anchoring" }),
      ...[3, 4, 5, 6, 7].map((d) => sub("logic", d, 8, { thinking_pattern: "stopped too early" })),
    ];
    const fp = fingerprint(subs);
    expect(fp.find((f) => f.pattern === "anchoring")).toMatchObject({ count: 2, fixed: true });
    expect(fp.find((f) => f.pattern === "stopped too early")?.fixed).toBe(false);
  });

  it("labels an improving trend", () => {
    const subs = [1, 2, 3, 4, 5].flatMap((d) => fullDay(d, d + 3));
    expect(trend(subs).label).toBe("improving");
  });
});

describe("achievements", () => {
  it("unlocks First Spark, Perfect Day and the bridges it creates", () => {
    const res = achievements(fullDay(1, 9), START);
    const ids = res.achievements.filter((a) => a.unlocked).map((a) => a.id);
    expect(ids).toContain("first_spark");
    expect(ids).toContain("perfect_day");
    expect(res.perfectDays).toEqual([1]);
    expect(res.bridges.filter((b) => b.reason === "Perfect Day 1")).toHaveLength(4);
  });

  it("detects a comeback", () => {
    const scores = [3, 3, 3, 3, 3, 8, 8, 8, 8];
    const subs = scores.map((s, i) => sub("creative", i + 1, s));
    expect(achievements(subs, START).comebackSkill).toBe("creative");
  });
});
