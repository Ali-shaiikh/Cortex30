import { loadForApi } from "@/lib/data";
import { jsonError } from "@/lib/api";
import { getExercise } from "@/lib/exercises";
import { CATEGORY_META } from "@/lib/types";

/** Downloads every answer + coach feedback as Markdown. */
export async function GET() {
  const ctx = await loadForApi();
  if (!ctx) return jsonError("Not signed in", 401);
  const { profile, submissions, reports } = ctx;

  const lines: string[] = [`# Cortex30: @${profile.username}`, "", `Started ${profile.start_date} · ${submissions.filter((s) => !s.is_bonus).length}/120 exercises`, ""];
  const final = reports.find((r) => r.kind === "final");
  if (final) lines.push("## Final review", "", final.text, "");
  for (const r of reports.filter((r) => r.kind === "weekly").sort((a, b) => (a.week ?? 0) - (b.week ?? 0))) {
    lines.push(`## Week ${r.week} report`, "", r.text, "");
  }

  const sorted = [...submissions].sort((a, b) => a.day - b.day || a.category.localeCompare(b.category) || Number(a.is_bonus) - Number(b.is_bonus));
  let day = 0;
  for (const s of sorted) {
    if (s.day !== day) {
      day = s.day;
      lines.push(`## Day ${day}`, "");
    }
    const ex = s.is_bonus ? s.feedback_json.bonus : getExercise(s.category, s.day);
    const fb = s.feedback_json;
    lines.push(
      `### ${CATEGORY_META[s.category].label}${s.is_bonus ? " (bonus)" : ""}: ${ex?.title ?? ""}`,
      "",
      `**Verdict:** ${s.verdict.replace("_", " ")} · **Score:** ${s.score}/10 · **Confidence:** ${s.confidence}%${s.hints_used ? ` · **Hints:** ${s.hints_used}` : ""}`,
      "",
      "**Prompt**",
      "",
      ...(ex?.prompt ?? "").split("\n").map((l) => `> ${l}`),
      "",
      "**My answer**",
      "",
      s.answer,
      "",
      "**My reasoning**",
      "",
      s.reasoning,
      "",
      `**What I got right:** ${fb.what_you_got_right}`,
      "",
      `**Where my thinking went wrong:** ${fb.where_your_thinking_went_wrong}`,
      "",
      `**How to think about it:** ${fb.how_to_think_about_it}`,
      "",
      `**Lesson:** ${fb.transferable_lesson}`,
      "",
      `**Try next:** ${fb.try_this_next}`,
      "",
      ...(fb.followup ? [`**My follow-up:** ${fb.followup.question}`, "", `**Coach:** ${fb.followup.answer}`, ""] : []),
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="cortex30-${profile.username}.md"`,
    },
  });
}
