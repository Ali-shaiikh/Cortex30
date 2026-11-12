"use client";

import { useEffect } from "react";

/** Catches unexpected errors inside the signed-in app without losing the header. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="glass mx-auto mt-16 max-w-md p-8 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-magenta">SIGNAL LOST</p>
      <h1 className="display neon mt-2 text-xl font-bold">Something misfired</h1>
      <p className="mt-2 font-read text-sm text-cyan-50/60">Your progress is safe. Try again, or reload the page if it keeps happening.</p>
      {error.digest && <p className="mt-2 font-mono text-[10px] text-cyan-100/30">ref {error.digest}</p>}
      <button onClick={reset} className="btn btn-primary mt-5">
        Retry
      </button>
    </div>
  );
}
