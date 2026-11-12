"use client";

import { motion } from "framer-motion";
import type { StoredFeedback } from "@/lib/types";
import { VerdictBadge } from "../ui/VerdictBadge";

const SECTIONS: { key: keyof StoredFeedback; title: string; sub: string; accent: string }[] = [
  { key: "what_you_got_right", title: "Signal confirmed", sub: "what you got right", accent: "#2ec4a0" },
  { key: "where_your_thinking_went_wrong", title: "Fault detected", sub: "where your thinking went wrong", accent: "#ff8a4c" },
  { key: "how_to_think_about_it", title: "Expert model", sub: "how to think about it", accent: "#6fe7ff" },
  { key: "transferable_lesson", title: "Rewire", sub: "transferable lesson", accent: "#c77dff" },
  { key: "try_this_next", title: "Next drill", sub: "2-minute follow-up", accent: "#ff3dbb" },
];

export function FeedbackView({ feedback, hintsUsed }: { feedback: StoredFeedback; hintsUsed: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={feedback.verdict} score={feedback.score} />
        {feedback.thinking_pattern && feedback.thinking_pattern !== "none" && (
          <span className="border border-magenta/30 bg-magenta/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-pink-100">
            ⌬ pattern: {feedback.thinking_pattern}
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
          className="border border-neon/[0.08] bg-black/30 p-4"
          style={{ borderLeft: `2px solid ${s.accent}` }}
        >
          <h4 className="mb-1.5 flex items-baseline gap-2">
            <span className="display text-[11px] font-bold" style={{ color: s.accent }}>
              {s.title}
            </span>
            <span className="label">{`// ${s.sub}`}</span>
          </h4>
          <p className="whitespace-pre-line font-read text-[0.93rem] leading-relaxed text-cyan-50/85">{String(feedback[s.key] ?? "")}</p>
        </motion.section>
      ))}
    </div>
  );
}
