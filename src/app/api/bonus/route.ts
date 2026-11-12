import { NextResponse } from "next/server";
import { z } from "zod";
import { generateBonus } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { getExercise } from "@/lib/exercises";
import { completionMap, fingerprint, key, mainSubmissions } from "@/lib/progress";
import { withAiQuota } from "@/lib/ratelimit";
import { CATEGORIES, type Category } from "@/lib/types";

const schema = z.object({ day: z.number().int().min(1).max(30) });

/** Creates (once) the Weak Spot bonus for a completed day, targeting the most frequent thinking pattern. */
export const POST = handler(schema, async ({ day }) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const existing = ctx.reports.find((r) => r.kind === "bonus" && r.week === day);
  if (existing) return NextResponse.json({ bonus: JSON.parse(existing.text) });

  const done = completionMap(ctx.submissions);
  if (!CATEGORIES.every((c) => done.has(key(c, day)))) return jsonError("Finish all four exercises for this day first", 400);

  const top = fingerprint(ctx.submissions).find((f) => !f.fixed) ?? fingerprint(ctx.submissions)[0];
  if (!top) return jsonError("No weak spot found yet. Great work!", 400);
  // Target the skill where that pattern shows up most.
  const counts = new Map<Category, number>();
  for (const s of mainSubmissions(ctx.submissions)) {
    if (s.thinking_pattern?.toLowerCase() === top.pattern) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  const category = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "critical";

  const bonus = await withAiQuota(ctx.supabase, ctx.userId, () =>
    generateBonus({
      pattern: top.pattern,
      category,
      day,
      recentTitles: CATEGORIES.map((c) => getExercise(c, day)?.title ?? ""),
    }),
  );
  const { error } = await ctx.supabase.from("reports").insert({ user_id: ctx.userId, kind: "bonus", week: day, text: JSON.stringify(bonus) });
  if (error && error.code !== "23505") return jsonError(error.message, 500);
  return NextResponse.json({ bonus });
});
