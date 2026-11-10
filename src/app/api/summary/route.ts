import { NextResponse } from "next/server";
import { z } from "zod";
import { writeSummary } from "@/lib/ai";
import { handler, jsonError } from "@/lib/api";
import { loadForApi } from "@/lib/data";
import { localDate } from "@/lib/day";
import { consumeAiCall } from "@/lib/ratelimit";
import { buildReportStats } from "@/lib/stats";

/** Regenerates the "where you stand" summary, at most once per (IST) day. */
export const POST = handler(z.object({}), async () => {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const latest = ctx.reports.find((r) => r.kind === "summary");
  if (latest && localDate(new Date(latest.created_at)) === localDate()) return NextResponse.json({ report: latest, fresh: false });
  if (ctx.submissions.length < 2) return jsonError("Complete a couple of exercises first", 400);

  await consumeAiCall(ctx.supabase);
  const text = await writeSummary(buildReportStats(ctx.profile, ctx.submissions, ctx.today));
  const { data, error } = await ctx.supabase.from("reports").insert({ user_id: ctx.userId, kind: "summary", text }).select("*").single();
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ report: data, fresh: true });
});
