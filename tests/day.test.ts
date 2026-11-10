import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentDay, dateOfDay, isDayUnlocked, localDate, msUntilNextLocalMidnight, rawProgramDay } from "@/lib/day";

// Asia/Kolkata is UTC+05:30, so local midnight is 18:30 UTC the previous day.
const START = "2026-03-01";

describe("day logic (Asia/Kolkata)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is day 1 on the signup date", () => {
    vi.setSystemTime(new Date("2026-03-01T04:00:00Z")); // 09:30 IST
    expect(currentDay(START)).toBe(1);
  });

  it("rolls over exactly at local midnight, not UTC midnight", () => {
    vi.setSystemTime(new Date("2026-03-01T18:29:59Z")); // 23:59:59 IST on Mar 1
    expect(localDate()).toBe("2026-03-01");
    expect(currentDay(START)).toBe(1);

    vi.setSystemTime(new Date("2026-03-01T18:30:00Z")); // 00:00:00 IST on Mar 2
    expect(localDate()).toBe("2026-03-02");
    expect(currentDay(START)).toBe(2);

    vi.setSystemTime(new Date("2026-03-01T23:59:00Z")); // still Mar 1 in UTC, Mar 2 in IST
    expect(currentDay(START)).toBe(2);
  });

  it("locks future days and opens past ones", () => {
    vi.setSystemTime(new Date("2026-03-05T06:00:00Z")); // day 5
    expect(isDayUnlocked(5, START)).toBe(true);
    expect(isDayUnlocked(3, START)).toBe(true);
    expect(isDayUnlocked(6, START)).toBe(false);
  });

  it("caps at day 30 but keeps the raw count", () => {
    vi.setSystemTime(new Date("2026-05-01T06:00:00Z"));
    expect(currentDay(START)).toBe(30);
    expect(rawProgramDay(START)).toBeGreaterThan(30);
  });

  it("never goes below day 1 (clock skew before start)", () => {
    vi.setSystemTime(new Date("2026-02-27T06:00:00Z"));
    expect(currentDay(START)).toBe(1);
  });

  it("handles month and leap-year boundaries", () => {
    expect(dateOfDay("2028-02-28", 2)).toBe("2028-02-29");
    expect(dateOfDay("2028-02-28", 3)).toBe("2028-03-01");
    expect(dateOfDay("2026-12-31", 2)).toBe("2027-01-01");
  });

  it("computes time until the next local midnight", () => {
    const now = new Date("2026-03-01T18:00:00Z"); // 23:30 IST
    expect(msUntilNextLocalMidnight(now)).toBe(30 * 60 * 1000);
  });
});
