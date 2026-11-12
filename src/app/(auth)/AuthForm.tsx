"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { startDive, stopDive } from "@/components/brain/store";
import type { AuthState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
};

export function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [diving, setDiving] = useState(false);
  const isSignup = mode === "signup";

  // While the server checks the credentials, the camera dives into the brain.
  useEffect(() => {
    if (pending) {
      startDive();
    } else {
      stopDive();
    }
  }, [pending]);

  return (
    <>
      <form
        action={formAction}
        onSubmit={() => setDiving(true)}
        className="glass-strong w-full max-w-sm space-y-5 p-7 shadow-[0_0_80px_-20px_rgba(111,231,255,0.35)]"
      >
        <div>
          <p className="label">{isSignup ? "// new subject" : "// returning subject"}</p>
          <h1 className="display neon mt-1 text-xl font-bold">{isSignup ? "Initialise brain" : "Neural link"}</h1>
          <p className="mt-1 font-read text-sm text-cyan-100/55">
            {isSignup ? "Day 1 begins the moment you sync. No email, no trace." : "Authenticate to resume synaptic training."}
          </p>
        </div>
        {next && <input type="hidden" name="next" value={next} />}
        <label className="block space-y-1.5">
          <span className="label">Neural ID</span>
          <input
            name="username"
            className="field font-mono"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.username}
            placeholder="your_username"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]{3,20}"
            title="3-20 characters: letters, numbers or _"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="label">Passkey</span>
          <input
            name="password"
            type="password"
            className="field font-mono"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••"
            required
            minLength={8}
          />
        </label>
        {state.error && (
          <p role="alert" className="border-l-2 border-magenta bg-magenta/10 px-3 py-2 font-mono text-xs text-pink-100">
            ⚠ ACCESS DENIED · {state.error}
          </p>
        )}
        <button className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Syncing…" : isSignup ? "Sync my brain" : "Jack in"}
        </button>
        <p className="text-center text-sm text-cyan-100/55">
          {isSignup ? "Already synced? " : "No neural ID? "}
          <Link className="font-semibold text-neon hover:underline" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Jack in" : "Initialise one"}
          </Link>
        </p>
      </form>

      {/* Portal: the panel is transformed by its slide animation, which would trap a fixed overlay. */}
      {typeof document !== "undefined" && createPortal(<AnimatePresence>{diving && pending && <BigBang />}</AnimatePresence>, document.body)}
    </>
  );
}

/** Full-screen flash: light bursts from the centre while the brain zooms in. */
function BigBang() {
  return (
    <motion.div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="absolute rounded-full"
        style={{ background: "radial-gradient(circle, #ffffff 0%, #bff8ff 18%, rgba(111,231,255,0.5) 40%, rgba(255,61,187,0.25) 60%, transparent 72%)" }}
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: "260vmax", height: "260vmax", opacity: [1, 1, 0.9] }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-neon/70"
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{ width: "120vmax", height: "120vmax", opacity: 0 }}
          transition={{ duration: 1.4, delay: i * 0.18, ease: "easeOut" }}
        />
      ))}
      <motion.p className="display neon relative text-sm tracking-[0.4em]" initial={{ opacity: 0, letterSpacing: "0.1em" }} animate={{ opacity: [0, 1, 1, 0], letterSpacing: "0.5em" }} transition={{ duration: 1.8 }}>
        Establishing neural link
      </motion.p>
    </motion.div>
  );
}
