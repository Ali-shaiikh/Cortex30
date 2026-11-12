import "server-only";
import { z } from "zod";
import { AIError, getProvider } from "./ai/providers";
import type { BonusExercise, Category, Exercise, Feedback, Submission } from "./types";
import { CATEGORY_META } from "./types";

export { AIError };

const COACH = `You are the Cortex30 coach: a sharp, honest mentor who trains logic, analytical, critical and creative thinking.
Be direct and specific. No flattery, no filler, no emojis. Praise only what is genuinely good.
Always point at the exact step in the learner's own words when something went wrong (quote it briefly).
Teach the expert mental model step by step so the learner can reuse it.`;

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(raw.slice(start, end + 1));
}

/** Ask for JSON, validate with zod, retry once with the validation error. */
async function completeJson<T>(schema: z.ZodType<T>, system: string, prompt: string): Promise<T> {
  const provider = getProvider();
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await provider.complete({
      system,
      json: true,
      prompt: attempt === 0 ? prompt : `${prompt}\n\nYour previous reply was invalid (${lastError}). Reply again with ONLY the JSON object, matching the schema exactly.`,
    });
    try {
      return schema.parse(extractJson(text));
    } catch (error) {
      lastError = error instanceof z.ZodError ? error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : String(error);
    }
  }
  throw new AIError(`The coach returned malformed feedback twice (${lastError.slice(0, 200)}). Please try again.`);
}

const clip = (s: string, n = 4000) => (s.length > n ? `${s.slice(0, n)}…` : s);

// ---------------------------------------------------------------------------
// gradeAnswer
// ---------------------------------------------------------------------------

const feedbackBase = {
  score: z.coerce.number().min(0).max(10),
  what_you_got_right: z.string().min(1),
  where_your_thinking_went_wrong: z.string().min(1),
  how_to_think_about_it: z.string().min(1),
  thinking_pattern: z.string().min(1).max(60),
  transferable_lesson: z.string().min(1),
  try_this_next: z.string().min(1),
};
const objectiveSchema = z.object({ verdict: z.enum(["correct", "partially_correct", "incorrect"]), ...feedbackBase });
const creativeSchema = z.object({ verdict: z.enum(["strong", "developing", "weak"]), ...feedbackBase });

const GRADING_RULES: Record<Category, string> = {
  logic: `LOGIC: the answer is objective, but grade the REASONING too. Right answer + wrong or missing logic = "partially_correct" (score ≤ 6). Wrong answer = "incorrect" even if parts of the reasoning are good.`,
  analytical: `ANALYTICAL: grade the STRUCTURE (decomposition), stated ASSUMPTIONS and SANITY CHECKS, not one exact number. A different but defensible number with excellent structure can be "correct".`,
  critical: `CRITICAL: did they name the REAL flaw, and ask the right questions? Vague scepticism ("it might be biased") is not enough for "correct".`,
  creative: `CREATIVE: grade QUANTITY, ORIGINALITY (distance from the obvious ideas) and USEFULNESS. Verdict must be "strong", "developing" or "weak", never "incorrect". Always show concretely how to push further, including 2-3 example ideas they did not think of.`,
};

export type GradeInput = {
  exercise: Pick<Exercise, "title" | "prompt" | "reference_solution" | "rubric" | "category" | "concept">;
  answer: string;
  reasoning: string;
  confidence: number;
  pastPatterns: string[];
  previous?: { day: number; answer: string; reasoning: string; score: number; feedback?: string } | null;
};

