export const CATEGORIES = ["logic", "analytical", "critical", "creative"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { label: string; color: string; region: string }> = {
  logic: { label: "Logic", color: "#5b9cff", region: "Left frontal" },
  analytical: { label: "Analytical", color: "#2ec4a0", region: "Left parietal" },
  critical: { label: "Critical", color: "#ff8a4c", region: "Right frontal" },
  creative: { label: "Creative", color: "#c77dff", region: "Right parietal" },
};

export type Exercise = {
  id: string;
  day: number;
  category: Category;
  title: string;
  prompt: string;
  reference_solution: string;
  rubric: string;
  minutes: number;
  concept: string;
  /** Exercise id whose earlier submission the coach should compare against (days 29/30). */
  revisit_of?: string;
};

export type Verdict = "correct" | "partially_correct" | "incorrect" | "strong" | "developing" | "weak";

export type Feedback = {
  verdict: Verdict;
  score: number;
  what_you_got_right: string;
  where_your_thinking_went_wrong: string;
  how_to_think_about_it: string;
  thinking_pattern: string;
  transferable_lesson: string;
  try_this_next: string;
};

/** What we store in submissions.feedback_json. */
export type StoredFeedback = Feedback & {
  raw_score?: number;
  followup?: { question: string; answer: string; at: string };
  /** For bonus exercises the generated prompt is stored alongside the feedback. */
  bonus?: BonusExercise;
};

export type Submission = {
  id: string;
  user_id: string;
  day: number;
  category: Category;
  answer: string;
  reasoning: string;
  confidence: number;
  verdict: Verdict;
  score: number;
  feedback_json: StoredFeedback;
  thinking_pattern: string | null;
  hints_used: number;
  is_bonus: boolean;
  created_at: string;
};

export type ReportKind = "weekly" | "summary" | "bonus" | "final";

export type Report = {
  id: string;
  user_id: string;
  kind: ReportKind;
  week: number | null;
  text: string;
  created_at: string;
};

export type BonusExercise = {
  title: string;
  category: Category;
  concept: string;
  prompt: string;
  reference_solution: string;
  rubric: string;
  target_pattern: string;
};

export type Profile = {
  id: string;
  username: string;
  start_date: string;
  created_at: string;
};
