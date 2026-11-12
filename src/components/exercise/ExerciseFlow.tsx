"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { celebrate } from "@/components/brain/store";
import { CATEGORY_META, type ExercisePublic, type StoredFeedback, type Submission } from "@/lib/types";
import { FeedbackView } from "./FeedbackView";

type Props = {
  exercise: ExercisePublic;
  submission: Submission | null;
  locked: string | null; // reason, or null when open
  bonus?: boolean;
  /** True when submitting this exercise would complete the whole day. */
  completesDay?: boolean;
};

type Draft = { confidence: number | null; answer: string; reasoning: string; hints: string[] };
const EMPTY: Draft = { confidence: null, answer: "", reasoning: "", hints: [] };

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
  const [busy, setBusy] = useState<null | "hint" | "grade" | "followup">(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [question, setQuestion] = useState("");

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

  async function sendFollowUp() {
    if (!submission) return;
    setBusy("followup");
    setError(null);
    try {
      const { followup } = await post<{ followup: StoredFeedback["followup"] }>("/api/followup", { submissionId: submission.id, question });
      setSubmission({ ...submission, feedback_json: { ...submission.feedback_json, followup } });
      setQuestion("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const ready = draft.confidence !== null && draft.answer.trim().length > 0 && draft.reasoning.trim().length > 0;

  return (
    <article className="glass overflow-hidden" style={{ boxShadow: `inset 0 1px 0 ${meta.color}22` }}>
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />
      <div className="space-y-5 p-5 sm:p-6">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider">
            <span style={{ color: meta.color }}>{bonus ? `Weak spot drill · ${meta.label} cortex` : `${meta.label} cortex`}</span>
            <span className="text-cyan-100/40">S{String(exercise.day).padStart(2, "0")}</span>
            <span className="text-cyan-100/40">~{exercise.minutes} min</span>
            <span className="border border-neon/20 px-2 py-0.5 text-neon/80">⌁ {exercise.concept}</span>
          </div>
          <h2 className="display text-lg font-bold text-cyan-50 sm:text-xl">{exercise.title}</h2>
        </header>

        <div className="whitespace-pre-line border-l-2 bg-black/30 p-4 font-read text-[0.95rem] leading-relaxed text-cyan-50/90" style={{ borderColor: meta.color }}>
          <div className="label mb-2">{"// incoming problem"}</div>
          {exercise.prompt}
        </div>

        {locked && !submission && (
          <p className="border border-cyan-100/10 bg-black/30 p-4 font-mono text-xs uppercase tracking-wider text-cyan-100/60">⛒ Synapse locked · {locked}</p>
        )}

        {!locked && !submission && (
          <div className="space-y-5">
            {/* 1. Confidence */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor={`conf-${draftKey}`} className="label">
                  01 // Confidence signal: how sure are you?
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
              {draft.confidence === null && <p className="font-mono text-[11px] text-cyan-100/40">Calibrate the slider before you answer.</p>}
            </div>

            <AnimatePresence>
              {draft.confidence !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-5">
                  <label className="block space-y-2">
                    <span className="label">02 // Output: your answer</span>
                    <textarea className="field min-h-28 resize-y" value={draft.answer} onChange={(e) => update({ answer: e.target.value })} placeholder="> type your answer…" maxLength={8000} />
                  </label>
                  <label className="block space-y-2">
                    <span className="label">03 // Reasoning trace: how did you get there?</span>
                    <textarea className="field min-h-36 resize-y" value={draft.reasoning} onChange={(e) => update({ reasoning: e.target.value })} placeholder="> walk through your steps, assumptions and checks…" maxLength={8000} />
                  </label>

                  {draft.hints.length > 0 && (
                    <div className="space-y-2">
                      {draft.hints.map((h, i) => (
                        <p key={i} className="border-l-2 border-magenta bg-magenta/[0.07] p-3 font-read text-sm text-cyan-50/90">
                          <span className="mr-2 font-mono text-[11px] text-magenta">PING {i + 1}</span>
                          {h}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="btn btn-ghost" onClick={askHint} disabled={busy !== null || draft.hints.length >= 3}>
                      {busy === "hint" ? "Pinging coach…" : "Socratic ping (−1 pt)"}
                    </button>
                    <button type="button" className="btn btn-primary ml-auto" disabled={!ready || busy !== null} onClick={() => setConfirming(true)}>
                      {busy === "grade" ? "Analysing thought pattern…" : "Commit to memory"}
                    </button>
                  </div>
                  {confirming && (
                    <div className="flex flex-wrap items-center gap-3 border border-magenta/40 bg-magenta/10 p-3 text-sm">
                      <span className="font-mono text-xs uppercase tracking-wider text-pink-100">⚠ Committed memories are permanent.</span>
                      <button type="button" className="btn btn-primary ml-auto py-1.5" onClick={submit}>
                        Commit
                      </button>
                      <button type="button" className="btn btn-ghost py-1.5" onClick={() => setConfirming(false)}>
                        Keep thinking
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {submission && (
          <div className="space-y-5">
            <details className="group border border-neon/10 bg-black/30 p-4" open={false}>
              <summary className="flex cursor-pointer items-center justify-between font-mono text-xs uppercase tracking-wider text-cyan-100/70">
                <span>
                  ▣ Archived memory · confidence {submission.confidence}%
                </span>
                <span className="text-white/40 group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-3 space-y-3 font-read text-sm">
                <div>
                  <div className="label mb-1">Answer</div>
                  <p className="whitespace-pre-line text-cyan-50/85">{submission.answer}</p>
                </div>
                <div>
                  <div className="label mb-1">Reasoning</div>
                  <p className="whitespace-pre-line text-cyan-50/85">{submission.reasoning}</p>
                </div>
              </div>
            </details>

            <FeedbackView feedback={submission.feedback_json} hintsUsed={submission.hints_used} />

            <div className="border border-neon/10 bg-black/30 p-4">
              {submission.feedback_json.followup ? (
                <div className="space-y-2 font-read text-sm">
                  <p className="text-white/60">
                    <span className="label mr-2">› you</span>
                    {submission.feedback_json.followup.question}
                  </p>
                  <p className="whitespace-pre-line leading-relaxed text-white/85">
                    <span className="label mr-2 !text-neon">› coach</span>
                    {submission.feedback_json.followup.answer}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor={`fu-${draftKey}`} className="label">
{"// One query to the coach"}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input id={`fu-${draftKey}`} className="field" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="> e.g. why doesn't my second step hold?" maxLength={800} />
                    <button className="btn btn-ghost shrink-0" disabled={question.trim().length < 3 || busy !== null} onClick={sendFollowUp}>
                      {busy === "followup" ? "Transmitting…" : "Transmit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="border-l-2 border-magenta bg-magenta/10 px-3 py-2 font-mono text-xs text-pink-100">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
