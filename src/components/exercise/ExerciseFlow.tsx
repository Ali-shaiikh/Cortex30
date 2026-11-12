"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { celebrate } from "@/components/brain/store";
import { CATEGORY_META, followupsOf, MAX_CLARIFICATIONS, MAX_FOLLOWUPS, type ChatTurn, type ExercisePublic, type Submission } from "@/lib/types";
import { CoachChat } from "./CoachChat";
import { FeedbackView } from "./FeedbackView";
import { GradingProgress } from "./GradingProgress";
import { Icon } from "../ui/Icon";

type Props = {
  exercise: ExercisePublic;
  submission: Submission | null;
  locked: string | null; // reason, or null when open
  bonus?: boolean;
  /** True when submitting this exercise would complete the whole day. */
  completesDay?: boolean;
};

// `chat` holds "ask about this question" turns; kept with the draft so it survives a reload.
type Draft = { confidence: number | null; answer: string; reasoning: string; hints: string[]; chat: ChatTurn[] };
const EMPTY: Draft = { confidence: null, answer: "", reasoning: "", hints: [], chat: [] };

function loadDraft(key: string): Draft {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function ExerciseFlow({ exercise, submission: initial, locked, bonus = false, completesDay = false }: Props) {
  const router = useRouter();
  const meta = CATEGORY_META[exercise.category];
  const draftKey = `mg-draft-${bonus ? "bonus" : exercise.category}-${exercise.day}`;
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [localSubmission, setSubmission] = useState<Submission | null>(null);
  const submission = localSubmission ?? initial;
  const [busy, setBusy] = useState<null | "hint" | "grade">(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Drafts live in localStorage, which only exists after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(loadDraft(draftKey)), [draftKey]);
  useEffect(() => {
    if (submission) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {}
  }, [draft, draftKey, submission]);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
    return json as T;
  }

  async function askHint() {
    setBusy("hint");
    setError(null);
    try {
      const { hint } = await post<{ hint: string }>("/api/hint", {
        category: exercise.category,
        day: exercise.day,
        answer: draft.answer,
        reasoning: draft.reasoning,
        previousHints: draft.hints,
        bonus,
      });
      update({ hints: [...draft.hints, hint] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    setConfirming(false);
    setBusy("grade");
    setError(null);
    try {
      const { submission } = await post<{ submission: Submission }>("/api/grade", {
        category: exercise.category,
        day: exercise.day,
        answer: draft.answer,
        reasoning: draft.reasoning,
        confidence: draft.confidence,
        hintsUsed: draft.hints.length,
        bonus,
      });
      setSubmission(submission);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      if (!bonus) {
        celebrate({ category: exercise.category, day: exercise.day, score: submission.score, verdict: submission.verdict, dayComplete: completesDay });
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function askClarification(question: string) {
    const { turn } = await post<{ turn: ChatTurn }>("/api/clarify", { category: exercise.category, day: exercise.day, bonus, question, history: draft.chat });
    setDraft((d) => ({ ...d, chat: [...d.chat, turn] }));
  }

  async function askFollowUp(question: string) {
    if (!submission) return;
    const res = await post<{ followup: ChatTurn; warning?: string }>("/api/followup", { submissionId: submission.id, question });
    const followups = [...followupsOf(submission.feedback_json), res.followup];
    setSubmission({ ...submission, feedback_json: { ...submission.feedback_json, followups } });
    if (res.warning) setError(res.warning);
    router.refresh();
  }

  const ready = draft.confidence !== null && draft.answer.trim().length > 0 && draft.reasoning.trim().length > 0;

  return (
    <article className="focus-panel overflow-hidden">
      <div className="h-1 w-full" style={{ background: meta.color, opacity: 0.8 }} />
      <div className="space-y-5 p-5 sm:p-6">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
            <span className="font-semibold" style={{ color: meta.color }}>{bonus ? `Weak-spot drill · ${meta.label}` : meta.label}</span>
            <span className="text-white/45">Day {exercise.day}</span>
            <span className="text-white/45">~{exercise.minutes} min</span>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-white/70">
              <Icon name="chip" size={11} className="mr-1" />
              {exercise.concept}
            </span>
            {exercise.tuning && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${exercise.tuning === "harder" ? "bg-amber-300/10 text-amber-100" : "bg-sky-300/10 text-sky-100"}`}
                title="Cortex30 picks each exercise from your recent scores in this skill"
              >
                Calibrated: {exercise.tuning}
              </span>
            )}
          </div>
          <h2 className="display text-xl font-semibold text-white sm:text-2xl">{exercise.title}</h2>
        </header>

        <div className="whitespace-pre-line rounded-xl bg-white/[0.035] p-5 text-[1.02rem] leading-[1.7] text-[#eef2f7]">{exercise.prompt}</div>

        {!locked && !submission && (
          <CoachChat
            id={`clarify-${draftKey}`}
            title="Ask about this question"
            note="Not sure what's being asked? The coach explains the question, terms and format, but won't give away the answer. Costs no points."
            placeholder="e.g. What does 'valid' mean here?"
            turns={draft.chat}
            max={MAX_CLARIFICATIONS}
            onAsk={askClarification}
            disabled={busy !== null}
          />
        )}

        {locked && !submission && (
          <p className="rounded-xl bg-white/[0.035] p-4 text-sm text-white/60">
            <Icon name="lock" size={12} className="mr-1.5" />
            Locked · {locked}
          </p>
        )}

        {!locked && !submission && (
          <div className="space-y-5">
            {/* 1. Confidence */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor={`conf-${draftKey}`} className="label">
                  How confident are you that you&apos;ll get this right?
                </label>
                <span className="font-mono text-sm" style={{ color: meta.color }}>
                  {draft.confidence === null ? "-" : `${draft.confidence}%`}
                </span>
              </div>
              <input
                id={`conf-${draftKey}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft.confidence ?? 50}
                onChange={(e) => update({ confidence: Number(e.target.value) })}
                onClick={(e) => update({ confidence: Number((e.target as HTMLInputElement).value) })}
                className="confidence"
                style={{ ["--skill" as string]: meta.color, ["--pct" as string]: `${draft.confidence ?? 50}%` }}
              />
              {draft.confidence === null && <p className="text-xs text-white/45">Set your confidence before you answer.</p>}
            </div>

            <AnimatePresence>
              {draft.confidence !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-5">
                  <label className="block space-y-2">
                    <span className="label">Your answer</span>
                    <textarea className="field min-h-28 resize-y" value={draft.answer} onChange={(e) => update({ answer: e.target.value })} placeholder="Your answer…" maxLength={8000} />
                  </label>
                  <label className="block space-y-2">
                    <span className="label">Your reasoning: how did you get there?</span>
                    <textarea className="field min-h-36 resize-y" value={draft.reasoning} onChange={(e) => update({ reasoning: e.target.value })} placeholder="Walk through your steps, assumptions and checks…" maxLength={8000} />
                  </label>

                  {draft.hints.length > 0 && (
                    <div className="space-y-2">
                      {draft.hints.map((h, i) => (
                        <p key={i} className="rounded-xl bg-white/[0.04] p-3 text-[0.95rem] text-white/90">
                          <span className="mr-2 text-xs font-semibold text-neon">Hint {i + 1}</span>
                          {h.replace(/\*\*/g, "")}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="btn btn-ghost" onClick={askHint} disabled={busy !== null || draft.hints.length >= 3}>
                      {busy === "hint" ? "Thinking…" : "Get a hint (−1 pt)"}
                    </button>
                    <button type="button" className="btn btn-primary ml-auto" disabled={!ready || busy !== null} onClick={() => setConfirming(true)}>
                      {busy === "grade" ? "Analysing…" : "Submit & lock"}
                    </button>
                  </div>
                  {confirming && (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm">
                      <span className="text-amber-100">
                        <Icon name="alert" size={12} className="mr-1.5" />
                        Your answer locks permanently once you submit.
                      </span>
                      <button type="button" className="btn btn-primary ml-auto py-1.5" onClick={submit}>
                        Lock it in
                      </button>
                      <button type="button" className="btn btn-ghost py-1.5" onClick={() => setConfirming(false)}>
                        Keep thinking
                      </button>
                    </div>
                  )}
                  {busy === "grade" && <GradingProgress />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {submission && (
          <div className="space-y-5">
            <details className="group rounded-xl bg-white/[0.035] p-4" open={false}>
              <summary className="flex cursor-pointer items-center justify-between text-sm text-white/70">
                <span>
                  <Icon name="memory" size={12} className="mr-1.5" />
                  Your locked answer · confidence {submission.confidence}%
                </span>
                <Icon name="chevronDown" className="text-cyan-100/40 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-3 font-read text-sm">
                <div>
                  <div className="label mb-1">Answer</div>
                  <p className="whitespace-pre-line text-white/85">{submission.answer}</p>
                </div>
                <div>
                  <div className="label mb-1">Reasoning</div>
                  <p className="whitespace-pre-line text-white/85">{submission.reasoning}</p>
                </div>
              </div>
            </details>

            <FeedbackView feedback={submission.feedback_json} hintsUsed={submission.hints_used} />

            <CoachChat
              id={`followup-${draftKey}`}
              title="Ask the coach a follow-up"
              note={`Still unsure about the feedback? Ask up to ${MAX_FOLLOWUPS} follow-up questions; the coach remembers this conversation.`}
              placeholder="e.g. Why doesn't my second step hold?"
              turns={followupsOf(submission.feedback_json)}
              max={MAX_FOLLOWUPS}
              onAsk={askFollowUp}
              defaultOpen
            />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
