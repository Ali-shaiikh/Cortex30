"use client";

import { motion } from "framer-motion";
import type { StoredFeedback } from "@/lib/types";
import { VerdictBadge } from "../ui/VerdictBadge";

const SECTIONS: { key: keyof StoredFeedback; title: string; accent: string }[] = [
  { key: "what_you_got_right", title: "What you got right", accent: "#2ec4a0" },
  { key: "where_your_thinking_went_wrong", title: "Where your thinking went wrong", accent: "#ff8a4c" },
  { key: "how_to_think_about_it", title: "How to think about it", accent: "#6fe7ff" },
  { key: "transferable_lesson", title: "Transferable lesson", accent: "#c77dff" },
  { key: "try_this_next", title: "Try this next (2 min)", accent: "#5b9cff" },
];

export function FeedbackView({ feedback, hintsUsed }: { feedback: StoredFeedback; hintsUsed: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={feedback.verdict} score={feedback.score} />
        {feedback.thinking_pattern && feedback.thinking_pattern !== "none" && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/70">
            pattern: {feedback.thinking_pattern}
          </span>
        )}
        {hintsUsed > 0 && feedback.raw_score !== undefined && (
          <span className="text-xs text-white/45">
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
          className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
          style={{ borderLeft: `2px solid ${s.accent}` }}
        >
          <h4 className="label mb-1.5" style={{ color: s.accent }}>
            {s.title}
          </h4>
          <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-white/85">{String(feedback[s.key] ?? "")}</p>
        </motion.section>
      ))}
    </div>
  );
}