export async function gradeAnswer(input: GradeInput): Promise<Feedback> {
  const { exercise, answer, reasoning, confidence, pastPatterns, previous } = input;
  const creative = exercise.category === "creative";
  const prompt = `Grade this Cortex30 exercise.

CATEGORY: ${exercise.category}
CONCEPT: ${exercise.concept}
TITLE: ${exercise.title}

PROMPT:
${exercise.prompt}

REFERENCE SOLUTION (for you, the coach):
${exercise.reference_solution}

RUBRIC:
${exercise.rubric}

GRADING RULES:
${GRADING_RULES[exercise.category]}
Score 0-10 must be consistent with the verdict and the rubric. Confidence is the learner's self-rating; mention calibration in "where_your_thinking_went_wrong" if confidence and quality are far apart.

LEARNER'S CONFIDENCE: ${confidence}%
LEARNER'S RECURRING THINKING PATTERNS (most frequent first): ${pastPatterns.length ? pastPatterns.join(", ") : "none yet"}
If this answer shows one of those patterns again, say so explicitly.
${
  previous
    ? `
THIS IS A REVISIT. The learner's earlier attempt (day ${previous.day}, score ${previous.score}/10):
EARLIER ANSWER: ${clip(previous.answer, 2000)}
EARLIER REASONING: ${clip(previous.reasoning, 2000)}
${previous.feedback ? `EARLIER COACH LESSON: ${clip(previous.feedback, 500)}` : ""}
Compare the old and new reasoning explicitly in "what_you_got_right" and "where_your_thinking_went_wrong": what improved, what is still missing.
`
    : ""
}
LEARNER'S ANSWER:
${clip(answer)}

LEARNER'S REASONING ("how I got there"):
${clip(reasoning)}

Reply with ONLY a JSON object:
{
  "verdict": ${creative ? `"strong" | "developing" | "weak"` : `"correct" | "partially_correct" | "incorrect"`},
  "score": number 0-10,
  "what_you_got_right": string,
  "where_your_thinking_went_wrong": string (quote or point at the exact step in THEIR reasoning; if nothing went wrong, say what would make it expert-level),
  "how_to_think_about_it": string (the expert's mental model, step by step, numbered),
  "thinking_pattern": string (short lowercase tag for the main flaw, e.g. "anchoring", "confirmation bias", "affirming the consequent", "stopped too early", "ignored base rates", "obvious ideas only"; use "none" only if the answer is genuinely excellent),
  "transferable_lesson": string (one reusable sentence),
  "try_this_next": string (a concrete 2-minute follow-up drill)
}`;
  const schema = (creative ? creativeSchema : objectiveSchema) as z.ZodType<Feedback>;
  const fb = await completeJson(schema, COACH, prompt);
  return { ...fb, score: Math.round(fb.score * 10) / 10, thinking_pattern: fb.thinking_pattern.trim().toLowerCase() };
}

// ---------------------------------------------------------------------------
// getHint: a Socratic question, never the answer
// ---------------------------------------------------------------------------

