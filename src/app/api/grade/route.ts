import { NextResponse } from "next/server";
import { z } from "zod";
import { gradeAnswer } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { getExercise, getExerciseById } from "@/lib/exercises";
import { completionMap, nodeState, topPatterns } from "@/lib/progress";
import { consumeAiCall } from "@/lib/ratelimit";
import { CATEGORIES, type BonusExercise, type StoredFeedback } from "@/lib/types";

const schema = z.object({
  category: z.enum(CATEGORIES),
  day: z.number().int().min(1).max(30),
  answer: z.string().trim().min(1, "Write your answer first").max(8000),
  reasoning: z.string().trim().min(1, "Explain how you got there").max(8000),
  confidence: z.number().int().min(0).max(100),
  hintsUsed: z.number().int().min(0).max(10).default(0),
  bonus: z.boolean().default(false),
});

export const POST = handler(schema, async (body) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const { supabase, submissions, reports, today, userId } = ctx;
  const done = completionMap(submissions);

  let exercise: { title: string; prompt: string; reference_solution: string; rubric: string; category: typeof body.category; concept: string; revisit_of?: string };
  let bonus: BonusExercise | undefined;

  if (body.bonus) {
    const report = reports.find((r) => r.kind === "bonus" && r.week === body.day);
    if (!report) return jsonError("No bonus exercise for that day yet", 404);
    if (submissions.some((s) => s.is_bonus && s.day === body.day)) return jsonError("You already answered this bonus", 409);
    bonus = JSON.parse(report.text) as BonusExercise;
    exercise = { ...bonus };
  } else {
    const ex = getExercise(body.category, body.day);
    if (!ex) return jsonError("Exercise not found", 404);
    const state = nodeState(body.category, body.day, today, done);
    if (state === "completed") return jsonError("You already answered this one. Answers are locked.", 409);
    if (state === "locked") return jsonError("This exercise is still locked", 403);
    exercise = ex;
  }

  // Revisit days: give the coach the earlier attempt to compare against.
  let previous = null;
  if (!body.bonus && exercise.revisit_of) {
    const orig = getExerciseById(exercise.revisit_of);
    const prevSub = orig && done.get(`${orig.category}-${orig.day}`);
    if (orig && prevSub) {
      previous = { day: orig.day, answer: prevSub.answer, reasoning: prevSub.reasoning, score: Number(prevSub.score), feedback: prevSub.feedback_json.transferable_lesson };
    }
  }

  await consumeAiCall(supabase);
  const feedback = await gradeAnswer({
    exercise,
    answer: body.answer,
    reasoning: body.reasoning,
    confidence: body.confidence,
    pastPatterns: topPatterns(submissions, 3),
    previous,
  });

  // Each Socratic hint costs one point.
  const finalScore = Math.max(0, Math.round((feedback.score - body.hintsUsed) * 10) / 10);
  const stored: StoredFeedback = { ...feedback, score: finalScore, raw_score: feedback.score, ...(bonus ? { bonus } : {}) };

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: userId,
      day: body.day,
      category: exercise.category,
      answer: body.answer,
      reasoning: body.reasoning,
      confidence: body.confidence,
      verdict: feedback.verdict,
      score: finalScore,
      feedback_json: stored,
      thinking_pattern: feedback.thinking_pattern,
      hints_used: body.hintsUsed,
      is_bonus: body.bonus,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") return jsonError("You already answered this one. Answers are locked.", 409);
    return jsonError(`Could not save your answer: ${error.message}`, 500);
  }
  return NextResponse.json({ submission: { ...data, score: Number(data.score) } });
});
