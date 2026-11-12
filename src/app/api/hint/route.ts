import { NextResponse } from "next/server";
import { z } from "zod";
import { getHint } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { getExercise } from "@/lib/exercises";
import { completionMap, nodeState } from "@/lib/progress";
import { withAiQuota } from "@/lib/ratelimit";
import { CATEGORIES, type BonusExercise } from "@/lib/types";

const schema = z.object({
  category: z.enum(CATEGORIES),
  day: z.number().int().min(1).max(30),
  answer: z.string().max(8000).default(""),
  reasoning: z.string().max(8000).default(""),
  previousHints: z.array(z.string().max(500)).max(5).default([]),
  bonus: z.boolean().default(false),
});

export const POST = handler(schema, async (body) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  if (body.previousHints.length >= 3) return jsonError("That's the maximum of 3 hints. Trust your reasoning!", 400);

  let exercise;
  if (body.bonus) {
    const report = ctx.reports.find((r) => r.kind === "bonus" && r.week === body.day);
    if (!report) return jsonError("Bonus not found", 404);
    exercise = JSON.parse(report.text) as BonusExercise;
  } else {
    exercise = getExercise(body.category, body.day);
    if (!exercise) return jsonError("Exercise not found", 404);
    if (nodeState(body.category, body.day, ctx.today, completionMap(ctx.submissions)) !== "available") {
      return jsonError("Hints are only available before you submit", 400);
    }
  }

  const hint = await withAiQuota(ctx.supabase, ctx.userId, () =>
    getHint({ exercise, draftAnswer: body.answer, draftReasoning: body.reasoning, previousHints: body.previousHints }),
  );
  return NextResponse.json({ hint });
});
