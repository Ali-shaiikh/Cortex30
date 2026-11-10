// Compact, client-safe description of everything the 3D mind map needs to draw.
import { achievements, allMastery, completionMap, nodeState, type Bridge, type NodeState } from "./progress";
import { CATEGORIES, type Category, type Report, type Submission, type Verdict } from "./types";
import { EXERCISES } from "./exercises";

export type BrainNode = {
  category: Category;
  day: number;
  state: NodeState;
  score: number | null;
  verdict: Verdict | null;
  title: string;
  concept: string;
};

export type BrainData = {
  nodes: BrainNode[];
  bridges: Bridge[];
  mastery: Record<Category, number>; // 0-1 glow intensity
  flags: { firstSpark: boolean; halo: boolean; sparkCritical: boolean; sparkCreative: boolean; finisher: boolean };
  satellites: { category: Category; day: number; completed: boolean; score: number | null }[];
  today: number;
};

export function buildBrainData(subs: Submission[], reports: Report[], today: number, startDate: string): BrainData {
  const done = completionMap(subs);
  const nodes: BrainNode[] = EXERCISES.map((e) => {
    const s = done.get(`${e.category}-${e.day}`);
    return {
      category: e.category,
      day: e.day,
      state: nodeState(e.category, e.day, today, done),
      score: s ? Number(s.score) : null,
      verdict: s?.verdict ?? null,
      title: e.title,
      concept: e.concept,
    };
  });
  const m = allMastery(subs);
  const ach = achievements(subs, startDate);
  const unlocked = new Set(ach.achievements.filter((a) => a.unlocked).map((a) => a.id));
  const satellites = reports
    .filter((r) => r.kind === "bonus" && r.week)
    .map((r) => {
      let category: Category = "critical";
      try {
        category = JSON.parse(r.text).category ?? "critical";
      } catch {}
      const sub = subs.find((s) => s.is_bonus && s.day === r.week);
      return { category, day: r.week!, completed: Boolean(sub), score: sub ? Number(sub.score) : null };
    });
  return {
    nodes,
    bridges: ach.bridges,
    mastery: Object.fromEntries(CATEGORIES.map((c) => [c, m[c].avg === null ? 0 : m[c].avg! / 10])) as Record<Category, number>,
    flags: {
      firstSpark: unlocked.has("first_spark"),
      halo: unlocked.has("streak_7"),
      sparkCritical: unlocked.has("bias_hunter"),
      sparkCreative: unlocked.has("idea_machine"),
      finisher: unlocked.has("finisher"),
    },
    satellites,
    today,
  };
}
