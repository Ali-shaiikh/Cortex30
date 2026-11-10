"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
};

export function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="glass-strong w-full max-w-sm space-y-5 p-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isSignup ? "Start your 30 days" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-white/55">
          {isSignup ? "Today becomes Day 1. No email needed." : "Log in to continue your program."}
        </p>
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block space-y-1.5">
        <span className="label">Username</span>
        <input
          name="username"
          className="field font-mono"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username}
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]{3,20}"
          title="3-20 characters: letters, numbers or _"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="label">Password</span>
        <input
          name="password"
          type="password"
          className="field"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={8}
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "One moment…" : isSignup ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-white/55">
        {isSignup ? "Already training? " : "New here? "}
        <Link className="text-rim hover:underline" href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