export async function getHint(input: {
  exercise: Pick<Exercise, "prompt" | "reference_solution" | "category" | "concept">;
  draftAnswer: string;
  draftReasoning: string;
  previousHints: string[];
}): Promise<string> {
  const text = await getProvider().complete({
    system: `${COACH}\nYou are giving a SOCRATIC HINT. Reply with ONE guiding question (max 40 words) that moves the learner one step forward. NEVER reveal the answer, the key insight's name, or any number from the solution.`,
    prompt: `EXERCISE (${input.exercise.category}, concept: ${input.exercise.concept}):
${input.exercise.prompt}

REFERENCE SOLUTION (secret, do not reveal):
${input.exercise.reference_solution}

LEARNER'S DRAFT ANSWER: ${clip(input.draftAnswer, 1500) || "(empty)"}
LEARNER'S DRAFT REASONING: ${clip(input.draftReasoning, 1500) || "(empty)"}
HINTS ALREADY GIVEN: ${input.previousHints.length ? input.previousHints.map((h, i) => `${i + 1}. ${h}`).join(" ") : "none"}

Write the next guiding question only. If hints were already given, go one step further than them.`,
    maxTokens: 1024,
  });
  return text.trim().replace(/^["']|["']$/g, "");
}

// ---------------------------------------------------------------------------
// Follow-up question (one per submission)
// ---------------------------------------------------------------------------

export async function answerFollowUp(input: {
  exercise: Pick<Exercise, "prompt" | "reference_solution" | "category">;
  submission: Pick<Submission, "answer" | "reasoning" | "feedback_json">;
  question: string;
}): Promise<string> {
  const fb = input.submission.feedback_json;
  return (
    await getProvider().complete({
      system: `${COACH}\nAnswer the learner's single follow-up question about your feedback in at most 180 words. Be concrete and use their answer as the example.`,
      prompt: `EXERCISE:\n${input.exercise.prompt}\n\nREFERENCE SOLUTION:\n${input.exercise.reference_solution}\n\nLEARNER ANSWER:\n${clip(input.submission.answer, 2000)}\n\nLEARNER REASONING:\n${clip(input.submission.reasoning, 2000)}\n\nYOUR FEEDBACK: verdict ${fb.verdict}, score ${fb.score}. Went wrong: ${fb.where_your_thinking_went_wrong} How to think: ${fb.how_to_think_about_it}\n\nFOLLOW-UP QUESTION:\n${clip(input.question, 800)}`,
      maxTokens: 2048,
    })
  ).trim();
}

// ---------------------------------------------------------------------------
// generateBonus: one targeted drill for the most frequent thinking pattern
// ---------------------------------------------------------------------------

const bonusSchema = z.object({
  title: z.string().min(1).max(80),
  concept: z.string().min(1).max(60),
  prompt: z.string().min(1),
  reference_solution: z.string().min(1),
  rubric: z.string().min(1),
});

export async function generateBonus(input: { pattern: string; category: Category; day: number; recentTitles: string[] }): Promise<BonusExercise> {
  const out = await completeJson(
    bonusSchema,
    COACH,
    `Create ONE short bonus exercise (5 minutes) in the ${CATEGORY_META[input.category].label.toUpperCase()} skill that directly trains against the thinking pattern "${input.pattern}".
The learner is on day ${input.day} of 30, so pitch the difficulty accordingly. It must be original, self-contained and gradeable, and different from these recent exercises: ${input.recentTitles.join("; ") || "none"}.

Reply with ONLY JSON:
{"title": string, "concept": string (the thinking tool it teaches), "prompt": string, "reference_solution": string, "rubric": string, "target_pattern": "${input.pattern}"}`,
  );
  return { ...out, category: input.category, target_pattern: input.pattern };
}

// ---------------------------------------------------------------------------
// writeReport (weekly + final) and writeSummary ("where you stand")
// ---------------------------------------------------------------------------

export type ReportStats = {
  dayNumber: number;
  completed: number;
  streak: number;
  mastery: Record<string, { level: string; avg: number | null; averageScore: number | null }>;
  calibration: { category: string; label: string; confidence: number; accuracy: number }[];
  fingerprint: { pattern: string; count: number; fixed: boolean }[];
  trend: string;
  recent: { day: number; category: string; title: string; verdict: string; score: number; pattern: string | null; lesson?: string }[];
};

const statsBlock = (s: ReportStats) => `DAY: ${s.dayNumber}/30 · COMPLETED: ${s.completed}/120 · STREAK: ${s.streak}
MASTERY: ${Object.entries(s.mastery).map(([k, v]) => `${k} ${v.level} (last-5 avg ${v.avg?.toFixed(1) ?? "-"}, all-time ${v.averageScore?.toFixed(1) ?? "-"})`).join("; ")}
CALIBRATION: ${s.calibration.map((c) => `${c.category}: ${c.label} (conf ${c.confidence}% vs score ${c.accuracy}%)`).join("; ")}
THINKING PATTERNS: ${s.fingerprint.slice(0, 6).map((f) => `${f.pattern} ×${f.count}${f.fixed ? " (fixed)" : ""}`).join(", ") || "none"}
TREND: ${s.trend}
SUBMISSIONS:
${s.recent.map((r) => `- D${r.day} ${r.category} "${r.title}": ${r.verdict} ${r.score}/10${r.pattern ? ` [${r.pattern}]` : ""}${r.lesson ? ` · lesson: ${r.lesson}` : ""}`).join("\n")}`;

export async function writeReport(input: { kind: "weekly" | "final"; week?: number; stats: ReportStats }): Promise<string> {
  const task =
    input.kind === "weekly"
      ? `Write the WEEK ${input.week} coach report (days ${(input.week! - 1) * 7 + 1}-${input.week! * 7}). Sections in Markdown: "## Patterns" (recurring thinking habits, good and bad, with evidence), "## Wins" (specific), "## Focus for next week" (2-3 concrete practices). Max 300 words.`
      : `Write the FINAL 30-day review. Sections in Markdown: "## Where you started", "## How your thinking changed" (cite specific days and scores, especially the day 30 revisits vs day 1), "## Your strongest and weakest skill", "## Patterns you fixed / still carry", "## Your next 30 days". Max 450 words.`;
  return (await getProvider().complete({ system: COACH, prompt: `${task}\n\n${statsBlock(input.stats)}`, maxTokens: 4096 })).trim();
}

export async function writeSummary(stats: ReportStats): Promise<string> {
  return (
    await getProvider().complete({
      system: COACH,
      prompt: `Write a "where you stand" summary for the top of the learner's progress page: 3-4 sentences, plain text, no headings. Name the strongest skill, the weakest skill, the most important habit to fix (from the thinking patterns), and one specific thing to do tomorrow.\n\n${statsBlock(stats)}`,
      maxTokens: 1024,
    })
  ).trim();
}
