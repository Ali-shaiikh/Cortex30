"use client";

import { motion } from "framer-motion";
import type { StoredFeedback } from "@/lib/types";
import { VerdictBadge } from "../ui/VerdictBadge";
import { Icon } from "../ui/Icon";

const SECTIONS: { key: keyof StoredFeedback; title: string; sub: string; accent: string }[] = [
  { key: "what_you_got_right", title: "What you got right", sub: "", accent: "#2ec4a0" },
  { key: "where_your_thinking_went_wrong", title: "Where your thinking went wrong", sub: "", accent: "#ff8a4c" },
  { key: "how_to_think_about_it", title: "How to think about it", sub: "the expert's model", accent: "#6fe7ff" },
  { key: "transferable_lesson", title: "Lesson to keep", sub: "", accent: "#c77dff" },
  { key: "try_this_next", title: "Try this next", sub: "2 minutes", accent: "#5b9cff" },
];

export function FeedbackView({ feedback, hintsUsed }: { feedback: StoredFeedback; hintsUsed: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={feedback.verdict} score={feedback.score} />
        {feedback.thinking_pattern && feedback.thinking_pattern !== "none" && (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/75">
            <Icon name="pattern" size={12} className="mr-1" />
            pattern: {feedback.thinking_pattern}
          </span>
        )}
        {hintsUsed > 0 && feedback.raw_score !== undefined && (
          <span className="font-mono text-[11px] text-cyan-100/45">
            {feedback.raw_score}/10 − {hintsUsed} hint{hintsUsed > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {SECTIONS.map((s, i) => (
        <motion.section
          key={s.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i }}
          className="rounded-xl bg-white/[0.035] p-4"
          style={{ borderLeft: `2px solid ${s.accent}` }}
        >
          <h4 className="mb-1.5 flex items-baseline gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.accent }} />
            <span className="text-sm font-semibold text-white">{s.title}</span>
            {s.sub && <span className="text-xs text-white/45">{s.sub}</span>}
          </h4>
          <p className="whitespace-pre-line font-read text-[0.97rem] leading-[1.7] text-white/85">{String(feedback[s.key] ?? "")}</p>
        </motion.section>
      ))}
    </div>
  );
}
