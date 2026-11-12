import { NextResponse } from "next/server";
import { z } from "zod";
import { answerFollowUp } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { withAiQuota } from "@/lib/ratelimit";
import { followupsOf, MAX_FOLLOWUPS } from "@/lib/types";

const schema = z.object({
  submissionId: z.string().uuid(),
  question: z.string().trim().min(3, "Ask a question").max(800),
});

const LIMIT_MSG = `That's the maximum of ${MAX_FOLLOWUPS} follow-up questions for this exercise.`;

export const POST = handler(schema, async (body) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const sub = ctx.submissions.find((s) => s.id === body.submissionId);
  if (!sub) return jsonError("Submission not found", 404);
  const history = followupsOf(sub.feedback_json);
  if (history.length >= MAX_FOLLOWUPS) return jsonError(LIMIT_MSG, 409);
  const exercise = sub.is_bonus ? sub.feedback_json.bonus : ctx.plan.forSubmission(sub);
  if (!exercise) return jsonError("Exercise not found", 404);

  const answer = await withAiQuota(ctx.supabase, ctx.userId, () => answerFollowUp({ exercise, submission: sub, question: body.question, history }));
  const turn = { question: body.question, answer, at: new Date().toISOString() };

  const { data: count, error } = await ctx.supabase.rpc("add_followup_message", { submission_id: sub.id, question: body.question, reply: answer, max_count: MAX_FOLLOWUPS });
  if (error) {
    // Database without migration 0002: the original single follow-up still works.
    const missing = error.code === "PGRST202" || /could not find the function/i.test(error.message);
    if (!missing) return jsonError(error.message, 500);
    if (history.length > 0) {
      return NextResponse.json({ followup: turn, saved: false, warning: "More follow-ups need a database update (run supabase/migrations/0002_followups.sql). This reply won't be saved." });
    }
    const { error: legacyError } = await ctx.supabase.rpc("add_followup", { submission_id: sub.id, question: body.question, reply: answer });
    if (legacyError) return jsonError(legacyError.message, 500);
    return NextResponse.json({ followup: turn, saved: true });
  }
  if (count === -1) return jsonError(LIMIT_MSG, 409);
  return NextResponse.json({ followup: turn, saved: true });
});
