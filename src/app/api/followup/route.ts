import { NextResponse } from "next/server";
import { z } from "zod";
import { answerFollowUp } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { withAiQuota } from "@/lib/ratelimit";

const schema = z.object({
  submissionId: z.string().uuid(),
  question: z.string().trim().min(3, "Ask a question").max(800),
});

export const POST = handler(schema, async (body) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const sub = ctx.submissions.find((s) => s.id === body.submissionId);
  if (!sub) return jsonError("Submission not found", 404);
  if (sub.feedback_json.followup) return jsonError("You've already used your follow-up for this exercise", 409);
  const exercise = sub.is_bonus ? sub.feedback_json.bonus : ctx.plan.forSubmission(sub);
  if (!exercise) return jsonError("Exercise not found", 404);

  const answer = await withAiQuota(ctx.supabase, ctx.userId, () => answerFollowUp({ exercise, submission: sub, question: body.question }));
  const { data: saved, error } = await ctx.supabase.rpc("add_followup", { submission_id: sub.id, question: body.question, reply: answer });
  if (error) return jsonError(error.message, 500);
  if (!saved) return jsonError("You've already used your follow-up for this exercise", 409);
  return NextResponse.json({ followup: { question: body.question, answer, at: new Date().toISOString() } });
});
