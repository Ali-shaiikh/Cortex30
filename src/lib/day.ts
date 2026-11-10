// Day/unlock logic. Every user's program runs on Asia/Kolkata calendar days.
export const TIMEZONE = "Asia/Kolkata";
export const PROGRAM_DAYS = 30;

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for the given instant, in Asia/Kolkata. */
export function localDate(now: Date = new Date()): string {
  return dateFmt.format(now);
}

function toUtcMs(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / 86_400_000);
}

export function addDays(ymd: string, days: number): string {
  return new Date(toUtcMs(ymd) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Days since start_date + 1, uncapped (can exceed 30 once the program is over). */
export function rawProgramDay(startDate: string, now: Date = new Date()): number {
  return Math.max(1, daysBetween(startDate, localDate(now)) + 1);
}

/** The current program day, 1..30. */
export function currentDay(startDate: string, now: Date = new Date()): number {
  return Math.min(PROGRAM_DAYS, rawProgramDay(startDate, now));
}

/** The Asia/Kolkata calendar date on which a program day falls. */
export function dateOfDay(startDate: string, day: number): string {
  return addDays(startDate, day - 1);
}

/** Milliseconds until the next Asia/Kolkata midnight (IST has no DST, fixed +05:30). */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const IST_OFFSET_MS = 5.5 * 3_600_000;
  const local = now.getTime() + IST_OFFSET_MS;
  const nextMidnight = Math.floor(local / 86_400_000) * 86_400_000 + 86_400_000;
  return nextMidnight - local;
}

export function isDayUnlocked(day: number, startDate: string, now: Date = new Date()): boolean {
  return day >= 1 && day <= currentDay(startDate, now);
}
