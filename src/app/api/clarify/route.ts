import { NextResponse } from "next/server";
import { z } from "zod";
import { clarifyQuestion } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { completionMap, nodeState } from "@/lib/progress";
import { withAiQuota } from "@/lib/ratelimit";
import { CATEGORIES, MAX_CLARIFICATIONS, type BonusExercise } from "@/lib/types";

const turn = z.object({ question: z.string().max(800), answer: z.string().max(4000) });
const schema = z.object({
  category: z.enum(CATEGORIES),
  day: z.number().int().min(1).max(30),
  bonus: z.boolean().default(false),
  question: z.string().trim().min(3, "Ask a question").max(800),
  history: z.array(turn).max(MAX_CLARIFICATIONS).default([]),
});

/** "Ask about this question": explains the exercise before it's answered, without giving the answer away. */
export const POST = handler(schema, async (body) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  if (body.history.length >= MAX_CLARIFICATIONS) return jsonError(`That's the maximum of ${MAX_CLARIFICATIONS} questions about this exercise.`, 409);

  let exercise;
  if (body.bonus) {
    const report = ctx.reports.find((r) => r.kind === "bonus" && r.week === body.day);
    if (!report) return jsonError("Bonus not found", 404);
    if (ctx.submissions.some((s) => s.is_bonus && s.day === body.day)) return jsonError("You've already answered this one. Ask a follow-up instead.", 409);
    exercise = JSON.parse(report.text) as BonusExercise;
  } else {
    const state = nodeState(body.category, body.day, ctx.today, completionMap(ctx.submissions));
    if (state === "completed") return jsonError("You've already answered this one. Ask a follow-up instead.", 409);
    if (state === "locked") return jsonError("This exercise is still locked", 403);
    exercise = ctx.plan.get(body.category, body.day);
  }

  const answer = await withAiQuota(ctx.supabase, ctx.userId, () => clarifyQuestion({ exercise, question: body.question, history: body.history }));
  return NextResponse.json({ turn: { question: body.question, answer } });
});
