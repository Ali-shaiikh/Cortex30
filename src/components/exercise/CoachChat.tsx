"use client";

import { useState } from "react";
import type { ChatTurn } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { RichText } from "../ui/RichText";

type Props = {
  id: string;
  title: string;
  note: string;
  placeholder: string;
  turns: ChatTurn[];
  max: number;
  /** Sends one question; resolves when the coach's reply has been added to `turns`. Rejects with a readable error. */
  onAsk: (question: string) => Promise<void>;
  disabled?: boolean;
  defaultOpen?: boolean;
};

/** A small conversation with the coach (used before answering and for follow-ups after feedback). */
export function CoachChat({ id, title, note, placeholder, turns, max, onAsk, disabled = false, defaultOpen = false }: Props) {
  // Open by default when there's a conversation (turns may load after the first render, e.g. a saved draft),
  // until the user toggles it themselves.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (defaultOpen || turns.length > 0);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const left = max - turns.length;

  async function send() {
    const q = question.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAsk(q);
      setQuestion("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-white/[0.035] p-4">
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setToggled(!open)} aria-expanded={open} aria-controls={id}>
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon name="transmission" size={14} className="text-neon" />
          {title}
          {turns.length > 0 && <span className="text-xs font-normal text-white/45">{turns.length}</span>}
        </span>
        <Icon name="chevronDown" className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={id} className="mt-3 space-y-3">
          <p className="text-xs text-white/45">{note}</p>
          {turns.map((t, i) => (
            <div key={i} className="space-y-2 text-[0.95rem]">
              <p className="ml-auto max-w-[90%] rounded-xl rounded-br-sm bg-white/[0.07] px-3 py-2 text-white/85 sm:max-w-[80%]">{t.question}</p>
              <div className="max-w-[95%] rounded-xl rounded-bl-sm border border-neon/15 bg-neon/[0.05] px-3 py-2 leading-relaxed text-white/90 sm:max-w-[85%]">
                <span className="mb-0.5 block text-[11px] font-semibold text-neon">Coach</span>
                <RichText text={t.answer} />
              </div>
            </div>
          ))}
          {left > 0 ? (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input className="field" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={placeholder} maxLength={800} disabled={disabled || busy} aria-label={title} />
              <button className="btn btn-ghost shrink-0" disabled={disabled || busy || question.trim().length < 3}>
                {busy ? "Thinking…" : "Ask"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-white/45">You&apos;ve used all {max} questions for this exercise.</p>
          )}
          {left > 0 && turns.length > 0 && <p className="text-[11px] text-white/35">{left} left · each question uses one coach call</p>}
          {error && (
            <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
