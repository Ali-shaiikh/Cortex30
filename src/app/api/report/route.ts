import { NextResponse } from "next/server";
import { z } from "zod";
import { writeReport } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { completionMap, key } from "@/lib/progress";
import { consumeAiCall } from "@/lib/ratelimit";
import { buildReportStats } from "@/lib/stats";
import { CATEGORIES } from "@/lib/types";

const schema = z.object({ kind: z.enum(["weekly", "final"]), week: z.number().int().min(1).max(4).optional() });

/** Weekly reports unlock on days 7/14/21/28; the final review once day 30 is complete. */
export const POST = handler(schema, async ({ kind, week }) => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const done = completionMap(ctx.submissions);

  if (kind === "weekly") {
    if (!week) return jsonError("Missing week");
    const existing = ctx.reports.find((r) => r.kind === "weekly" && r.week === week);
    if (existing) return NextResponse.json({ report: existing });
    if (ctx.today < week * 7) return jsonError(`The week ${week} report unlocks on day ${week * 7}`, 400);
    if (!ctx.submissions.some((s) => s.day > (week - 1) * 7 && s.day <= week * 7)) return jsonError("No answers that week to report on", 400);
  } else {
    const existing = ctx.reports.find((r) => r.kind === "final");
    if (existing) return NextResponse.json({ report: existing });
    if (!CATEGORIES.every((c) => done.has(key(c, 30)))) return jsonError("Complete day 30 first", 400);
  }

  await consumeAiCall(ctx.supabase);
  const stats = buildReportStats(ctx.profile, ctx.submissions, ctx.today, kind === "weekly" ? (week! - 1) * 7 + 1 : 1, kind === "weekly" ? week! * 7 : 30);
  const text = await writeReport({ kind, week, stats });
  const { data, error } = await ctx.supabase
    .from("reports")
    .insert({ user_id: ctx.userId, kind, week: kind === "weekly" ? week : null, text })
    .select("*")
    .single();
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ report: data });
});
